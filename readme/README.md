# LevelCrafter

> A browser-based level builder and arcade puzzle game where players can create maps, play custom levels, share exports, and compete on leaderboards.

## Project Links

Demo Video: `[Add demo video link here]`

Live Site: `[Add hosted site link here]`

Repository: `[Add GitHub repository link here]`

---

## Table of Contents

- [About The Project](#about-the-project)
- [What You Can Do](#what-you-can-do)
- [Core Features](#core-features)
- [Gameplay Rules](#gameplay-rules)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [How The App Works](#how-the-app-works)
- [Database And Leaderboards](#database-and-leaderboards)
- [Level Format](#level-format)
- [Important Source Files](#important-source-files)
- [Testing And Verification](#testing-and-verification)
- [Future Improvements](#future-improvements)
- [Documentation](#documentation)
- [License](#license)

---

## About The Project

LevelCrafter is a React and TypeScript web app for building and playing custom grid-based puzzle levels.

The project has two main experiences:

1. Create levels with a visual tile editor.
2. Play levels with arcade-style movement, hazards, scoring, and leaderboards.

It is designed like a small game platform. Players can make maps, save them, import maps, export playable HTML files, customize their character, complete levels, and see profile or leaderboard progress.

The app uses Supabase for authentication, level storage, user profiles, completed runs, best scores, and global rankings.

---

## What You Can Do

With LevelCrafter, a user can:

- Create a new level by choosing a difficulty.
- Paint tiles on a grid using a visual editor.
- Place walls, coins, bombs, vents, exits, moving hazards, and the player start.
- Generate starter maps or maze maps.
- Undo and redo editor changes.
- Validate whether a level is playable.
- Save levels to Supabase.
- Import saved levels into the editor.
- Paste JSON level data.
- Export levels as JSON.
- Copy a share code for a level.
- Export a standalone playable HTML file.
- Play levels by difficulty.
- Move with keyboard controls or pointer dragging.
- Collect coins and reach the exit.
- Avoid bombs, fire, and moving hazards.
- Use vents to teleport to another vent.
- Track moves, time, score, and completion stats.
- View per-level leaderboards.
- View global rankings.
- Register, log in, and view a profile dashboard.
- Change username and player avatar.

---

## Core Features

### Level Editor

The editor lets users build levels directly in the browser.

Supported editor features:

- Difficulty-based board sizes:
  - Easy: `5x5`
  - Medium: `8x8`
  - Hard: `12x12`
- Click-and-drag painting.
- Tile palette.
- Undo and redo history.
- Starter level generation.
- DFS maze generation.
- Bomb preview timer configuration.
- Level validation before save/export.
- Saved-level import.
- JSON paste import.
- JSON export.
- Share-code export.
- Standalone HTML export.

### Play Mode

The play screen loads levels by difficulty and lets the player complete them.

Gameplay features:

- WASD movement.
- Pointer drag movement from the player tile.
- Wall collision.
- Coin collection.
- Hidden bombs after a preview countdown.
- Moving danger tiles.
- Vent teleport selection.
- Explosion feedback on death.
- Win screen with score breakdown.
- Per-level leaderboard modal.

### Profiles

Authenticated users get a profile dashboard.

Profile features:

- Username display and edit.
- Player avatar selection.
- Created map list.
- Recent play history.
- Global rank display.
- Logout support.

### Leaderboards

LevelCrafter supports two ranking views:

- Per-level leaderboards based on each user's best score for a specific level.
- Global rankings based on the total of best scores across completed levels.

Repeated runs are saved as play history, but only a user's best score for each level contributes to leaderboards.

---

## Gameplay Rules

The game is played on a square tile grid.

### Tile Types

| Tile | Meaning |
| --- | --- |
| `empty` | Walkable floor tile |
| `wall` | Blocks movement |
| `coin` | Collectible bonus item |
| `hazard` | Bomb tile that causes restart |
| `movingFireHorizontal` | Moving fire hazard on the horizontal axis |
| `movingFireVertical` | Moving fire hazard on the vertical axis |
| `movingHazardHorizontal` | Moving bomb-style hazard on the horizontal axis |
| `movingHazardVertical` | Moving bomb-style hazard on the vertical axis |
| `enemyHorizontal` | Horizontal moving danger tile |
| `enemyVertical` | Vertical moving danger tile |
| `vent` | Teleport tile |
| `player` | Player start position |
| `exit` | Win tile |

### Movement

- `W`: move up
- `A`: move left
- `S`: move down
- `D`: move right

The board also supports pointer dragging. Start dragging from the player tile and move into adjacent cells.

### Winning

The player wins by reaching the `exit` tile.

### Losing

The player restarts if they touch:

- A visible or hidden bomb.
- Moving fire.
- Any dynamic danger tile.

### Vents

When the player steps on a vent, the game shows available vent destinations. The player can click a destination vent to teleport there.

### Bomb Preview Timer

Bombs are visible for a short countdown at the beginning of a level. After the countdown ends, bomb art fades out, but the hazard still exists and still causes restart.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend And Data

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase RPC for completed run recording

### Tooling

- ESLint
- TypeScript compiler
- Vite production build

---

## Project Structure

```text
LevelCrafter/
├── avatar/                    # Player avatar image assets
├── public/                    # Public static files
├── readme/                    # Project documentation
├── src/
│   ├── audio/                 # Retro music and sound effects
│   ├── components/            # Shared app-level components
│   ├── constants/             # Difficulty and tile constants
│   ├── context/               # Auth context
│   ├── features/
│   │   ├── editor/            # Grid editor and tile palette
│   │   ├── mazeGenerator/     # Maze generation logic
│   │   ├── play/              # Gameplay hooks and play components
│   │   ├── playerAvatar/      # Avatar UI and storage
│   │   └── tiles/             # Tile artwork and asset mapping
│   ├── game/                  # Movement, collision, rules, spawn, engine logic
│   ├── hooks/                 # Shared React hooks
│   ├── lib/                   # Supabase client setup
│   ├── pages/                 # Route-level screens
│   ├── services/              # Supabase, scoring, level, and profile services
│   ├── shared/                # Shared UI components
│   ├── types/                 # TypeScript app and database types
│   ├── App.tsx                # Router and top-level app composition
│   └── main.tsx               # React entry point
├── supabase/
│   └── migrations/            # Database schema and RPC migration
├── tiles/                     # Tile image assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install Node.js and npm.

Recommended:

```text
Node.js 20+
npm 10+
```

### Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd LevelCrafter
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Start the development server:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal. It is usually:

```text
http://localhost:5173
```

---

## Environment Variables

The app requires Supabase configuration.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |

These values are read in `src/lib/supabase.ts`.

Do not commit private service-role keys to the frontend. The frontend should only use the public anon key.

---

## Available Scripts

### Start Development Server

```bash
npm run dev
```

Runs the app locally with Vite.

### Build For Production

```bash
npm run build
```

Runs TypeScript build checks and creates the production bundle.

### Run Lint

```bash
npm run lint
```

Runs ESLint across the project.

### Preview Production Build

```bash
npm run preview
```

Serves the built production output locally.

---

## How The App Works

### App Routing

Routes are defined in `src/App.tsx`.

Main routes:

| Route | Screen |
| --- | --- |
| `/` | Home |
| `/create` | Create level |
| `/play` | Play levels |
| `/login` | Login |
| `/register` | Register |
| `/profile` | Profile dashboard |
| `/global-leaderboard` | Global leaderboard |

The profile route is protected. Users without a session are redirected to login.

### Create Flow

```text
Choose difficulty
      |
      v
Create empty/starter/maze grid
      |
      v
Paint tiles in editor
      |
      v
Validate level
      |
      v
Save, export, or playtest
```

Important rules:

- A level must have exactly one player start.
- A level must have exactly one exit.
- A level with vents must have at least two vents.
- The exit must be reachable from the player start.
- The grid size must match the selected difficulty.

### Play Flow

```text
Choose difficulty
      |
      v
Load levels
      |
      v
Select level
      |
      v
Preview bombs
      |
      v
Move, collect, avoid hazards
      |
      v
Win or restart
```

The active player position is stored separately from the static level grid. This keeps movement logic clean and prevents stale player tiles from staying in the board after reset or replay.

### Scoring

The score calculation rewards completion, coins, difficulty, and shorter bomb-preview timers.

Current scoring model:

```text
baseScore = 1000
coinBonus = coinsCollected * 100
movePenalty = moves * 5
timePenalty = timeSeconds * 2
rawScore = max(0, baseScore + coinBonus - movePenalty - timePenalty)
finalScore = rawScore * difficultyMultiplier * bombPreviewMultiplier
```

Difficulty multipliers:

| Difficulty | Multiplier |
| --- | --- |
| Easy | `1.0` |
| Medium | `1.25` |
| Hard | `1.5` |

Shorter bomb preview timers use higher multipliers because they make the level harder.

---

## Database And Leaderboards

The database is defined in:

```text
supabase/migrations/001_leaderboards.sql
```

Main data areas:

- `users`: public profile information.
- `levels`: saved level metadata and grid data.
- `play_sessions`: completed run history.
- `best_scores`: best score per user per level.
- `global_rankings`: view that aggregates global scores.

### Completed Run Flow

```text
Player wins level
      |
      v
Calculate score
      |
      v
Insert play session
      |
      v
Update best score if score improved
      |
      v
Leaderboard/global ranking reads use best_scores
```

The preferred persistence path uses the `record_completed_run` Supabase RPC so play session creation and best-score updates happen together.

### Why Best Scores Are Separate

Every completed run is useful for history, but a leaderboard should show each player only once per level.

That is why:

- `play_sessions` stores all completions.
- `best_scores` stores only the best completion for each `(user_id, level_id)`.
- `global_rankings` sums best scores, not every run.

---

## Level Format

A level is stored as a TypeScript object like this:

```ts
interface Level {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  bombPreviewSeconds: number;
  createdAt: number;
  width: number;
  height: number;
  grid: Tile[][];
}
```

Example simplified level:

```json
{
  "name": "Starter Easy",
  "difficulty": "easy",
  "bombPreviewSeconds": 3,
  "width": 5,
  "height": 5,
  "grid": [
    ["wall", "wall", "wall", "wall", "wall"],
    ["wall", "player", "coin", "exit", "wall"],
    ["wall", "empty", "wall", "empty", "wall"],
    ["wall", "hazard", "empty", "empty", "wall"],
    ["wall", "wall", "wall", "wall", "wall"]
  ]
}
```

Imported levels are treated as untrusted input. The app validates the grid, tile names, difficulty, player count, exit count, and reachable path before saving imported data.

---

## Important Source Files

### Game Logic

| File | Purpose |
| --- | --- |
| `src/game/movement.ts` | Calculates the next position for a direction |
| `src/game/collision.ts` | Reads tiles and handles wall collision |
| `src/game/rules.ts` | Converts tiles into gameplay events |
| `src/game/spawn.ts` | Finds the player start |
| `src/game/gameEngine.ts` | Resolves movement and vent destinations |
| `src/features/play/hooks/useGame.ts` | Main gameplay state machine |

### Editor

| File | Purpose |
| --- | --- |
| `src/pages/CreateLevelPage.tsx` | Main level creation screen |
| `src/features/editor/components/GridEditor.tsx` | Paintable grid UI |
| `src/features/editor/components/TilePalette.tsx` | Tile selection UI |
| `src/features/mazeGenerator/mazeGenerator.ts` | DFS maze generator |
| `src/services/levelValidation.ts` | Level validation rules |

### Services

| File | Purpose |
| --- | --- |
| `src/lib/supabase.ts` | Supabase client setup |
| `src/services/levelStorage.ts` | Save, load, import, export level data |
| `src/services/gameplayService.ts` | Persist completed gameplay runs |
| `src/services/scoreService.ts` | Calculate scores and update best scores |
| `src/services/leaderboardService.ts` | Read per-level leaderboards |
| `src/services/rankingService.ts` | Read global rankings |
| `src/services/profileService.ts` | Auth user, profile, avatar, dashboard data |

### UI And App Shell

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Main routes |
| `src/context/AuthContext.tsx` | Session context |
| `src/components/ProtectedRoute.tsx` | Auth-only route guard |
| `src/pages/PlayPage.tsx` | Main play screen |
| `src/pages/ProfilePage.tsx` | Profile dashboard |
| `src/pages/GlobalLeaderboardPage.tsx` | Global leaderboard screen |

---

## Testing And Verification

This project currently uses linting and production build checks.

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Recommended manual checks after major gameplay/editor changes:

- Create each difficulty level.
- Place every tile type.
- Validate a playable level.
- Save a level.
- Import a saved level.
- Export JSON.
- Copy a share code and import it.
- Export standalone HTML.
- Play a level to completion.
- Confirm bombs hide after the countdown.
- Confirm moving hazards restart the player.
- Confirm vents let the player choose a destination.
- Confirm score appears after win.
- Confirm leaderboard/profile data updates after completion.

---

## Future Improvements

Possible next steps:

- Add automated unit tests for movement, validation, maze generation, and scoring.
- Add end-to-end tests for create/play flows.
- Add route-level code splitting to reduce the production bundle size.
- Add more tile types and puzzle mechanics.
- Add creator analytics.
- Add level search and filtering.
- Add public level pages.
- Add comments or ratings for levels.
- Add better mobile-specific editor controls.
- Add richer standalone export visuals.

---

## Documentation

More documentation is available in the `readme/` folder:

| File | Description |
| --- | --- |
| `readme/hld.md` | High-level design |
| `readme/database-design.md` | Database, ranking, and leaderboard design |
| `readme/workflow_phase1.md` | Phase 1 workflow notes |
| `readme/workflow_phase2.md` | Phase 2 workflow notes |
| `readme/SECURITY.md` | Security notes |
| `readme/LICENSE.md` | License |

---

## License

This project is licensed under the MIT License. See `readme/LICENSE.md` for details.
