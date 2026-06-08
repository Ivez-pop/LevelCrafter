# AI Contribution Audit

## 1. Overview

This repository combines gameplay, editor tooling, maze generation, import/export, Supabase-backed persistence, and multiple UI surfaces. AI-assisted development likely accelerated:

- Feature implementation for gameplay hooks, page scaffolding, and service-layer functions.
- Refactoring of repeated Supabase access, validation, and data mappers.
- Boilerplate for routes, forms, modal flows, and typed interfaces.
- API integration for auth, leaderboards, profile updates, and RPC calls.
- Database integration for schema-aware persistence and score handling.
- Migration generation for leaderboard tables, best-score storage, profile rows, and gameplay RPCs.
- UI construction for arcade-style pages, shared controls, editor palettes, board rendering, and ranking views.
- Documentation assistance for feature summaries, usage notes, and import/export guidance.

The codebase is split between gameplay logic, UI, and persistence, which is the kind of structure AI can draft quickly before developers connect and validate the pieces.

## 2. Repository Statistics

| Metric | Count | Evidence |
| --- | ---: | --- |
| Total React components | 25 | `src/**/*.tsx` files |
| Total custom hooks | 5 | `useGame`, `useKeyboardControls`, `useGameTimer`, `useRetroAudio`, `usePlayerAvatar` |
| Total service files | 8 | `src/services/*.ts` |
| Total game-engine related files | 7 | `src/game/*`, `src/features/mazeGenerator/mazeGenerator.ts`, `src/features/play/hooks/useGame.ts` |
| Total pages/routes | 7 | `src/pages/*.tsx` and routes in `src/App.tsx` |
| Total TypeScript files | 30 | `src/**/*.ts` excluding `.tsx` |

## 3. Gameplay Systems

| Feature | Purpose | Files | Complexity | Likely AI Help | Acceleration |
| --- | --- | --- | --- | --- | --- |
| Core Movement and Tile Resolution | Player movement, collision, tile effects, event mapping | `src/game/movement.ts`, `src/game/collision.ts`, `src/game/rules.ts`, `src/game/gameEngine.ts`, `src/features/play/hooks/useGame.ts` | Moderate-high | Feature implementation, code generation, state management, architecture | Drafted movement helpers and event boundaries quickly |
| Vent Teleportation | Multi-vent destination selection | `src/game/gameEngine.ts`, `src/features/play/hooks/useGame.ts`, `src/features/play/components/GameBoard.tsx` | Moderate | Feature implementation, state management, UI wiring | Generated vent selection model and UI plumbing |
| Dynamic Hazards and Moving Fire | Runtime-moving threats and collision handling | `src/features/play/hooks/useGame.ts`, `src/constants/tiles.ts`, `src/features/play/components/GameBoard.tsx` | High | Feature implementation, state management, refactoring, architecture | Drafted movement tick loop and collision response paths |
| Score and Completion Tracking | Moves, coins, time, completion metadata | `src/features/play/hooks/useGame.ts`, `src/services/gameplayService.ts`, `src/services/scoreService.ts`, `src/types/leaderboard.ts` | Moderate | Feature implementation, API integration, data shaping | Drafted payloads and response mappers |

Briefly, these systems show where AI-assisted implementation could have saved the most time while still leaving the behavior to be validated by developers.

## 4. Level Editor

The editor is a coordinated feature area. The table below preserves the same evidence while keeping the responsibilities easy to scan.

| System | Files | Responsibilities | AI Opportunities |
| --- | --- | --- | --- |
| Grid editing | `src/features/editor/components/GridEditor.tsx` | Pointer-driven painting; cell sizing by board size | Boilerplate generation, UI construction |
| Tile palette | `src/features/editor/components/TilePalette.tsx` | Exposes authorable tiles | Boilerplate generation, UI construction |
| Editor orchestration | `src/pages/CreateLevelPage.tsx` | Undo/redo, starter grids, maze generation, imports, exports, saves | Refactoring, page scaffolding, modal flows |
| Validation | `src/services/levelValidation.ts` | Player/exit counts, path reachability, sizing rules | Validation scaffolding, edge-case handling |
| Persistence | `src/services/levelStorage.ts` | Save, delete, import, share-code generation, normalization | Refactoring, serializer generation |

