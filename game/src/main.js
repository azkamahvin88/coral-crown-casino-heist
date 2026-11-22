// main.js — the game loop: screens, movement, sight, alarm, tools, win/lose.
// Screens: title -> playing -> levelclear -> playing ... -> won | caught.
// URL demo hooks (?demo=cover|stealth|loot|win) stage a real in-game state so
// screenshots show the game mid-heist; they change nothing about the rules.
import { VIEW_W, VIEW_H, PLAYER_SPEED, PLAYER_RADIUS, GUARD_RANGE, GUARD_HALF_ANGLE, CAMERA_RANGE, CAMERA_HALF_ANGLE, TOOLS, ALARM, PLAY_TOP, PLAY_BOTTOM, PLAY_LEFT, PLAY_RIGHT } from './config.js';
import { LEVELS, levelById } from './levels.js';
import { insideCone, lineBlocked, pointInSmoke, updateAlarm } from './vision.js';
import { makeGuard, updateGuard, nearestGuard } from './guards.js';
import { makeCamera, updateCamera, nearestCamera } from './cameras.js';
import { makeLoot, makeChips, lootNearby, grabLoot, atExit } from './loot.js';
import { makeInput, moveVector, consumePress, consumeClick, endFrame } from './input.js';
import { makeAudio } from './audio.js';
import { drawWorld, drawHUD, drawTitle, drawLevelClear, drawCaught, drawWin } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const input = makeInput(canvas);
const audio = makeAudio();

const state = {
  screen: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  player: { x: 90, y: 640, facing: 0 },
  guards: [],
  cameras: [],
  loot: null,
  chips: [],
  smokes: [],
  tossMark: null,
  alarm: 0,
  coins: 4,
  score: 0,
  seen: false,
  seenByGuard: false,
  seenByCamera: false,
  caughtReason: '',
  time: 0,
  levelTime: 0,
  finalTime: '',
  toolRects: [],
  warnCooldown: 0,
};

function blockers() {
  return state.level.covers;
}

function circleHitsRect(px, py, r, rect) {
  const cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
  return (px - cx) * (px - cx) + (py - cy) * (py - cy) < r * r;
}

function collides(px, py) {
  if (px < PLAY_LEFT + PLAYER_RADIUS || px > PLAY_RIGHT - PLAYER_RADIUS) return true;
  if (py < PLAY_TOP + PLAYER_RADIUS || py > PLAY_BOTTOM - PLAYER_RADIUS) return true;
  for (const c of state.level.covers) {
    if (circleHitsRect(px, py, PLAYER_RADIUS - 2, c)) return true;
  }
  return false;
}

