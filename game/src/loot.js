// loot.js — the score: one big loot per deck, small chip stacks to fund tools,
// and the getaway door that only opens once the loot is taken.
export function makeLoot(level) {
  return {
    x: level.loot.x,
    y: level.loot.y,
    name: level.lootName,
    value: level.lootValue,
    taken: false,
    sparkle: 0,
  };
}

export function makeChips(level) {
  return level.chips.map((c) => ({ x: c.x, y: c.y, taken: false }));
}

export function lootNearby(loot, px, py) {
  if (loot.taken) return false;
  return Math.hypot(loot.x - px, loot.y - py) < 46;
}

export function grabLoot(loot) {
  loot.taken = true;
  return loot.value;
}

export function exitOpen(loot) {
  return loot.taken;
}

export function atExit(level, px, py) {
  return Math.hypot(level.exit.x - px, level.exit.y - py) < 40;
}

export function atEntry(level, px, py) {
  return Math.hypot(level.entry.x - px, level.entry.y - py) < 30;
}
