// guards.js — patrol guards: readable waypoint loops, a facing, and a lure state.
// A guard walks its waypoints back and forth. A tossed coin pulls the nearest
// guard off patrol for a few seconds; high alarm makes every guard walk faster.
import { angleDiff } from './vision.js';

export function makeGuard(def, index) {
  const wps = def.waypoints;
  return {
    id: index,
    x: wps[0].x,
    y: wps[0].y,
    waypoints: wps,
    wpIndex: wps.length > 1 ? 1 : 0,
    forward: true,
    speed: def.speed,
    spin: !!def.spin,
    facing: wps.length > 1 ? Math.atan2(wps[1].y - wps[0].y, wps[1].x - wps[0].x) : -Math.PI / 2,
    spinAngle: 0,
    lure: null, // {x, y, t}
    alerted: false,
  };
}

export function updateGuard(g, dt, alarmHigh) {
  const speed = g.speed * (alarmHigh ? 1.45 : 1);
  if (g.lure) {
    g.lure.t -= dt;
    const dx = g.lure.x - g.x;
    const dy = g.lure.y - g.y;
    const d = Math.hypot(dx, dy);
    if (d < 8 || g.lure.t <= 0) {
      if (g.lure.t <= 0) g.lure = null;
      return;
    }
    const step = Math.min(d, speed * 1.25 * dt);
    g.x += (dx / d) * step;
    g.y += (dy / d) * step;
    g.facing = Math.atan2(dy, dx);
    return;
  }
  if (g.spin) {
    g.spinAngle += dt * 0.9;
    g.facing = -Math.PI / 2 + Math.sin(g.spinAngle) * 1.15;
    return;
  }
  if (g.waypoints.length < 2) return;
  const target = g.waypoints[g.wpIndex];
  const dx = target.x - g.x;
  const dy = target.y - g.y;
  const d = Math.hypot(dx, dy);
  const step = speed * dt;
  if (d <= Math.max(step, 4)) {
    g.x = target.x;
    g.y = target.y;
    if (g.forward) {
      if (g.wpIndex >= g.waypoints.length - 1) { g.forward = false; g.wpIndex--; }
      else g.wpIndex++;
    } else {
      if (g.wpIndex <= 0) { g.forward = true; g.wpIndex++; }
      else g.wpIndex--;
    }
  } else {
    g.x += (dx / d) * step;
    g.y += (dy / d) * step;
    g.facing = Math.atan2(dy, dx);
  }
}

export function nearestGuard(guards, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const g of guards) {
    const d = Math.hypot(g.x - x, g.y - y);
    if (d < bestD) { bestD = d; best = g; }
  }
  return { guard: best, dist: bestD };
}

export { angleDiff };
