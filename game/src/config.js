// config.js — shared constants for The Coral Crown heist.
// Palette: deep midnight sea navy, warm coral, cream, brass. No gold/teal gallery look.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 64;
export const PLAY_TOP = 72;
export const PLAY_BOTTOM = 712;
export const PLAY_LEFT = 10;
export const PLAY_RIGHT = 1270;

export const PALETTE = {
  navyDeep: '#0a1a33',
  navy: '#10294d',
  navyFloor: '#132f57',
  carpet: '#16365f',
  carpetAlt: '#1a3d68',
  wall: '#0b1c36',
  wallTrim: '#2c4a73',
  coral: '#ff6b5e',
  coralBright: '#ff8a7a',
  coralDark: '#c94a3f',
  cream: '#f7ead1',
  sand: '#e8c98f',
  brass: '#d9a441',
  aqua: '#7fd4c1',
  violet: '#8f7bd8',
  danger: '#ff3b30',
  warn: '#ffb020',
  safe: '#58d68d',
  guardSuit: '#3d5a80',
  thief: '#23202e',
};

export const PLAYER_SPEED = 235;
export const PLAYER_RADIUS = 14;
export const GUARD_RANGE = 185;
export const GUARD_HALF_ANGLE = 0.56; // ~32 degrees
export const CAMERA_RANGE = 210;
export const CAMERA_HALF_ANGLE = 0.42;

export const TOOLS = {
  smoke: { key: '1', name: 'Smoke Bomb', cost: 2, desc: '5s smoke — blinds every cone' },
  jam: { key: '2', name: 'Camera Jam', cost: 2, desc: 'Jams nearest camera for 7s' },
  toss: { key: '3', name: 'Coin Toss', cost: 1, desc: 'Lures nearest guard to the coins' },
};

export const ALARM = {
  guardRate: 30,
  cameraRate: 22,
  decayRate: 14,
  max: 100,
};

export const TITLE = 'THE CORAL CROWN';
export const SUBTITLE = 'Midnight Vault on the SS Aurelia';
export const SHIP = 'SS Aurelia — Coral Crown Casino';