## 5. Import / Export Systems

These flows handle untrusted input and cross-surface serialization.

| Path | Files | Responsibilities | Complexity | AI Opportunities |
| --- | --- | --- | --- | --- |
| JSON import | `src/services/levelStorage.ts`, `src/pages/CreateLevelPage.tsx` | Parse file, normalize metadata, validate shape | High | Serializer/deserializer generation |
| Share codes | `src/services/levelStorage.ts`, `src/pages/PlayPage.tsx` | Encode/decode levels as base64-safe text | High | Code generation, validation drafting |
| Standalone export | `src/services/standaloneExport.ts` | Self-contained HTML export with inline CSS/JS | High | Boilerplate generation, refactoring |

## 6. Maze Generation

| File | Responsibilities | Complexity | AI Contribution |
| --- | --- | --- | --- |
| `src/features/mazeGenerator/mazeGenerator.ts` | DFS carving, odd/even board handling, endpoint selection, difficulty sizing | High | Algorithm drafting, pathfinding helpers, generator scaffolding |

## 7. Dynamic Hazard Systems

| Aspect | Evidence | AI Contribution |
| --- | --- | --- |
| Moving hazards | `src/features/play/hooks/useGame.ts`, `src/constants/tiles.ts`, `src/features/play/components/GameBoard.tsx` | Feature implementation, state management, architecture |
| Runtime simulation | Under-tile preservation and tick-based movement in `useGame` | Tracing state flow, edge-case discovery |
| Export parity | Matching motion cadence and rules in `src/services/standaloneExport.ts` | Runtime behavior analysis |

## 8. Supabase Integration

Supabase is the primary backend integration layer in this repository.

| Files | Responsibilities | AI Opportunities |
| --- | --- | --- |
| `src/lib/supabase.ts`, `src/context/AuthContext.tsx` | Singleton client, env validation, auth session hydration | API integration, boilerplate |
| `src/services/levelStorage.ts` | Level persistence, owner checks, imported-row normalization | Database integration, refactoring |
| `src/services/gameplayService.ts`, `src/services/scoreService.ts` | RPC recording, best-score updates, score mapping | RPC wiring, data shaping |
| `src/services/profileService.ts` | Profile creation, username/avatar sync, created-level publishing | API integration, persistence |
| `src/services/leaderboardService.ts`, `src/services/rankingService.ts` | Per-level and global ranking reads | Query orchestration, mapping |
| `supabase/migrations/001_leaderboards.sql`, `supabase/migrations/002_server_authoritative_scoring.sql` | Schema, indexes, RPC, aggregate ranking support | Migration generation, SQL verification |

## 9. Authentication

| Files | Responsibilities | AI Opportunities |
| --- | --- | --- |
| `src/context/AuthContext.tsx` | Session hydration and subscription | API integration, state scaffolding |
| `src/components/ProtectedRoute.tsx`, `src/components/LogoutButton.tsx` | Route gating and sign-out | Boilerplate, auth wiring |
| `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx` | Auth entry points | Form scaffolding, UI generation |
| `src/services/profileService.ts` | Public profile sync with auth identity | API integration, refactoring |

## 10. Leaderboards

| Files | Responsibilities | AI Opportunities |
| --- | --- | --- |
| `src/services/leaderboardService.ts` | Per-level best-score rankings | Data mapping, query orchestration |
| `src/services/rankingService.ts` | Global rankings with minimum completed-map threshold | Query analysis, ranking logic |
| `src/pages/GlobalLeaderboardPage.tsx`, `src/features/play/components/LeaderboardPlaceholder.tsx` | Ranking UI and loading/empty states | UI scaffolding |
| `src/types/leaderboard.ts` | Typed contracts for scores and ranks | Type generation |

## 11. Score Calculation

| Files | Responsibilities | AI Opportunities |
| --- | --- | --- |
| `src/services/gameplayService.ts` | Record completed runs via RPC and legacy path | RPC payload construction, database integration |
| `src/services/scoreService.ts` | Monotonic best-score updates and row mapping | Score logic generation, refactoring |
| `supabase/migrations/002_server_authoritative_scoring.sql` | Server-authoritative score calculation and return payload | SQL generation, verification |

