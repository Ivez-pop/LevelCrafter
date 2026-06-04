# Database Design

## Overview

LevelCrafter uses Supabase PostgreSQL as the persistent foundation for multiplayer scoring, gameplay records, per-level leaderboards, and global rankings.

The current implementation is defined by `supabase/migrations/001_leaderboards.sql`, `src/types/supabase.ts`, and the service modules under `src/services`.

The database supports:

- Authentication compatibility through stable `users.id` UUID references. Authentication flows are not implemented in this layer.
- Player profile fields through `users.username`, `users.display_name`, and `users.avatar_url`.
- Gameplay history through append-only `play_sessions` records.
- Per-level leaderboards through one `best_scores` row per `(user_id, level_id)`.
- Global rankings through the `global_rankings` view, which sums each user's best score per completed level.

## Architecture Overview

```text
Frontend
    |
    v
Services
    |
    v
Supabase
```

React components should not call Supabase directly. UI code should call service functions, and service functions own persistence, leaderboard reads, score updates, and ranking reads.

Current Supabase access is centralized through `getSupabaseClient()` in `src/lib/supabase.ts`. It requires:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Leaderboard and ranking flow:

```text
Completed run data
      |
      v
gameplayService
      |
      v
play_sessions + best_scores
      |
      v
leaderboardService / rankingService
      |
      v
Leaderboard or ranking UI
```

## Entity Relationship Diagram

```text
users
  |
  | owner_id
  v
levels

users
  |
  | user_id
  v
play_sessions
  |
  | level_id
  v
levels

users + levels
  |
  | unique (user_id, level_id)
  v
best_scores
  |
  | play_session_id
  v
play_sessions

best_scores
  |
  v
global_rankings view
```

## Tables

### users

Purpose: Stores player/profile records used by scores, ownership, and future profile UI.

Important fields:

- `id uuid primary key`
- `username text unique`
- `display_name text`
- `avatar_url text`
- `created_at timestamptz`
- `updated_at timestamptz`

Relationships:

- Referenced by `levels.owner_id`
- Referenced by `play_sessions.user_id`
- Referenced by `best_scores.user_id`

### levels

Purpose: Stores persistent level metadata and ownership for Supabase-backed ranking data.

Important fields:

- `id text primary key`
- `owner_id uuid references users(id) on delete set null`
- `name text`
- `difficulty text`
- `width integer`
- `height integer`
- `metadata jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Relationships:

- Owned by `users` through `owner_id`
- Referenced by `play_sessions.level_id`
- Referenced by `best_scores.level_id`

### play_sessions

Purpose: Stores every completed run. These rows are gameplay history and are not overwritten by best score updates.

Important fields:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references users(id) on delete cascade`
- `level_id text references levels(id) on delete cascade`
- `score integer check (score >= 0)`
- `moves integer check (moves >= 0)`
- `time_seconds integer check (time_seconds >= 0)`
- `completed_at timestamptz`
- `metadata jsonb`

Relationships:

- Belongs to one user.
- Belongs to one level.
- May be referenced by `best_scores.play_session_id` when that session produced the current best score.

Indexes:

- `(level_id, completed_at desc)`
- `(user_id, completed_at desc)`

### best_scores

Purpose: Stores one best score per user per level. This table powers per-level leaderboards and global rankings.

