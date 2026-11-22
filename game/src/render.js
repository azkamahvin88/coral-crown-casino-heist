// render.js — every pixel is drawn in code: carpet, slot machines, vault cases,
// vision cones, the glowing loot, and the HUD with the alarm meter.
import { PALETTE, VIEW_W, VIEW_H, HUD_H, PLAY_TOP, PLAY_BOTTOM, PLAY_LEFT, PLAY_RIGHT, TOOLS } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawCone(ctx, x, y, facing, range, halfAngle, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha + 0.25);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawFloor(ctx, t) {
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(0, PLAY_TOP, VIEW_W, PLAY_BOTTOM - PLAY_TOP);
  // Diamond carpet tiles.
  ctx.save();
  ctx.strokeStyle = PALETTE.carpetAlt;
  ctx.lineWidth = 2;
  const s = 64;
  for (let row = -1; row < 12; row++) {
    for (let col = -1; col < 21; col++) {
      const cx = col * s + (row % 2 ? s / 2 : 0);
      const cy = PLAY_TOP + row * s + s / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 26);
      ctx.lineTo(cx + 26, cy);
      ctx.lineTo(cx, cy + 26);
      ctx.lineTo(cx - 26, cy);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
  // Warm pool of light under the chandeliers.
  const glow = ctx.createRadialGradient(640, 380, 40, 640, 380, 520);
  glow.addColorStop(0, 'rgba(255, 214, 140, 0.10)');
  glow.addColorStop(1, 'rgba(255, 214, 140, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, PLAY_TOP, VIEW_W, PLAY_BOTTOM - PLAY_TOP);
  // Walls.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, HUD_H, VIEW_W, PLAY_TOP - HUD_H);
  ctx.fillRect(0, PLAY_BOTTOM, VIEW_W, VIEW_H - PLAY_BOTTOM);
  ctx.fillRect(0, HUD_H, PLAY_LEFT, VIEW_H - HUD_H);
  ctx.fillRect(PLAY_RIGHT, HUD_H, VIEW_W - PLAY_RIGHT, VIEW_H - HUD_H);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, PLAY_TOP - 3, VIEW_W, 3);
  ctx.fillRect(0, PLAY_BOTTOM, VIEW_W, 3);
}

function drawCover(ctx, c, t) {
  ctx.save();
  if (c.kind === 'slots') {
    ctx.fillStyle = '#1d3a5f';
    roundRect(ctx, c.x, c.y, c.w, c.h, 8);
    ctx.fill();
    ctx.fillStyle = '#274b78';
    roundRect(ctx, c.x + 6, c.y + 6, c.w - 12, c.h - 22, 6);
    ctx.fill();
    // Blinking slot lights.
    const cols = [PALETTE.coral, PALETTE.brass, PALETTE.aqua, PALETTE.violet];
    for (let i = 0; i < 3; i++) {
      const on = Math.sin(t * 3 + c.x * 0.05 + i * 2.1) > -0.2;
      ctx.fillStyle = on ? cols[(i + (c.x % 4)) % 4] : '#12263f';
      ctx.beginPath();
      ctx.arc(c.x + 22 + i * 26, c.y + 20, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h - 6);
  } else if (c.kind === 'table') {
    ctx.fillStyle = '#5d1f24';
    roundRect(ctx, c.x, c.y, c.w, c.h, 30);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 10, c.h / 2 - 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2 - 24, c.y + c.h / 2 - 12, 5, 0, Math.PI * 2);
    ctx.arc(c.x + c.w / 2 + 24, c.y + c.h / 2 + 12, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (c.kind === 'bar') {
    ctx.fillStyle = '#3a2417';
    roundRect(ctx, c.x, c.y, c.w, c.h, 8);
    ctx.fill();
    ctx.fillStyle = PALETTE.brass;
    ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, 8);
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(c.label, 0, 4);
    ctx.restore();
  } else if (c.kind === 'pillar') {
    ctx.fillStyle = '#243b5e';
    roundRect(ctx, c.x, c.y, c.w, c.h, 10);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12);
    ctx.fillStyle = PALETTE.brass;
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (c.kind === 'crate') {
    ctx.fillStyle = '#4a3220';
    roundRect(ctx, c.x, c.y, c.w, c.h, 6);
    ctx.fill();
    ctx.strokeStyle = '#6b4c2e';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 5, c.y + 5, c.w - 10, c.h - 10);
    ctx.beginPath();
    ctx.moveTo(c.x + 5, c.y + 5);
    ctx.lineTo(c.x + c.w - 5, c.y + c.h - 5);
    ctx.moveTo(c.x + c.w - 5, c.y + 5);
    ctx.lineTo(c.x + 5, c.y + c.h - 5);
    ctx.stroke();
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
  } else if (c.kind === 'case') {
    ctx.fillStyle = 'rgba(127, 212, 193, 0.14)';
    roundRect(ctx, c.x, c.y, c.w, c.h, 8);
    ctx.fill();
    ctx.strokeStyle = PALETTE.aqua;
    ctx.lineWidth = 2;
    roundRect(ctx, c.x, c.y, c.w, c.h, 8);
    ctx.stroke();
    ctx.fillStyle = PALETTE.aqua;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
  }
  ctx.restore();
}

function drawDoors(ctx, level, lootTaken, t) {
  // Entry door (green, bottom-left wall).
  ctx.fillStyle = '#1d5c38';
  roundRect(ctx, level.entry.x - 34, PLAY_BOTTOM - 8, 68, 10, 4);
  ctx.fill();
  ctx.fillStyle = PALETTE.safe;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ENTRY', level.entry.x, PLAY_BOTTOM - 14);
  // Exit door: locked red until loot is taken, then pulsing green getaway.
  const open = lootTaken;
  const pulse = open ? 0.65 + 0.35 * Math.sin(t * 5) : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = open ? '#1d5c38' : '#7a1f1a';
  roundRect(ctx, level.exit.x - 34, level.exit.y < 200 ? 72 : PLAY_BOTTOM - 8, 68, 10, 4);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = open ? PALETTE.safe : PALETTE.coralBright;
  const ey = level.exit.y < 200 ? 66 : PLAY_BOTTOM - 14;
  ctx.fillText(open ? 'EXIT — GO!' : 'EXIT LOCKED', level.exit.x, ey);
  // Exit beacon when open.
  if (open) {
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 5);
    ctx.fillStyle = PALETTE.safe;
    ctx.beginPath();
    ctx.arc(level.exit.x, level.exit.y, 34 + 6 * Math.sin(t * 5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawLoot(ctx, loot, t) {
  if (loot.taken) return;
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  // Glow halo.
  const g = ctx.createRadialGradient(loot.x, loot.y, 4, loot.x, loot.y, 54);
  g.addColorStop(0, `rgba(255, 180, 90, ${0.55 * pulse})`);
  g.addColorStop(1, 'rgba(255, 180, 90, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(loot.x, loot.y, 54, 0, Math.PI * 2);
  ctx.fill();
  // Pedestal.
  ctx.fillStyle = '#2c4a73';
  roundRect(ctx, loot.x - 26, loot.y + 8, 52, 22, 5);
  ctx.fill();
  // The prize: a sparkling crown / gem.
  ctx.save();
  ctx.translate(loot.x, loot.y);
  ctx.rotate(Math.sin(t * 1.5) * 0.08);
  ctx.fillStyle = PALETTE.brass;
  ctx.beginPath();
  ctx.moveTo(-20, 6);
  ctx.lineTo(-20, -12);
  ctx.lineTo(-10, -2);
  ctx.lineTo(0, -18);
  ctx.lineTo(10, -2);
  ctx.lineTo(20, -12);
  ctx.lineTo(20, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.coral;
  ctx.beginPath();
  ctx.arc(0, -6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(-13, -8, 2.5, 0, Math.PI * 2);
  ctx.arc(13, -8, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Sparkles.
  for (let i = 0; i < 4; i++) {
    const a = t * 2 + (i * Math.PI) / 2;
    const sx = loot.x + Math.cos(a) * 30;
    const sy = loot.y + Math.sin(a * 1.3) * 22 - 6;
    const s = 3 + 2 * Math.sin(t * 6 + i * 2);
    ctx.fillStyle = `rgba(255, 243, 196, ${0.5 + 0.5 * Math.sin(t * 6 + i)})`;
    ctx.beginPath();
    ctx.moveTo(sx, sy - s);
    ctx.lineTo(sx + s * 0.35, sy - s * 0.35);
    ctx.lineTo(sx + s, sy);
    ctx.lineTo(sx + s * 0.35, sy + s * 0.35);
    ctx.lineTo(sx, sy + s);
    ctx.lineTo(sx - s * 0.35, sy + s * 0.35);
    ctx.lineTo(sx - s, sy);
    ctx.lineTo(sx - s * 0.35, sy - s * 0.35);
    ctx.closePath();
    ctx.fill();
  }
  // Label below the prize, clear of the wall cameras.
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ ' + loot.name.toUpperCase() + ' ★', loot.x, loot.y + 50);
}

function drawGuard(ctx, g, t) {
  drawCone(ctx, g.x, g.y, g.facing, 185, 0.56, g.alerted ? PALETTE.danger : PALETTE.warn, g.alerted ? 0.3 : 0.16);
  // Body.
  ctx.fillStyle = PALETTE.guardSuit;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#dbe7f5';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Cap + facing nose.
  ctx.fillStyle = '#22384f';
  ctx.beginPath();
  ctx.arc(g.x + Math.cos(g.facing) * 6, g.y + Math.sin(g.facing) * 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Lure marker.
  if (g.lure) {
    ctx.fillStyle = PALETTE.brass;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', g.x, g.y - 22);
  }
}

function drawCamera(ctx, cam, t) {
  const jammed = cam.jammed > 0;
  if (!jammed) drawCone(ctx, cam.x, cam.y, cam.angle, 210, 0.42, PALETTE.violet, 0.2);
  // Mount + lens.
  ctx.fillStyle = '#1c2f4a';
  roundRect(ctx, cam.x - 14, cam.y - 12, 28, 16, 4);
  ctx.fill();
  ctx.fillStyle = jammed ? '#555' : '#ff5b4d';
  ctx.beginPath();
  ctx.arc(cam.x + Math.cos(cam.angle) * 8, cam.y + Math.sin(cam.angle) * 8, 5, 0, Math.PI * 2);
  ctx.fill();
  if (jammed) {
    ctx.fillStyle = PALETTE.brass;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JAMMED', cam.x, cam.y + 26);
  }
}

function drawPlayer(ctx, p, t, seen) {
  if (seen) {
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 10);
    ctx.strokeStyle = PALETTE.danger;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 10, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hooded thief: dark coat, coral scarf.
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.coral;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 10, p.facing - 1.2, p.facing + 1.2);
  ctx.stroke();
  // Face + eyes toward facing.
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.facing) * 5, p.y + Math.sin(p.facing) * 5, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.facing) * 7, p.y + Math.sin(p.facing) * 7 - 2, 1.4, 0, Math.PI * 2);
  ctx.arc(p.x + Math.cos(p.facing) * 7, p.y + Math.sin(p.facing) * 7 + 2, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawChips(ctx, chips, t) {
  for (const c of chips) {
    if (c.taken) continue;
    const bob = Math.sin(t * 3 + c.x) * 2;
    ctx.fillStyle = PALETTE.brass;
    ctx.beginPath();
    ctx.arc(c.x, c.y + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y + bob, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSmoke(ctx, smokes) {
  for (const s of smokes) {
    const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
    g.addColorStop(0, 'rgba(200, 205, 215, 0.55)');
    g.addColorStop(1, 'rgba(200, 205, 215, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawHUD(ctx, s, t) {
  ctx.fillStyle = '#0a1a33';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, HUD_H - 2, VIEW_W, 2);
  // Title + level.
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.coral;
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('THE CORAL CROWN', 16, 24);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '13px sans-serif';
  ctx.fillText(s.level.name + '  •  ' + s.level.hint.split('.')[0], 16, 46);
  // Alarm meter (center).
  const ax = 460;
  const aw = 300;
  ctx.fillStyle = s.alarm > 70 ? PALETTE.danger : PALETTE.cream;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, 24);
  ctx.fillStyle = '#1d3a5f';
  roundRect(ctx, ax, 30, aw, 18, 9);
  ctx.fill();
  const frac = s.alarm / 100;
  const col = frac < 0.4 ? PALETTE.safe : frac < 0.7 ? PALETTE.warn : PALETTE.danger;
  if (frac > 0.01) {
    ctx.fillStyle = col;
    roundRect(ctx, ax + 2, 32, Math.max(10, (aw - 4) * frac), 14, 7);
    ctx.fill();
  }
  ctx.strokeStyle = '#dbe7f5';
  ctx.lineWidth = 1.5;
  roundRect(ctx, ax, 30, aw, 18, 9);
  ctx.stroke();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(Math.round(s.alarm) + '%', ax + aw + 10, 45);
  if (s.alarm > 70) {
    // Blinking warning under the meter (the coin counter sits to its right).
    ctx.fillStyle = Math.sin(t * 8) > 0 ? PALETTE.danger : PALETTE.cream;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE!', ax + aw / 2, 62);
  }
  // Coins + score.
  ctx.fillStyle = PALETTE.brass;
  ctx.beginPath();
  ctx.arc(822, 40, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0a1a33';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('C', 822, 44);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(String(s.coins), 838, 46);
  ctx.fillStyle = PALETTE.aqua;
  ctx.font = '12px sans-serif';
  ctx.fillText('SCORE ' + s.score, 872, 46);
  // Tool buttons.
  const tools = [
    { id: 'smoke', x: 960 },
    { id: 'jam', x: 1052 },
    { id: 'toss', x: 1144 },
  ];
  s.toolRects = [];
  for (const tb of tools) {
    const def = TOOLS[tb.id];
    const afford = s.coins >= def.cost;
    ctx.fillStyle = afford ? '#274b78' : '#1a2c44';
    roundRect(ctx, tb.x, 10, 88, 44, 7);
    ctx.fill();
    ctx.strokeStyle = afford ? PALETTE.brass : '#33475f';
    ctx.lineWidth = 1.5;
    roundRect(ctx, tb.x, 10, 88, 44, 7);
    ctx.stroke();
    ctx.fillStyle = afford ? PALETTE.cream : '#7d93ad';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[' + def.key + '] ' + def.name, tb.x + 44, 27);
    ctx.font = '10px sans-serif';
    ctx.fillText('cost ' + def.cost + ' coins', tb.x + 44, 43);
    s.toolRects.push({ id: tb.id, x: tb.x, y: 10, w: 88, h: 44 });
  }
  // Loot status line under HUD.
  ctx.textAlign = 'right';
  ctx.fillStyle = s.loot.taken ? PALETTE.safe : PALETTE.sand;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(
    s.loot.taken ? '✓ LOOT SECURED — GET TO THE EXIT!' : '◈ STEAL: ' + s.level.lootName.toUpperCase() + '  (press E nearby)',
    VIEW_W - 16, HUD_H + 18,
  );
}

export function drawWorld(ctx, s, t) {
  drawFloor(ctx, t);
  for (const c of s.level.covers) drawCover(ctx, c, t);
  drawDoors(ctx, s.level, s.loot.taken, t);
  drawLoot(ctx, s.loot, t);
  drawChips(ctx, s.chips, t);
  for (const cam of s.cameras) drawCamera(ctx, cam, t);
  for (const g of s.guards) drawGuard(ctx, g, t);
  drawSmoke(ctx, s.smokes);
  drawPlayer(ctx, s.player, t, s.seen);
  // Toss marker.
  if (s.tossMark) {
    ctx.fillStyle = PALETTE.brass;
    ctx.beginPath();
    ctx.arc(s.tossMark.x, s.tossMark.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.tossMark.x, s.tossMark.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(6, 14, 28, ${alpha})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function centerText(ctx, text, y, font, color) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(text, VIEW_W / 2, y);
}

export function drawTitle(ctx, s, t) {
  overlay(ctx, 0.72);
  centerText(ctx, 'THE CORAL CROWN', 190, 'bold 64px sans-serif', PALETTE.coral);
  centerText(ctx, 'Midnight Vault on the SS Aurelia', 232, 'italic 24px sans-serif', PALETTE.cream);
  centerText(ctx, 'A coral-and-diamond crown sits in the vault of a cruise-ship casino.', 292, '18px sans-serif', PALETTE.sand);
  centerText(ctx, 'Three decks. Patrols with eyes everywhere. One getaway boat.', 320, '18px sans-serif', PALETTE.sand);
  centerText(ctx, 'WASD / ARROWS — move      E — grab the loot      1 / 2 / 3 — tools (click them too)', 392, 'bold 17px sans-serif', PALETTE.cream);
  centerText(ctx, 'Hide behind slot machines, tables and pillars — covers block every cone.', 420, '16px sans-serif', PALETTE.aqua);
  centerText(ctx, 'If the ALARM meter fills, the crew catches you. Grab the loot, then run for the EXIT.', 448, '16px sans-serif', PALETTE.aqua);
  const blink = 0.6 + 0.4 * Math.sin(t * 4);
  ctx.save();
  ctx.globalAlpha = blink;
  centerText(ctx, '▶  CLICK OR PRESS ENTER TO BOARD  ◀', 540, 'bold 24px sans-serif', PALETTE.brass);
  ctx.restore();
  centerText(ctx, 'An original game — all art, names and sounds made in code.', 640, '13px sans-serif', '#7d93ad');
}

export function drawLevelClear(ctx, s) {
  overlay(ctx, 0.68);
  centerText(ctx, 'DECK CLEARED!', 250, 'bold 52px sans-serif', PALETTE.safe);
  centerText(ctx, s.level.lootName + ' secured — $' + s.level.lootValue.toLocaleString('en-US'), 310, '22px sans-serif', PALETTE.cream);
  centerText(ctx, 'Score so far: ' + s.score, 350, '20px sans-serif', PALETTE.brass);
  centerText(ctx, '▶  PRESS ENTER FOR THE NEXT DECK  ◀', 440, 'bold 22px sans-serif', PALETTE.brass);
}

export function drawCaught(ctx, s) {
  overlay(ctx, 0.72);
  centerText(ctx, 'CAUGHT!', 250, 'bold 64px sans-serif', PALETTE.danger);
  centerText(ctx, s.caughtReason, 310, '22px sans-serif', PALETTE.cream);
  centerText(ctx, 'The alarm hit 100% — the casino crew closed in.', 348, '18px sans-serif', PALETTE.sand);
  centerText(ctx, 'Watch the cones. Move when they sweep away. Use a Smoke Bomb.', 386, '17px sans-serif', PALETTE.aqua);
  centerText(ctx, '▶  PRESS R TO RETRY THIS DECK  ◀', 470, 'bold 22px sans-serif', PALETTE.brass);
}

export function drawWin(ctx, s) {
  overlay(ctx, 0.78);
  // Speedboat getaway sketch.
  ctx.save();
  ctx.translate(VIEW_W / 2, 300);
  ctx.strokeStyle = PALETTE.aqua;
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-260, 40 + i * 22);
    ctx.quadraticCurveTo(-130 + i * 40, 28 + i * 22, 0, 40 + i * 22);
    ctx.quadraticCurveTo(130 - i * 40, 52 + i * 22, 260, 40 + i * 22);
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.moveTo(-90, 30);
  ctx.lineTo(90, 30);
  ctx.lineTo(60, -6);
  ctx.lineTo(-60, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.coral;
  ctx.beginPath();
  ctx.moveTo(-20, -6);
  ctx.lineTo(20, -6);
  ctx.lineTo(0, -18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  centerText(ctx, 'GETAWAY!', 170, 'bold 64px sans-serif', PALETTE.safe);
  centerText(ctx, 'The Coral Crown is yours. The Aurelia sails on without it.', 210, '20px sans-serif', PALETTE.cream);
  centerText(ctx, 'All three decks cleared  •  Final score: ' + s.score, 420, '22px sans-serif', PALETTE.brass);
  centerText(ctx, 'Time: ' + s.finalTime + '   •   Coins left: ' + s.coins, 452, '18px sans-serif', PALETTE.sand);
  centerText(ctx, '▶  PRESS R TO PLAY AGAIN  ◀', 540, 'bold 22px sans-serif', PALETTE.brass);
}
