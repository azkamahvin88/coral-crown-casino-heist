// vision.js — sight lines, cones and the alarm meter.
// A watcher sees the thief only when the thief is inside the cone's range and
// angle AND no wall or cover blocks the straight line between them.
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Liang-Barsky clip of the segment against the rect.
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

export function lineBlocked(ax, ay, bx, by, blockers) {
  for (const r of blockers) {
    if (segmentHitsRect(ax, ay, bx, by, r)) return true;
  }
  return false;
}

export function insideCone(ox, oy, facing, range, halfAngle, tx, ty, blockers) {
  const dx = tx - ox;
  const dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 12) return true;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, facing)) > halfAngle) return false;
  if (lineBlocked(ox, oy, tx, ty, blockers)) return false;
  return true;
}

export function pointInSmoke(x, y, smokes) {
  for (const s of smokes) {
    if (Math.hypot(x - s.x, y - s.y) < s.r) return true;
  }
  return false;
}

// Alarm meter: rises while any watcher sees the thief, falls while hidden.
export function updateAlarm(alarm, seenByGuard, seenByCamera, dt, rates) {
  let next = alarm;
  if (seenByGuard) next += rates.guardRate * dt;
  else if (seenByCamera) next += rates.cameraRate * dt;
  else next -= rates.decayRate * dt;
  if (next < 0) next = 0;
  if (next > rates.max) next = rates.max;
  return next;
}
