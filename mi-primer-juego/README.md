# Late Night Feature

A puzzle game starring slasher icons, made with Phaser 3 and inspired by "killer puzzle" games: Art the clown slides
in a straight line until he hits something, and if he hits a victim, he eliminates them.

## Rules

- The game is split into worlds, each with its own killer and 5 levels. World 1 stars Art the clown; World 2 is coming soon.
- Levels unlock one by one from the level select screen (3 to 5 victims, harder each level).
- Eliminate every victim without going over the move limit (the minimum + 2); if you run out, the level restarts.
- Then the last victim appears: you only have a few moves to reach her (shown on screen).
- When you reach her, stop the needle in the green zone 3 times in a row.
- If she escapes, the level still counts as cleared, but with fewer points.

## Controls

Arrows or WASD to move, Z to undo, R to restart, Esc to go back to the menu.
On touch screens: swipe to move and tap to strike.

## Running

Open `index.html` with Live Server (VS Code). An internet connection is needed to load Phaser and the fonts.

## Structure

- `js/config.js`: constants, levels and difficulty
- `js/textures.js`: graphics drawn in code
- `js/sfx.js`: sounds synthesized with Web Audio
- `js/scenes/`: menu, options, help, game and results
