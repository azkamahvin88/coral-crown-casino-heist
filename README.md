# The Coral Crown — Midnight Vault on the SS Aurelia

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?ref=d7ry1fct)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/azkamahvin88/coral-crown-casino-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?ref=d7ry1fct)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/azkamahvin88/coral-crown-casino-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?ref=d7ry1fct)

A top-down stealth heist game built for make.fun's **"Make the best heist game"** bounty
($50 in USDC). Play it here: [make.fun bounty page](https://make.fun/bounty/best-heist-game-20261122-0559?ref=d7ry1fct).

## The job

A coral-and-diamond crown sits in the vault of the **SS Aurelia**, a cruise-ship
casino sailing through the night. You are the thief. Cross three decks, lift the
loot, and reach the getaway boat before the crew catches you:

1. **Deck 1 — Casino Floor**: steal the High-Roller Chip Case between the slot machines.
2. **Deck 2 — Vault Corridor**: lift The Duchess Sapphire past the pillars and two cameras.
3. **Deck 3 — The Vault**: take **The Coral Crown** itself from its pedestal — three
   cameras, two patrols, and one watcher who never walks.

## How to play

- **WASD / Arrow keys** — move the thief. **Mouse** — click HUD tool buttons.
- **E** — grab the loot when you are close to it. The exit unlocks only after the loot is taken.
- **1 — Smoke Bomb** (2 coins): 5 seconds of smoke that blinds every vision cone.
- **2 — Camera Jam** (2 coins): jams the nearest camera for 7 seconds.
- **3 — Coin Toss** (1 coin): lures the nearest guard toward the tossed coins.
- Grab golden **chip stacks** to earn coins for tools.
- Hide behind slot machines, tables, pillars and display cases — **cover blocks every
  vision cone**. The **ALARM** meter rises while a guard or camera sees you and falls
  while you stay hidden. At 100% you are caught.
- **Enter** — start / next deck. **R** — retry a deck after being caught, or play again
  after the getaway.

## Run it

No build step, no network requests — plain static files:

```sh
# serve game/ with any static server, then open it in desktop Chrome
python3 -m http.server 8080 --directory game
```

Or open `game/index.html` directly from the repository.

## Structure

- `game/index.html` — the page; canvas + HUD.
- `game/src/main.js` — game loop, screens (title / playing / level clear / caught / getaway), tools, win/lose.
- `game/src/config.js` — constants and the navy + coral palette.
- `game/src/levels.js` — the three decks: covers, patrols, cameras, loot, entry/exit.
- `game/src/vision.js` — vision cones, line-of-sight blocking, the alarm meter.
- `game/src/guards.js` — patrol guards, waypoint loops, lures, high-alarm speed-up.
- `game/src/cameras.js` — sweeping wall cameras and the jam timer.
- `game/src/loot.js` — loot, chip stacks, and the getaway door.
- `game/src/input.js` — keyboard + mouse.
- `game/src/render.js` — all art drawn in code (canvas): carpet, slots, vault cases, cones, HUD.
- `game/src/audio.js` — synthesized WebAudio sounds; no audio files.
- `main.ts` — hands the game in: copies `game/` + `screenshots/` to `/output` and writes
  `/output/dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

## Screenshots

1. `1-cover.jpg` — mid-heist: thief caught in a guard's cone, alarm climbing, camera cone over the glowing loot.
2. `2-stealth.jpg` — hiding behind the slot machines while a cone sweeps past.
3. `3-loot.jpg` — at the Coral Crown's pedestal, alarm at 72%.
4. `4-getaway.jpg` — the getaway screen after clearing all three decks.

All four are real renders of this game's own code in Chromium, unedited.

## License

MIT — see [LICENSE](LICENSE). All names, art, sounds and levels are original, made in code.
