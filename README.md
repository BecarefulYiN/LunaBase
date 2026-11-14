
# LunaBase

A playable lunar-base survival game prototype built with React and JavaScript. Learn the ECLSS basics in the opening briefing, then explore a walkable lunar surface and complete field objectives while tracking oxygen, food, power, water, and crew condition.

## Start the game

You need Node.js 20.19+ or 22.12+ installed.

1. Open a terminal in this `LunaBase` folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local address printed in the terminal (usually `http://localhost:5173`).

For a production build, run `npm run build`; to view it locally, run `npm run preview`.

## How to play

The opening briefing introduces water, oxygen, air filtration, power, and food. Select **Start exploring** to enter the game screen. Move the astronaut with **WASD** or the **arrow keys**. Walk near a glowing marker and press **E** to see its animated tutorial; start the mini-game when you're ready. On touch screens, use the on-screen direction pad and investigate button. Extract an ice core by timing the heater, repeat the scanner pattern to collect a rock sample, and tune both signal channels to repair the relay. Each task is checked off only after its mini-game is completed. Discoveries improve water, power, oxygen-system prospects, or crew morale.

Use **Advance one sol** to progress the survival simulation. Supplies decrease and crew condition shifts each day; **Repack food supplies** restores some food at a morale cost. The crew starts with 100 stamina; completing each field task uses 25. Keep critical resources above zero and reach Sol 30.

All displayed rates and quantities are illustrative balancing values for this game. They are not NASA facts, mission specifications, or engineering guidance.

## Project structure

```text
LunaBase/
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx       # Game screen, ECLSS info panel, objectives and opening briefing
    ├── game.js       # Game state, actions, daily simulation, win/loss rules
    ├── Moonwalk.jsx  # Walkable lunar surface and exploration controls
    ├── MissionMinigame.jsx # Individual games for the three field objectives
    ├── main.jsx      # React entry point
    └── styles.css    # Responsive visual design
```
# LunaBase
 aba2a4a9667c4f7fd24f0b9514dc9221dd894967
