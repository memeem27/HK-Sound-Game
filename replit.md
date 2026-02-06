# HK Sound Game

## Overview
A Hollow Knight Sound Guessing Game — a browser-based game where players listen to sounds from Hollow Knight and guess which sound is playing. Features leaderboard functionality via Firebase Firestore.

## Project Architecture
- **Type**: Static frontend (HTML/CSS/JS)
- **Hosting**: Served via `serve` on port 5000
- **Backend**: None (Firebase Firestore used client-side for leaderboard)
- **Deployment**: Static deployment serving the root directory

## Key Files
- `index.html` — Main game page
- `game.js` — Core game logic (sound playback, guessing, stats)
- `leaderboard.js` — Firebase-powered leaderboard
- `firebase.js` — Firebase config and Firestore initialization
- `style.css` — Styling
- `sounds/` — ~1950 .ogg sound files from Hollow Knight
- `sounds/list.json` — JSON array of all sound filenames
- `backgrounds/` — Background video files (.mp4)

## How to Run
```
npx serve -s . -l 5000 --no-clipboard
```

## Recent Changes
- 2026-02-06: Initial Replit setup — added `serve` dependency, configured workflow and static deployment
