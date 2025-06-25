# Dumbplay Game Script

This repository contains the JavaScript code for the Dumbplay game project. It provides essential game statistics tracking functionality that can be integrated into the Dumbplay game.

Repo link: https://github.com/satoshiman/dumbplay-js.git

## Features

- Score tracking and display
- Best score management
- Player position tracking
- Ticket system integration
- DOM element updates for game UI

## Project Structure

- `src/` - Source files
  - `checking.js` - Checking game statistics
  - `stats.js` - Main game statistics implementation
  - `api.js` - API integration for game statistics
  - `wallet.js` - Wallet integration for game statistics
  - `utils.js` - Utility functions for game statistics
  - `main.js` - Main game script
- `dist/` - Distribution files
  - `script.js` - Built distribution file
- `gulpfile.js` - Build configuration

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
   This will concatenate and process the source files into a single distributable script.

## Usage

The built `script.js` file can be included in your Dumbplay game project. It provides a `GameStats` object with the following methods:

- `updateScore(newScore)` Update current score
- `updateBestScore(newBestScore)` Update best score
- `updatePosition(newPosition)` Update player position
- `getCurrentScore()` Get current score
- `getBestScore()` Get best score
- `getCurrentPosition()` Get current position
- `getTickets()` Get ticket count
- `resetScore()` Reset current score
- `resetAll()` Reset all statistics
