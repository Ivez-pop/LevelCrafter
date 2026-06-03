# LevelCrafter

## Track

Game Tools & Engines

## Problem Statement

Build a simple level editor that lets users create a small 2D maze or platformer-style level, save it as JSON, load it back, and playtest it.

The focus is not on building a professional game engine. The goal is to create a useful mini tool that allows someone to design a level and immediately test it.

## Theme

Design it. Save it. Play it.

## Core Requirements

Your project must include:

1. A grid-based level editor.
2. At least **5 tile or object types**, such as:
   - Wall or ground
   - Empty space
   - Player start
   - Coin
   - Enemy
   - Hazard
   - Exit
3. Click-to-place functionality.
4. Erase functionality.
5. Save or export level as JSON.
6. Load or import level from JSON.
7. Playtest mode using the created level.
8. Basic instructions for using the editor.

## Minimum Viable Product

A successful MVP should have:

- A working grid editor.
- Tile/object palette.
- Save/export JSON.
- Load/import JSON.
- A simple playtest mode.
- One sample level.

A top-down maze editor is acceptable and recommended for scope control.

## Example JSON Format

Your exported level may follow this structure:

- levelName: First Maze
- width: 10
- height: 8
- playerStart: x = 1, y = 1
- objects:
  - wall at x = 0, y = 0
  - coin at x = 4, y = 3
  - enemy at x = 6, y = 4
  - hazard at x = 7, y = 2
  - exit at x = 9, y = 7

## Playtest Mode Requirements

In playtest mode:

1. The player should spawn at the selected start position.
2. Walls or ground should block movement.
3. Coins or objectives should be collectible.
4. Hazards or enemies should cause failure or restart.
5. Reaching the exit should show a win message.

## Suggested Tech Stack

You may use any stack, including:

- HTML Canvas
- React
- Phaser
- Pygame
- Godot
- Unity
- JavaScript
- Python

A browser-based editor is recommended for easy demoing.

## Stretch Goals

- Drag-to-paint tiles
- Undo/redo
- Enemy patrol paths
- Moving hazards
- Multiple levels
- Shareable level code
- Level validation
- Different visual themes
- Export as standalone playable game
- Auto-generate a starter level

## AI Tool Usage

You may use AI tools for:

- UI design
- Code generation
- JSON schema design
- Debugging
- Creating sample levels
- Writing documentation

You must mention in your final README how AI tools were used.

## Demo Expectations

Your final demo should show:

1. Creating a level from scratch.
2. Placing walls, coins, hazards, player start, and exit.
3. Exporting the level as JSON.
4. Loading the level back.
5. Playing the level in playtest mode.
6. Reaching the win condition.

## Judging Focus

You will be judged on:

- Tool usefulness
- Completeness
- Ease of use
- Save/load functionality
- Playtest quality
- Demo quality