Important fields:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references users(id) on delete cascade`
- `level_id text references levels(id) on delete cascade`
- `best_score integer check (best_score >= 0)`
- `moves integer check (moves >= 0)`
- `time_seconds integer check (time_seconds >= 0)`
- `play_session_id uuid references play_sessions(id) on delete set null`
- `achieved_at timestamptz`
- `updated_at timestamptz`

Relationships:

- Belongs to one user.
- Belongs to one level.
- Optionally points to the play session that achieved the best score.

Constraints:

- `unique (user_id, level_id)` prevents duplicate leaderboard entries for the same player on the same level.

Indexes:

- `(level_id, best_score desc, time_seconds asc)`
- `(user_id)`

## Views and Functions

### global_rankings

Purpose: Aggregates global ranking totals from `best_scores`.

Fields:

- `user_id`
- `username`
- `display_name`
- `global_score`
- `completed_maps`

Calculation:

```text
global_score = sum(best_scores.best_score)
completed_maps = count(best_scores.level_id)
```

Because the view reads from `best_scores`, repeated runs on the same level do not create multiple global score contributions.

### record_completed_run

Purpose: Atomically inserts a completed run into `play_sessions` and updates `best_scores` only when the new score is higher.

Parameters:

- `p_user_id`
- `p_level_id`
- `p_score`
- `p_moves`
- `p_time_seconds`
- `p_completed_at`
- `p_metadata`

Return value:

- JSON object containing `session` and `bestScore` using frontend-style camelCase field names.

## Shared Identifiers

### userId

Maps to `users.id`.

Purpose:

- Stable player identity for sessions, best scores, leaderboards, and rankings.
- Integration point for future authentication and profile work.

Ownership:

- Teammate 1 owns authentication and profile lifecycle.
- Teammate 2 consumes `userId` for score and ranking records.

### levelId

Maps to `levels.id`.

Purpose:

- Stable level identity for play sessions, best scores, and leaderboard queries.
- Per-level leaderboards must query by `levelId`, not difficulty.

Ownership:

- Level creation/loading remains existing MVP behavior.
- Supabase ranking records require matching persistent level IDs.

### sessionId

Maps to `play_sessions.id`.

Purpose:

- Unique completed-run record.
- Preserves gameplay history.
- Can be referenced by `best_scores.play_session_id` when that session produced the current best score.

Ownership:

- Created by gameplay record services or the `record_completed_run` RPC.

## Ownership Boundaries

### Teammate 1

Owns:

- Authentication
- Users
- Profiles
- Play History UI
- Global Ranking UI

Shared integration points:

- Provides authenticated `userId`.
- Reads `users.username` and `users.display_name` through service outputs.
- May consume `play_sessions` for future play history UI.

### Teammate 2

Owns:

- Gameplay Records
- Best Scores
- Scoring
- Per-Level Leaderboards
- Global Ranking Engine

Shared integration points:

- Consumes `userId` from authentication.
- Consumes `levelId` from level records.
- Exposes typed service outputs for UI teams.

## Gameplay Record Flow

Actual implementation supports two persistence paths.

Preferred atomic path:

```text
Level Complete
      |
      v
recordCompletedRun(run)
      |
      v
Supabase RPC: record_completed_run
      |
      v
Insert play_sessions row
      |
      v
Insert or update best_scores if score is higher
      |
      v
Return { session, bestScore }
```

Direct service path:

```text
Level Complete
      |
      v
storeGameplaySession(run)
      |
      v
Insert play_sessions row
      |
      v
updateBestScore(run, session.id)
      |
      v
