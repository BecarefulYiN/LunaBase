
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

Select **Enter base** to open the habitat interior. The oxygen generator converts water and power into stored base oxygen; use the suit dock to transfer base oxygen into the EVA suit. The air scrubber improves clean-air quality. Eat a ration to restore satiety. Moving outside and completing field work consumes suit oxygen, so return to the base to recharge before it runs out.

Use **Advance one sol** to progress the survival simulation. Supplies decrease and crew condition shifts each day; **Earth-assisted food mission** unlocks after restoring the relay. Send your inventory, match the packing targets, and confirm to transfer up to 8 units from a finite onboard reserve (initially 80) into ready food. This costs 1 stamina and is available once per day. Cancelling spends nothing; Earth sends planning information, not food. The crew starts each day with 5 stamina; each completed field or base task uses 1. Keep critical resources above zero and complete the 14-sol mission.

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


## Replay variation

Scanner patterns, signal targets, ice control windows, solar coupler orientations, and water sample/choice order vary on each new attempt. A challenge remains fixed while retrying within it. Food packing rotates through three scenarios by mission day, with randomized allocations constrained by stock. Ice extraction includes a slow mode. All challenges are simplified training activities.

## AI assistance

ChatGPT assisted with the food-packing mini-game, replay variation, integration fixes, and automated logic/build checks. Browser interaction and educational review require human testing.

## NASA learning notes

Each mini-game now ends with a child-friendly NASA knowledge card before reward confirmation. Cards distinguish source-backed facts, educational relevance, and fictional mechanics. These are paraphrases of official NASA pages and mission records, not live API data or NASA-approved game parameters. Source review date: 2026-11-15.

- ice: [NASA Science — LCROSS mission record](https://science.nasa.gov/mission/lcross/)
- sample: [NASA — Apollo 11 Mission Overview](https://www.nasa.gov/missions/apollo/apollo-11-mission-overview/)
- beacon: [NASA — Space Communications and Navigation: Supporting Exploration](https://www.nasa.gov/directorates/somd/space-communications-navigation-program/nasa-space-communications-and-navigation-supporting-exploration/)
- purifyWater: [NASA — Environmental Control and Life Support Systems](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/)
- chargePower: [NASA — Solar Arrays on the International Space Station](https://www.nasa.gov/image-article/solar-arrays-international-space-station/)
- food: [NASA — Space Food Systems](https://www.nasa.gov/directorates/esdmd/hhp/space-food-systems/); [NASA — Space Communications and Navigation: Supporting Exploration](https://www.nasa.gov/directorates/somd/space-communications-navigation-program/nasa-space-communications-and-navigation-supporting-exploration/)
