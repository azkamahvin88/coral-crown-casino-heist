// levels.js — the three decks of the SS Aurelia.
// Each level: the thief enters at entry, grabs the loot, then reaches the exit.
// Covers are solid furniture that block guard and camera sight lines.
export const LEVELS = [
  {
    id: 1,
    name: 'DECK 1 — CASINO FLOOR',
    hint: 'Slip between the slot machines. The chip case sits in the glass cabinet up top.',
    lootName: 'High-Roller Chip Case',
    lootValue: 2500,
    entry: { x: 90, y: 640 },
    exit: { x: 1190, y: 640 },
    loot: { x: 640, y: 138 },
    covers: [
      { x: 280, y: 210, w: 96, h: 56, kind: 'slots', label: 'SLOTS' },
      { x: 404, y: 210, w: 96, h: 56, kind: 'slots', label: 'SLOTS' },
      { x: 528, y: 210, w: 96, h: 56, kind: 'slots', label: 'SLOTS' },
      { x: 740, y: 210, w: 96, h: 56, kind: 'slots', label: 'SLOTS' },
      { x: 864, y: 210, w: 96, h: 56, kind: 'slots', label: 'SLOTS' },
      { x: 988, y: 210, w: 96, h: 56, kind: 'slots', label: 'SLOTS' },
      { x: 300, y: 420, w: 130, h: 74, kind: 'table', label: 'ROULETTE' },
      { x: 660, y: 430, w: 130, h: 74, kind: 'table', label: 'BLACKJACK' },
      { x: 1000, y: 420, w: 120, h: 74, kind: 'table', label: 'POKER' },
      { x: 90, y: 330, w: 56, h: 170, kind: 'bar', label: 'BAR' },
    ],
    guards: [
      { waypoints: [{ x: 200, y: 320 }, { x: 1080, y: 320 }], speed: 78 },
      { waypoints: [{ x: 1150, y: 160 }, { x: 1150, y: 600 }], speed: 66 },
    ],
    cameras: [
      { x: 640, y: 82, base: Math.PI / 2, sweep: 0.85, speed: 0.55 },
    ],
    chips: [{ x: 350, y: 540 }, { x: 640, y: 520 }, { x: 950, y: 560 }],
    startCoins: 4,
  },
  {
    id: 2,
    name: 'DECK 2 — VAULT CORRIDOR',
    hint: 'Pillars are your friends. Two cameras watch the sapphire vault door.',
    lootName: "The Duchess Sapphire",
    lootValue: 9000,
    entry: { x: 90, y: 640 },
    exit: { x: 1190, y: 100 },
    loot: { x: 640, y: 138 },
    covers: [
      { x: 300, y: 240, w: 74, h: 74, kind: 'pillar', label: '' },
      { x: 300, y: 460, w: 74, h: 74, kind: 'pillar', label: '' },
      { x: 603, y: 240, w: 74, h: 74, kind: 'pillar', label: '' },
      { x: 603, y: 460, w: 74, h: 74, kind: 'pillar', label: '' },
      { x: 906, y: 240, w: 74, h: 74, kind: 'pillar', label: '' },
      { x: 906, y: 460, w: 74, h: 74, kind: 'pillar', label: '' },
      { x: 480, y: 340, w: 110, h: 52, kind: 'crate', label: 'CRATES' },
      { x: 720, y: 340, w: 110, h: 52, kind: 'crate', label: 'CRATES' },
    ],
    guards: [
      { waypoints: [{ x: 180, y: 620 }, { x: 1100, y: 620 }], speed: 88 },
      { waypoints: [{ x: 430, y: 150 }, { x: 430, y: 620 }], speed: 76 },
      { waypoints: [{ x: 850, y: 150 }, { x: 850, y: 620 }], speed: 76 },
    ],
    cameras: [
      { x: 300, y: 82, base: Math.PI / 2, sweep: 0.7, speed: 0.7 },
      { x: 980, y: 82, base: Math.PI / 2, sweep: 0.7, speed: 0.7 },
    ],
    chips: [{ x: 200, y: 540 }, { x: 640, y: 560 }, { x: 1080, y: 540 }],
    startCoins: 4,
  },
  {
    id: 3,
    name: 'DECK 3 — THE VAULT',
    hint: 'The Coral Crown waits on its pedestal. Three cameras, two patrols, one watcher who never walks.',
    lootName: 'The Coral Crown',
    lootValue: 50000,
    entry: { x: 90, y: 640 },
    exit: { x: 1190, y: 640 },
    loot: { x: 640, y: 330 },
    covers: [
      { x: 330, y: 200, w: 104, h: 62, kind: 'case', label: 'PEARLS' },
      { x: 846, y: 200, w: 104, h: 62, kind: 'case', label: 'EMERALDS' },
      { x: 330, y: 480, w: 104, h: 62, kind: 'case', label: 'RUBIES' },
      { x: 846, y: 480, w: 104, h: 62, kind: 'case', label: 'OPALS' },
      { x: 590, y: 150, w: 100, h: 46, kind: 'case', label: 'DIAMONDS' },
      { x: 180, y: 330, w: 60, h: 120, kind: 'pillar', label: '' },
      { x: 1040, y: 330, w: 60, h: 120, kind: 'pillar', label: '' },
    ],
    guards: [
      { waypoints: [{ x: 220, y: 120 }, { x: 1060, y: 120 }], speed: 96 },
      { waypoints: [{ x: 220, y: 600 }, { x: 1060, y: 600 }], speed: 96 },
      { waypoints: [{ x: 640, y: 560 }], speed: 0, spin: true },
    ],
    cameras: [
      { x: 200, y: 82, base: Math.PI / 2, sweep: 0.6, speed: 0.85 },
      { x: 640, y: 82, base: Math.PI / 2, sweep: 0.6, speed: 0.85 },
      { x: 1080, y: 82, base: Math.PI / 2, sweep: 0.6, speed: 0.85 },
    ],
    chips: [{ x: 250, y: 540 }, { x: 640, y: 610 }, { x: 1030, y: 540 }],
    startCoins: 5,
  },
];

export function levelById(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}
