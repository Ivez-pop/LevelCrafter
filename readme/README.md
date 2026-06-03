# LevelCrafter

LevelCrafter is a browser-based level editor and playtesting platform where users can create, save, and play custom puzzle levels.

---

## Features

### Create Mode

* Create custom levels using a grid editor
* Name your levels
* Difficulty-based grid generation:

  * Easy → 5×5
  * Medium → 8×8
  * Hard → 12×12
* Place:

  * Walls
  * Coins
  * Hazards
  * Player Spawn
  * Exit
* Save levels locally
* Export levels as JSON

### Play Mode

* Browse levels by difficulty
* Select a level to play
* WASD movement controls
* Collision detection
* Coin collection
* Hazard restart
* Exit and win condition

---

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* LocalStorage

---

## Getting Started

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

---

## Project Structure

```text
src/
├── components/
├── pages/
├── game/
├── utils/
├── constants/
├── types/
└── App.tsx
```

---

## Documentation

Additional documentation can be found in:

* `readme/hld.md`
* `readme/workflow.md`

---

## Core Flow

```text
Create Level
    ↓
Choose Difficulty
    ↓
Build Map
    ↓
Save Level
    ↓
Play Mode
    ↓
Choose Difficulty
    ↓
Select Level
    ↓
Play
```

---

## Controls

```text
W → Move Up
A → Move Left
S → Move Down
D → Move Right
```

---

## License

MIT
