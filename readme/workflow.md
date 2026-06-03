# LevelCrafter - Development Scope & Team Split

## Project Overview

LevelCrafter is a browser-based level editor and playtesting tool that allows users to:

1. Create a level
2. Save the level
3. Load the level
4. Playtest the level

Theme:

> Design it. Save it. Play it.

---

# Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* localStorage

---

# MVP Features

## Home Page

User chooses:

* Create Level
* Play Level

---

## Create Mode

### Difficulty Selection

* Easy → 5x5 Grid
* Medium → 8x8 Grid
* Hard → 12x12 Grid

### Tile Palette

* Empty
* Wall
* Coin
* Hazard
* Player Start
* Exit

### Editor Features

* Click to place tile
* Click to erase tile
* Visual grid editor
* Save Level
* Load Level
* Playtest Button

---

## Play Mode

### Difficulty Selection

* Easy
* Medium
* Hard

Loads the corresponding saved level.

### Controls

* W → Up
* A → Left
* S → Down
* D → Right

### Gameplay Rules

#### Wall

Blocks movement.

#### Coin

Collectible item.

#### Hazard

Restarts level.

#### Exit

Triggers win screen.

#### Player Start

Determines spawn location.

---

# Team Work Allocation

## Developer 1 — Create Mode Owner (Atique - walker)

### Responsibilities

* Home Page UI
* Difficulty Selection
* Grid Generation
* Tile Palette
* Tile Placement
* Erase Functionality
* Editor UI
* Save JSON
* Load JSON
* localStorage Write Logic
* Playtest Button

### Deliverable

Produces and stores a valid Level object.

---

## Developer 2 — Play Mode Owner (Yuvraj - ivez)

### Responsibilities

* Play Mode UI
* Difficulty Selection
* Load Saved Level
* Player Spawn Logic
* WASD Controls
* Collision Detection
* Coin Collection
* Hazard Detection
* Restart Logic
* Exit Detection
* Win Screen

### Deliverable

Consumes the stored Level object and provides a playable experience.

---

# Shared Ownership

The following should be agreed upon BEFORE development begins:

* Level Interface
* Tile Mapping
* localStorage Keys
* Routing
* Integration Testing

---

# Shared Data Contract

Both modules MUST use the exact same interface.

```ts
export type Tile =
  | "empty"
  | "wall"
  | "coin"
  | "hazard"
  | "player"
  | "exit";

export interface Level {
  difficulty: "easy" | "medium" | "hard";
  width: number;
  height: number;
  grid: Tile[][];
}
```

---

# Tile Rules

## Allowed Tiles

```text
empty
wall
coin
hazard
player
exit
```

## Validation Rules

* Exactly ONE player tile allowed.
* Exactly ONE exit tile allowed.
* Multiple coins allowed.
* Multiple hazards allowed.
* Multiple walls allowed.
* Empty tiles allowed anywhere.

---

# localStorage Contract

Developer 1 writes:

```text
easy-level
medium-level
hard-level
```

Example:

```ts
localStorage.setItem(
  "easy-level",
  JSON.stringify(level)
);
```

Developer 2 reads:

```ts
localStorage.getItem("easy-level");
```

These keys must not change.

---

# Integration Contract

Developer 2 should NOT wait for the editor to be completed.

A sample level should be created on Day 1:

```ts
export const sampleLevel: Level = {
  difficulty: "easy",
  width: 5,
  height: 5,
  grid: [
    ["wall","wall","wall","wall","wall"],
    ["wall","player","empty","coin","wall"],
    ["wall","empty","hazard","exit","wall"],
    ["wall","empty","empty","empty","wall"],
    ["wall","wall","wall","wall","wall"]
  ]
};
```

This allows Play Mode development to begin immediately.

---

# Demo Flow

1. Open Application
2. Select Create Level
3. Choose Difficulty
4. Generate Grid
5. Place Walls
6. Place Coins
7. Place Hazard
8. Place Player Start
9. Place Exit
10. Save Level
11. Click Playtest
12. Move Using WASD
13. Collect Coin
14. Avoid Hazard
15. Reach Exit
16. Display Win Screen

---

# Stretch Goals (Only If MVP Is Complete)

* Drag-to-paint tiles
* Better graphics/icons
* Import/Export JSON file
* Multiple levels per difficulty
* Level validation messages
* Score tracking

---

# Success Criteria

A user should be able to:

Create a level → Save it → Load it → Play it → Reach the exit and win.

If this flow works smoothly, the MVP is complete.