export function loadLevel(index) {
  state.levelIndex = index;
  state.level = LEVELS[index];
  state.player = { x: state.level.entry.x, y: state.level.entry.y, facing: -Math.PI / 2 };
  state.guards = state.level.guards.map((g, i) => makeGuard(g, i));
  state.cameras = state.level.cameras.map((c, i) => makeCamera(c, i));
  state.loot = makeLoot(state.level);
  state.chips = makeChips(state.level);
  state.smokes = [];
  state.tossMark = null;
  state.alarm = 0;
  state.coins = state.level.startCoins;
  state.seen = false;
  state.levelTime = 0;
  state.screen = 'playing';
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function useTool(id) {
  const def = TOOLS[id];
  if (!def || state.screen !== 'playing') return false;
  if (state.coins < def.cost) return false;
  if (id === 'smoke') {
    state.smokes.push({ x: state.player.x, y: state.player.y, r: 115, t: 5 });
    state.coins -= def.cost;
    audio.blip();
    return true;
  }
  if (id === 'jam') {
    const { camera, dist } = nearestCamera(state.cameras, state.player.x, state.player.y);
    if (!camera || dist > 700) return false;
    camera.jammed = 7;
    state.coins -= def.cost;
    audio.jam();
    return true;
  }
  if (id === 'toss') {
    const { guard, dist } = nearestGuard(state.guards, state.player.x, state.player.y);
    if (!guard || dist > 520) return false;
    const tx = state.player.x + Math.cos(state.player.facing) * 190;
    const ty = state.player.y + Math.sin(state.player.facing) * 190;
    const cx = Math.max(PLAY_LEFT + 20, Math.min(PLAY_RIGHT - 20, tx));
    const cy = Math.max(PLAY_TOP + 20, Math.min(PLAY_BOTTOM - 20, ty));
    guard.lure = { x: cx, y: cy, t: 4.5 };
    state.tossMark = { x: cx, y: cy, t: 4.5 };
    state.coins -= def.cost;
    audio.coin();
    return true;
  }
  return false;
}

function update(dt) {
  state.time += dt;
  if (state.screen !== 'playing') return;
  state.levelTime += dt;
  const alarmHigh = state.alarm > 50;

  // Movement (axis-separated so walls slide instead of sticking).
  const mv = moveVector(input);
  if (mv.x !== 0 || mv.y !== 0) {
    state.player.facing = Math.atan2(mv.y, mv.x);
    const nx = state.player.x + mv.x * PLAYER_SPEED * dt;
    if (!collides(nx, state.player.y)) state.player.x = nx;
    const ny = state.player.y + mv.y * PLAYER_SPEED * dt;
    if (!collides(state.player.x, ny)) state.player.y = ny;
  }

  // Guards + cameras.
  for (const g of state.guards) updateGuard(g, dt, alarmHigh);
  for (const c of state.cameras) updateCamera(c, state.time, dt);

  // Smoke timers.
  for (const s of state.smokes) s.t -= dt;
  state.smokes = state.smokes.filter((s) => s.t > 0);
  if (state.tossMark) {
    state.tossMark.t -= dt;
    if (state.tossMark.t <= 0) state.tossMark = null;
  }

  // Sight: hidden inside smoke, otherwise cone + line of sight.
  const p = state.player;
  const inSmoke = pointInSmoke(p.x, p.y, state.smokes);
  let seenGuard = false;
  let seenCamera = false;
  if (!inSmoke) {
    for (const g of state.guards) {
      const sees = insideCone(g.x, g.y, g.facing, GUARD_RANGE, GUARD_HALF_ANGLE, p.x, p.y, blockers());
      g.alerted = sees;
      if (sees) seenGuard = true;
    }
    for (const c of state.cameras) {
      if (c.jammed > 0) continue;
      if (insideCone(c.x, c.y, c.angle, CAMERA_RANGE, CAMERA_HALF_ANGLE, p.x, p.y, blockers())) seenCamera = true;
    }
  } else {
    for (const g of state.guards) g.alerted = false;
  }
  const wasSeen = state.seen;
  state.seenByGuard = seenGuard;
  state.seenByCamera = seenCamera;
  state.seen = seenGuard || seenCamera;
  if (state.seen && !wasSeen) audio.warn();
  state.warnCooldown -= dt;
  if (state.seen && state.warnCooldown <= 0) {
    audio.warn();
    state.warnCooldown = 1.1;
  }

  // Alarm meter.
  state.alarm = updateAlarm(state.alarm, seenGuard, seenCamera, dt, ALARM);
  if (state.alarm >= ALARM.max) {
    state.screen = 'caught';
    state.caughtReason = seenGuard
      ? 'A guard spotted you crossing the open floor.'
      : 'A camera held you in frame too long.';
    audio.caught();
    return;
  }

  // Chip stacks fund the tools.
  for (const chip of state.chips) {
    if (!chip.taken && Math.hypot(chip.x - p.x, chip.y - p.y) < 26) {
      chip.taken = true;
      state.coins += 1;
      state.score += 50;
      audio.coin();
    }
  }

  // Grab the loot with E (or click on it).
  if (lootNearby(state.loot, p.x, p.y)) {
    const nearClick = input.mouse.clicked
      && Math.hypot(input.mouse.clickX - state.loot.x, input.mouse.clickY - state.loot.y) < 60;
    if (consumePress(input, 'e') || nearClick) {
      state.score += grabLoot(state.loot);
      state.score += Math.max(0, 1000 - Math.floor(state.levelTime) * 10);
      audio.grab();
    }
  }

  // Tools: keys 1/2/3 or click the HUD buttons.
  if (consumePress(input, '1')) useTool('smoke');
  if (consumePress(input, '2')) useTool('jam');
  if (consumePress(input, '3')) useTool('toss');
  const click = consumeClick(input);
  if (click) {
    for (const r of state.toolRects) {
      if (click.x >= r.x && click.x <= r.x + r.w && click.y >= r.y && click.y <= r.y + r.h) {
        useTool(r.id);
      }
    }
  }

  // Getaway: loot in hand + reach the exit.
  if (state.loot.taken && atExit(state.level, p.x, p.y)) {
    state.score += 500 + state.coins * 100;
    if (state.levelIndex >= LEVELS.length - 1) {
      state.finalTime = formatTime(state.time);
      state.screen = 'won';
      audio.win();
    } else {
      state.screen = 'levelclear';
      audio.win();
    }
  }
}

function handleScreens() {
  if (state.screen === 'title' && !state.titleReady) {
    // Keep the title over a live level-1 scene; init once, not every frame.
    state.titleReady = true;
    loadLevel(0);
    state.screen = 'title';
  }
  if (consumePress(input, 'enter') || input.mouse.clicked) {
    audio.unlock();
    if (state.screen === 'title') {
      input.mouse.clicked = false;
      loadLevel(0);
    } else if (state.screen === 'levelclear') {
      input.mouse.clicked = false;
      loadLevel(state.levelIndex + 1);
    }
  }
  if (state.screen === 'caught' && consumePress(input, 'r')) {
    loadLevel(state.levelIndex);
  }
  if (state.screen === 'won' && consumePress(input, 'r')) {
    state.score = 0;
    state.time = 0;
    loadLevel(0);
  }
  if (input.mouse.clicked && state.screen !== 'playing') input.mouse.clicked = false;
}

function frame(now) {
  const dt = Math.min(0.05, (now - (frame.last || now)) / 1000 || 0.016);
  frame.last = now;
  handleScreens();
  update(dt);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawWorld(ctx, state, state.time);
  drawHUD(ctx, state, state.time);
  if (state.screen === 'title') drawTitle(ctx, state, state.time);
  else if (state.screen === 'levelclear') drawLevelClear(ctx, state);
  else if (state.screen === 'caught') drawCaught(ctx, state);
  else if (state.screen === 'won') drawWin(ctx, state);
  endFrame(input);
  requestAnimationFrame(frame);
}

// Demo staging for screenshots: real in-game states, fast-forwarded.
function stageDemo(kind) {
  loadLevel(kind === 'win' ? 2 : kind === 'loot' ? 0 : 0);
  if (kind === 'cover') {
    state.player.x = 560;
    state.player.y = 340;
    state.player.facing = Math.PI;
    // Guard walks west toward the thief, cone on him, alarm climbing.
    state.guards[0].waypoints = [{ x: 760, y: 320 }, { x: 560, y: 320 }];
    state.guards[0].x = 760;
    state.guards[0].y = 320;
    state.guards[0].wpIndex = 1;
    state.guards[0].facing = Math.PI;
    state.alarm = 25;
    state.coins = 5;
  } else if (kind === 'stealth') {
    // Thief tucked behind the slot-machine row; the guard's cone sweeps
    // just below him, line of sight blocked by the machines.
    state.player.x = 450;
    state.player.y = 185;
    state.player.facing = Math.PI / 2;
    state.guards[0].waypoints = [{ x: 640, y: 320 }, { x: 480, y: 320 }];
    state.guards[0].x = 640;
    state.guards[0].y = 320;
    state.guards[0].wpIndex = 1;
    state.guards[0].facing = Math.PI;
    state.alarm = 30;
    state.coins = 4;
  } else if (kind === 'loot') {
    loadLevel(2);
    // At the pedestal, crown still glowing, alarm high, watcher cone near.
    state.player.x = 640;
    state.player.y = 400;
    state.player.facing = -Math.PI / 2;
    state.alarm = 68;
    state.coins = 3;
    state.score = 12500;
    state.guards[0].x = 420;
    state.guards[0].y = 120;
    state.guards[0].facing = 0;
  } else if (kind === 'win') {
    state.score = 58450;
    state.coins = 6;
    state.finalTime = '4:37';
    state.screen = 'won';
  }
  state.screen = kind === 'win' ? 'won' : 'playing';
}

// Test + automation hook: read state, teleport, start, use tools.
window.__heist = {
  state: () => ({
    screen: state.screen,
    level: state.levelIndex + 1,
    levelName: state.level.name,
    alarm: Math.round(state.alarm),
    x: Math.round(state.player.x),
    y: Math.round(state.player.y),
    lootTaken: state.loot.taken,
    coins: state.coins,
    score: state.score,
    seen: state.seen,
    guards: state.guards.map((g) => ({ x: Math.round(g.x), y: Math.round(g.y), facing: +g.facing.toFixed(2) })),
    cameras: state.cameras.map((c) => ({ x: c.x, y: c.y, angle: +c.angle.toFixed(2), jammed: Math.round(c.jammed) })),
  }),
  teleport(x, y) {
    state.player.x = x;
    state.player.y = y;
  },
  start() {
    loadLevel(0);
  },
  tool(id) {
    return useTool(id);
  },
  demo(kind) {
    stageDemo(kind);
  },
};

const params = new URLSearchParams(location.search);
if (params.get('demo')) {
  stageDemo(params.get('demo'));
} else {
  loadLevel(0);
  state.screen = 'title';
}
requestAnimationFrame(frame);