Return { session, bestScore }
```

Score calculation is available in `calculateCompletionScore()`:

```text
score = max(0, baseScore + coinBonus - movePenalty - timePenalty)
coinBonus = coinsCollected * 100
movePenalty = moves * 5
timePenalty = timeSeconds * 2
baseScore default = 1000
```

The current services expect completed run inputs to include `score`, `moves`, `timeSeconds`, `userId`, and `levelId`.

## Per-Level Leaderboard Logic

Per-level leaderboards are generated from `best_scores`.

Rules implemented:

- Query by `levelId`.
- Each user can appear only once per level because of `unique (user_id, level_id)`.
- `best_scores` updates only when the new score is higher than the existing score.
- Lower or equal replay scores preserve gameplay history in `play_sessions` but do not replace the user's best score.

Query implementation:

- Service: `getLevelLeaderboard(levelId, limit = 10)`
- Table: `best_scores`
- Filter: `.eq("level_id", levelId)`
- Sort: `best_score desc`, then `time_seconds asc`
- Joined profile fields: `users(username, display_name)`

Output contract:

- `rank`
- `userId`
- `username`
- `displayName`
- `levelId`
- `bestScore`
- `moves`
- `timeSeconds`
- `achievedAt`

## Global Ranking Logic

Global rankings are generated from the `global_rankings` view.

Rules implemented:

- Only `best_scores.best_score` contributes to global score.
- Multiple runs on the same level do not create multiple contributions.
- `global_score` is the sum of a user's best score across completed levels.
- `completed_maps` is the count of levels represented in `best_scores`.
- Users must meet a configurable minimum completed-map count before appearing in service results.

Query implementation:

- Service: `getGlobalRankings(minCompletedMaps = 3, limit = 100)`
- View: `global_rankings`
- Filter: `completed_maps >= minCompletedMaps`
- Sort: `global_score desc`

Default qualification:

```text
DEFAULT_GLOBAL_RANKING_MIN_COMPLETED_MAPS = 3
```

Output contract:

- `rank`
- `userId`
- `username`
- `displayName`
- `globalScore`
- `completedMaps`

## Service Layer

### src/lib/supabase.ts

Owns Supabase client construction and environment validation.

### src/services/gameplayService.ts

Owns completed-run persistence.

Functions:

- `storeGameplaySession(run)`
- `recordCompletedRun(run)`

Boundary:

- Inserts gameplay records.
- Coordinates best score updates.
- Does not render UI.

### src/services/scoreService.ts

Owns score calculation and best score persistence.

Functions:

- `calculateCompletionScore(input)`
- `updateBestScore(run, playSessionId)`
- `getUserBestScores(userId)`

Boundary:

- Compares new scores against existing best scores.
- Does not own leaderboard UI.

### src/services/leaderboardService.ts

Owns per-level leaderboard reads.

Functions:

- `getLevelLeaderboard(levelId, limit)`

Boundary:

- Reads best-score ranking data for one level.
- Does not calculate global rankings.

### src/services/rankingService.ts

Owns platform-wide ranking reads.

Functions:

- `getGlobalRankings(minCompletedMaps, limit)`

Boundary:

- Reads the `global_rankings` view.
- Applies qualification and result limits.

## Shared Contracts

### CompletedGameplayRunInput

Fields:

- `userId`
- `levelId`
- `score`
- `moves`
- `timeSeconds`
- `completedAt`
- `metadata`

Used by:

- `storeGameplaySession`
- `recordCompletedRun`
- `updateBestScore`

### GameplaySession

Represents a completed run stored in `play_sessions`.

Stable fields:

- `id`
- `userId`
- `levelId`
- `score`
- `moves`
- `timeSeconds`
- `completedAt`
- `metadata`

### BestScore

Represents a user's best score for one level.

Stable fields:

- `id`
- `userId`
- `levelId`
- `bestScore`
- `moves`
- `timeSeconds`
- `playSessionId`
- `achievedAt`
- `updatedAt`

### LevelLeaderboardEntry

Represents one row in a per-level leaderboard.

Stable fields:

- `rank`
- `userId`
- `username`
- `displayName`
- `levelId`
- `bestScore`
- `moves`
- `timeSeconds`
- `achievedAt`

### GlobalRankingEntry

Represents one row in global rankings.

Stable fields:

- `rank`
- `userId`
- `username`
- `displayName`
- `globalScore`
- `completedMaps`

## Future Compatibility

The current schema supports future features without redesigning the core ranking model:

- Play History: read from `play_sessions` by `user_id` or `level_id`.
- Creator Statistics: join `levels.owner_id` with `play_sessions` and `best_scores`.
- Completion Rates: compare level attempts/completions once attempt tracking exists; completed runs already live in `play_sessions`.
- Analytics: aggregate `score`, `moves`, `time_seconds`, `completed_at`, and `metadata`.
- Profile Statistics: aggregate `play_sessions`, `best_scores`, and `global_rankings` by `user_id`.
- Future Ranking Features: add views or service functions over `best_scores` without changing the one-best-score-per-user-per-level constraint.

## Non-Goals

Do not implement:

- Leaderboards stored in localStorage.
- Rankings stored in localStorage.
- Leaderboards by difficulty.
- Duplicate `best_scores` rows for the same `(user_id, level_id)`.
- Multiple global score contributions from repeated runs on the same level.
- Direct Supabase calls inside React pages.
- Ranking calculations inside UI components.
- Score calculations inside UI components.
- Authentication flows in leaderboard services.
- Profile UI in leaderboard services.
- Play history UI in leaderboard services.