## 12. Utility Services

| Files | Responsibilities | AI Opportunities |
| --- | --- | --- |
| `src/services/levelStorage.ts`, `src/services/levelValidation.ts` | Import normalization, save/delete, share-code encoding, grid/path validation | Serializer generation, validation refactoring |
| `src/services/profileService.ts`, `src/features/playerAvatar/avatarStorage.ts`, `src/features/playerAvatar/avatarOptions.ts` | Username resolution, avatar sync, avatar persistence and normalization | API integration, helper generation |
| `src/services/standaloneExport.ts`, `src/constants/tiles.ts`, `src/constants/difficulty.ts` | Export HTML and shared config | Boilerplate generation, type generation |

## 13. UI Components

| Files | Responsibilities | AI Opportunities |
| --- | --- | --- |
| `src/components/GlobalPageNavigation.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/LogoutButton.tsx`, `src/components/RetroAudioController.tsx` | Shared navigation and app chrome | Boilerplate, layout scaffolding |
| `src/shared/components/DifficultySelector.tsx`, `src/shared/components/ThemeSelector.tsx` | Global selectors | UI construction |
| `src/features/play/components/GameBoard.tsx`, `src/features/play/components/GameControls.tsx`, `src/features/play/components/GameStatus.tsx`, `src/features/play/components/LevelList.tsx`, `src/features/play/components/LeaderboardPlaceholder.tsx` | Play-screen UI | Component generation, refactoring |
| `src/features/editor/components/GridEditor.tsx`, `src/features/editor/components/TilePalette.tsx`, `src/features/tiles/TileArtwork.tsx`, `src/features/playerAvatar/PlayerAvatar.tsx` | Editor UI and asset rendering | UI construction, UI implementation |

## 14. Database & Infrastructure

