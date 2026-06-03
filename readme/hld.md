# High Level Design (HLD)

## User Flow

```text
                    ┌──────────────┐
                    │  Home Page   │
                    └──────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼

     ┌──────────────┐              ┌──────────────┐
     │ Create Mode  │              │  Play Mode   │
     └──────┬───────┘              └──────┬───────┘
            │                             │
            ▼                             ▼

     ┌──────────────┐              ┌──────────────┐
     │ Difficulty   │              │ Difficulty   │
     │ Selection    │              │ Selection    │
     └──────┬───────┘              └──────┬───────┘
            │                             │
            ▼                             ▼

     ┌──────────────┐              ┌──────────────┐
     │ Grid Editor  │              │ Fetch Saved  │
     │              │              │ Level JSON   │
     └──────┬───────┘              └──────┬───────┘
            │                             │
            │                             ▼
            │                     ┌──────────────┐
            │                     │ Play Engine  │
            │                     └──────────────┘
            │
            ▼

     ┌──────────────┐
     │ Save Level   │
     │ (JSON +      │
     │ localStorage)│
     └──────┬───────┘
            │
            ▼

     ┌──────────────┐
     │ Playtest     │
     │ From Editor  │
     └──────────────┘
```

---

## System Architecture

```text
┌──────────────────────────────────────┐
│              React App               │
└─────────────────┬────────────────────┘
                  │
                  ▼

┌──────────────────────────────────────┐
│              Home Page               │
├──────────────────────────────────────┤
│ Create Level                         │
│ Play Level                           │
└──────────────┬───────────────┬───────┘
               │               │
               ▼               ▼

      CREATE FLOW         PLAY FLOW
```

### Create Flow

```text
┌─────────────────────────────┐
│ Difficulty Selector         │
│ Easy 5x5                    │
│ Medium 8x8                  │
│ Hard 12x12                  │
└─────────────┬───────────────┘
              │
              ▼

┌─────────────────────────────┐
│ Grid Generator              │
└─────────────┬───────────────┘
              │
              ▼

┌─────────────────────────────┐
│ Level Editor                │
├─────────────────────────────┤
│ Empty                       │
│ Wall                        │
│ Coin                        │
│ Hazard                      │
│ Player Start                │
│ Exit                        │
└─────────────┬───────────────┘
              │
              ▼

┌─────────────────────────────┐
│ Level State                 │
│ (2D Grid Array)             │
└──────┬───────────┬──────────┘
       │           │
       ▼           ▼

 Save JSON    Playtest Mode
```

### Play Flow

```text
┌─────────────────────────────┐
│ Difficulty Selection        │
└─────────────┬───────────────┘
              │
              ▼

┌─────────────────────────────┐
│ Load JSON From Storage      │
│ easy-level                  │
│ medium-level                │
│ hard-level                  │
└─────────────┬───────────────┘
              │
              ▼

┌─────────────────────────────┐
│ Play Engine                 │
└─────────────┬───────────────┘
              │
              ▼

┌─────────────────────────────┐
│ WASD Controls               │
│ Wall Collision              │
│ Coin Collection             │
│ Hazard Detection            │
│ Exit Detection              │
└─────────────┬───────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼

  Restart         Win Screen
```

---

## Core Data Flow

```text
Create Mode
     │
     ▼

Level Object
     │
     ▼

JSON Serialization
     │
     ▼

localStorage
     │
     ▼

JSON Deserialization
     │
     ▼

Play Mode
```

---

## Single Source of Truth

Everything in the application revolves around:

```ts
interface Level {
  difficulty: "easy" | "medium" | "hard";
  width: number;
  height: number;
  grid: Tile[][];
}
```

The Editor creates it.

The Save system stores it.

The Play Engine consumes it.

```
```
