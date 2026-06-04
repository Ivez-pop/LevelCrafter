# LevelCrafter - Phase 2 Work Distribution

## Goal

Extend the current MVP with:

* Authentication
* User Profiles
* Play History
* Gameplay Tracking
* Scoring
* Per-Level Leaderboards
* Global Rankings

---

# User Access

## Guest Users

Can:

* Create Levels
* Edit Levels
* Delete Levels
* Play Levels
* Import Levels
* Export Levels
* View Leaderboards

Cannot:

* Access Profiles
* Submit Scores
* Appear On Leaderboards
* Store Play History

---

## Authenticated Users

Can:

* Access Profile
* Submit Scores
* Appear On Leaderboards
* View Created Levels
* View Play History
* View Global Ranking

---

# Team Ownership

## Teammate 1 (Atique - Walker)

```text
Auth
Users
Profiles
Play History UI
Global Ranking UI
```

### Responsibilities

#### Authentication

* Registration
* Login
* Logout
* JWT Authentication
* Protected Routes

#### Profile

Create and maintain:

```text
/profile
```

Profile should contain:

* User Information
* Created Levels
* Play History
* Global Ranking

#### Created Levels

Display levels created by the logged-in user.

Supported actions:

* View
* Edit
* Delete

#### Play History

Display gameplay history.

Examples:

* Recently Played Levels
* Previous Attempts
* Best Runs

#### APIs

Own:

* Authentication APIs
* User APIs
* Profile APIs

#### Database

Own user-related tables and profile-related data.

---

## Teammate 2 (Yuvraj - Ivez)

```text
Timer
Moves
Scoring
Per-Level Leaderboards
Global Ranking Engine
```

### Responsibilities

#### Gameplay Tracking

Implement:

* Timer Tracking
* Move Tracking
* Gameplay Session Tracking

Track gameplay performance whenever a level is completed.

---

#### Scoring

Design and implement the scoring system.

Requirements:

* Fair ranking mechanism
* Consistent scoring across levels
* Compatible with leaderboards

Implementation details are left to the owner.

---

#### Per-Level Leaderboards

Every map must have its own leaderboard.

Requirements:

* Rankings specific to a level
* Accessible from Play Mode
* Display rankings for that level only

Example:

```text
[Leaderboard] [Play]
```

on every level card.

---

#### Global Ranking Engine

Implement platform-wide rankings.

### Required Rule

Only a player's highest score on a map contributes to the global ranking.

Multiple runs on the same map must not create multiple contributions.

This prevents leaderboard farming.

---

#### Gameplay Records

Store gameplay performance information.

Examples:

* Completion Time
* Move Count
* Score
* Completion Date

Implementation details are left to the owner.

---

#### APIs

Own:

* Gameplay APIs
* Score APIs
* Leaderboard APIs
* Ranking APIs

#### Database

Own gameplay-related and leaderboard-related tables.

---

# Shared Contract

Both teammates must agree on:

* User ID Format
* Level ID Format
* JWT Payload Structure
* API Contracts
* Database Relationships
* Score Submission Contract

These contracts should be finalized before development begins.

---

# Dependency

```text
Teammate 1
    ↑
Play History
    ↑
Gameplay Records
    ↓
Teammate 2

Teammate 2
    ↑
Score Submission
    ↑
Authenticated Users
    ↓
Teammate 1
```

---

# High-Level Flow

```text
Guest User
    ↓
Play Level

Authenticated User
    ↓
Login
    ↓
Play Level
    ↓
Track Gameplay
    ↓
Calculate Score
    ↓
Update Rankings
    ↓
Update Play History
```

---

# Notes

* Per-Level Leaderboards belong to individual maps.
* Global Ranking is displayed inside the Profile page.
* Global Ranking is computed using the player's best score from each map.
* Leaderboards remain viewable by guests.
* Only authenticated users can submit scores.