| Files | Responsibilities | AI Opportunities |
| --- | --- | --- |
| `supabase/migrations/001_leaderboards.sql`, `supabase/migrations/002_server_authoritative_scoring.sql` | Schema, views, indexes, RPC | Migration generation, SQL verification |
| `src/lib/supabase.ts`, `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `index.html` | Client setup, build config, TS/ESLint config, root shell | Boilerplate generation, infrastructure scaffolding |

## 15. Summary of AI-Assisted Development

| Area | AI Assistance Level | Examples |
| ---- | ------------------- | -------- |
| Gameplay Systems | High | Movement engine, vent routing, dynamic hazards, score tracking |
| Editor | High | Grid painting, palette, undo/redo scaffolding, validation |
| Import/Export | High | JSON normalization, share codes, standalone HTML export |
| Maze Generation | High | DFS carving, endpoint selection, difficulty-aware sizing |
| Database | High | Supabase client, session writes, RPC scoring, migrations |
| UI | Medium to High | Pages, shared controls, board rendering, modals |
| Infrastructure | Medium | Build config, TypeScript config, route scaffolding |

The main takeaway is that AI was most useful where the codebase needed repeated structure plus domain-specific rules.

## 16. Human Oversight

AI-generated suggestions required human review. Final implementation decisions remained with developers, especially for gameplay design, persistence rules, and UX tradeoffs. Testing, validation, deployment, and regression checks were human responsibilities. AI acted as an accelerator, not an autonomous developer.

# AI-Assisted Debugging and Analysis

This section is based on repository evidence from commit history, source code, migration files, and inline notes. The repo does not include separate model logs, so AI role labels here are conservative and evidence-based.

## Dynamic Hazard Movement

### Problem

Moving hazards and fire needed to advance without destroying underlying tiles.

### Files Involved

- `src/features/play/hooks/useGame.ts`
- `src/constants/tiles.ts`
- `src/features/play/components/GameBoard.tsx`
- `src/services/standaloneExport.ts`

### AI Contribution

- Repository-wide code audit
- Tracing state flow
- Root-cause identification
- Architectural recommendations

### Human Validation

Developers validated board rendering and runtime behavior in the app and the standalone export.

### Outcome

Hazards became a runtime simulation layer instead of destructive board mutations.

## Hazard Freezing Issues

### Problem

Hazard animation had to keep moving across transitions instead of stalling or desynchronizing.

### Files Involved

- `src/features/play/hooks/useGame.ts`
- `src/audio/useRetroAudio.ts`
- `src/hooks/useGameTimer.ts`

### AI Contribution

- Tracing state flow
- Dependency analysis
- Runtime behavior analysis

### Human Validation

Developers checked resets, route changes, and timer cleanup behavior.

### Outcome

Motion was governed by explicit timer state rather than incidental component lifecycle behavior.

## Moving Hazard Timer Issues

### Problem

Timer cadence had to stay stable and stop cleanly on reset.

### Files Involved

- `src/features/play/hooks/useGame.ts`
- `src/services/standaloneExport.ts`

### AI Contribution

- Dependency analysis
- Runtime behavior tracing
- Architecture reviews

### Human Validation

Developers validated cadence in live play and confirmed it did not leak into subsequent runs.

### Outcome

Timing was centralized and deterministic.

## Exit and Hazard Interaction Bugs

### Problem

Exit tiles and hazards needed distinct rules so movement, endpoint placement, and collision did not conflict.

### Files Involved

- `src/game/gameEngine.ts`
- `src/game/rules.ts`
- `src/features/mazeGenerator/mazeGenerator.ts`
- `src/features/play/hooks/useGame.ts`
- `src/services/levelValidation.ts`

### AI Contribution

- Root-cause identification
- Edge-case discovery
- Architecture assistance
- Repository-wide code audits

### Human Validation

Developers tested reachability, endpoint placement, and hazard-trigger behavior.

### Outcome

Swap-style corruption was prevented.

## Hazard Duplication Bugs

### Problem

Dynamic tiles could duplicate or leave artifacts.

### Files Involved

- `src/features/play/hooks/useGame.ts`
- `src/features/play/components/GameBoard.tsx`
- `src/services/standaloneExport.ts`

### AI Contribution

- Tracing state flow
- Edge-case discovery
- Architectural recommendations

### Human Validation

Developers verified that only one visible instance of each moving hazard existed at a time.

### Outcome

Hazards render as one dynamic instance over a preserved static board.

## Coin / Trophy Duplication Issues

### Problem

Singleton markers needed to stay single and collectible.

### Files Involved

- `src/pages/CreateLevelPage.tsx`
- `src/features/play/hooks/useGame.ts`
- `src/services/standaloneExport.ts`
- `src/services/levelValidation.ts`

### AI Contribution

- Edge-case discovery
- Root-cause identification
- Repository-wide code audits

### Human Validation

Developers checked authoring, play, and export paths for singleton marker consistency.

### Outcome

Singleton gameplay markers were preserved.

## Vent Interaction Bugs

### Problem

Vents needed linked teleport behavior without stale selection or invalid destinations.

### Files Involved

- `src/game/gameEngine.ts`
- `src/services/levelValidation.ts`
- `src/features/play/hooks/useGame.ts`
- `src/features/play/components/GameBoard.tsx`
- `src/services/standaloneExport.ts`

### AI Contribution

- Tracing state flow
- Edge-case discovery
- Runtime behavior analysis
- Architectural recommendations

### Human Validation

Developers tested Escape/reset behavior and active-destination selection.

### Outcome

Vent travel became deterministic and resilient against stale UI state.

## State Synchronization Issues

### Problem

Gameplay, auth, profile, and leaderboard state had to stay aligned across screens.

### Files Involved

- `src/context/AuthContext.tsx`
- `src/features/play/hooks/useGame.ts`
- `src/hooks/useGameTimer.ts`
- `src/features/playerAvatar/usePlayerAvatar.ts`
- `src/services/profileService.ts`

### AI Contribution

- Tracing state flow
- Dependency analysis
- Architecture reviews

### Human Validation

Developers confirmed consistent state across screens.

### Outcome

Shared state was centralized.

## React useEffect Dependency Problems

### Problem

Effect cleanup had to prevent stale listeners and timers.

### Files Involved

- `src/context/AuthContext.tsx`
- `src/features/play/hooks/useKeyboardControls.ts`
- `src/hooks/useGameTimer.ts`
- `src/audio/useRetroAudio.ts`
- `src/pages/PlayPage.tsx`

### AI Contribution

- Dependency analysis
- Tracing state flow
- Runtime behavior tracing

### Human Validation

Developers verified that listeners and timers were cleaned up correctly.

### Outcome

Effect lifecycles became predictable.

## Supabase Integration Verification

### Problem

Auth, persistence, ranking, and RPC writes needed verification against Supabase.

### Files Involved

- `src/lib/supabase.ts`
- `src/services/levelStorage.ts`
- `src/services/gameplayService.ts`
- `src/services/profileService.ts`
- `src/services/leaderboardService.ts`
- `src/services/rankingService.ts`
- `supabase/migrations/001_leaderboards.sql`
- `supabase/migrations/002_server_authoritative_scoring.sql`

### AI Contribution

- SQL verification
- Repository-wide code audits
- Root-cause identification
- API integration analysis

### Human Validation

Developers validated schema, row mappings, and async paths against the live database.

### Outcome

Service layers became typed and defensive.

## Score Calculation Migration

### Problem

Score moved from browser-side logic to server-side persistence.

### Files Involved

- `supabase/migrations/002_server_authoritative_scoring.sql`
- `src/services/gameplayService.ts`
- `src/services/scoreService.ts`
- `README.md`

### AI Contribution

- SQL verification
- Migration generation
- Dependency analysis
- Data flow tracing

### Human Validation

Developers compared returned scores with UI expectations and confirmed the migration behavior.

### Outcome

Scoring became server-authoritative and aligned with leaderboard consistency.

## Async Flow Verification

### Problem

Async reads and writes had to stay in order.

### Files Involved

- `src/services/gameplayService.ts`
- `src/services/profileService.ts`
- `src/services/levelStorage.ts`
- `src/pages/PlayPage.tsx`
- `src/pages/ProfilePage.tsx`

### AI Contribution

- Runtime behavior analysis
- Dependency analysis
- Root-cause identification

### Human Validation

Developers validated sequencing in gameplay and profile flows.

### Outcome

Async boundaries became explicit.

## Data Persistence Verification

### Problem

Persisted levels, profiles, sessions, scores, and rankings needed consistency.

### Files Involved

- `src/services/levelStorage.ts`
- `src/services/profileService.ts`
- `src/services/gameplayService.ts`
- `src/services/scoreService.ts`
- `src/services/leaderboardService.ts`
- `src/services/rankingService.ts`

### AI Contribution

- Repository-wide code audits
- Data mapping analysis
- Edge-case discovery

### Human Validation

Developers confirmed persistence behavior in editor, profile, and leaderboard flows.

### Outcome

Persistence was hardened at the boundaries.

## Import/Export Validation

### Problem

Imported and exported levels needed to reject malformed data.

### Files Involved

- `src/services/levelStorage.ts`
- `src/services/standaloneExport.ts`
- `src/services/levelValidation.ts`
- `src/pages/CreateLevelPage.tsx`
- `src/pages/PlayPage.tsx`

### AI Contribution

- Validation pipeline drafting
- Serialization analysis
- Edge-case discovery

### Human Validation

Developers tested JSON, codes, and standalone export behavior.

### Outcome

Import/export became resilient.

## Leaderboard Consistency Checks

### Problem

Rankings had to reflect only valid best scores.

### Files Involved

- `src/services/leaderboardService.ts`
- `src/services/rankingService.ts`
- `src/services/scoreService.ts`
- Migrations

### AI Contribution

- SQL verification
- Root-cause identification
- Data flow tracing
- Architecture reviews

### Human Validation

Developers verified that per-level and global views matched persisted data.

### Outcome

Leaderboard reads were aligned with best-score persistence.

## Codex Contributions

### Overview

Codex-style assistance in this repository is best characterized as implementation acceleration. It helped draft core gameplay code, service layers, SQL migrations, and UI scaffolding that developers then validated and refined.

### Major Contributions

| Area | Example Files | Contribution Style |
| --- | --- | --- |
| Gameplay implementation | `src/features/play/hooks/useGame.ts`, `src/game/*` | Core gameplay logic, state orchestration, hazard simulation |
| Refactoring and services | `src/services/levelStorage.ts`, `src/services/profileService.ts`, `src/services/scoreService.ts` | Typed helpers, row mappers, boundary validation |
| Supabase integration | `src/lib/supabase.ts`, `src/services/gameplayService.ts`, migrations | Client setup, RPC wiring, persistence flows |
| SQL migration generation | `supabase/migrations/001_leaderboards.sql`, `supabase/migrations/002_server_authoritative_scoring.sql` | Schema, indexes, ranking views, server scoring |
| Type generation | `src/types/supabase.ts`, `src/types/leaderboard.ts`, `src/types/gameState.ts` | App-facing contracts for data and gameplay |
| UI implementation | `src/pages/*`, `src/features/*/components/*` | Editor, play, profile, and leaderboard surfaces |

### Representative Examples

- `src/features/play/hooks/useGame.ts` coordinates gameplay state, vent selection, score recording, dynamic hazard timing, and resets.
- `src/features/mazeGenerator/mazeGenerator.ts` implements DFS-based maze carving and endpoint selection.
- `src/services/levelStorage.ts` handles save, delete, import, share-code encoding, and row normalization.
- `src/services/gameplayService.ts` records completed runs and consumes the RPC response contract.
- `src/services/scoreService.ts` updates best scores and maps database rows to app types.
- `src/services/profileService.ts` resolves usernames, syncs profile data, and publishes created levels.
- `src/pages/CreateLevelPage.tsx` and `src/pages/PlayPage.tsx` show substantial page-level orchestration, modal logic, and async flow wiring.
- `supabase/migrations/001_leaderboards.sql` and `supabase/migrations/002_server_authoritative_scoring.sql` represent schema and RPC generation work.
- `src/types/supabase.ts` reflects generated database typings used throughout the services.

### Summary

Codex is most visible in the implementation-heavy areas of the repo: gameplay, services, migrations, and UI scaffolding.

The same pattern shows up across the repository: AI drafted the structure, and human developers validated the behavior.

## Gemini Contributions

### Overview

Gemini-style assistance is best described here as debugging and analysis support rather than implementation ownership. The repository evidence supports analysis, tracing, and edge-case review in the following areas.

### Investigation Types

| Investigation | Focus | Evidence | Outcome |
| --- | --- | --- | --- |
| Dynamic hazards | Runtime behavior tracing | `src/features/play/hooks/useGame.ts`, `src/services/standaloneExport.ts` | Confirmed under-tile preservation and tick behavior |
| Exit/hazard bugs | Root-cause analysis | `src/game/gameEngine.ts`, `src/services/levelValidation.ts`, commit history | Separated events and endpoint placement rules |
| State management | Dependency analysis | `src/context/AuthContext.tsx`, `src/hooks/useGameTimer.ts`, `src/audio/useRetroAudio.ts` | Reduced stale listener and timer risk |
| Supabase verification | SQL and data-flow review | `src/services/*`, migrations | Confirmed typed persistence boundaries |
| Import/export validation | Edge-case identification | `src/services/levelStorage.ts`, `src/services/standaloneExport.ts` | Hardened malformed-data handling |

### Representative Analyses

- Dynamic hazard movement required tracing under-tile preservation and tick behavior across both the app and the standalone export.
- Exit/hazard interactions required root-cause analysis around event mapping, endpoint placement, and level validation.
- State-management investigations focused on effect cleanup, listener lifecycles, and timer behavior.
- Supabase verification centered on schema alignment, typed row mapping, and RPC response shape.
- Import/export analysis focused on malformed input, encoding/decoding safety, and validation boundaries.

### Summary

Gemini-style support here is best understood as analysis, tracing, and edge-case review. Developers still implemented the fixes, validated behavior, and chose what shipped.

In practice, the debugging value came from helping narrow the likely failure mode before developers applied the fix.
