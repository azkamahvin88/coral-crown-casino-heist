// cameras.js — wall cameras that sweep their cone back and forth.
// A jammed camera freezes with its lens dark until the jam timer runs out.
export function makeCamera(def, index) {
  return {
    id: index,
    x: def.x,
    y: def.y,
    base: def.base,
    sweep: def.sweep,
    speed: def.speed,
    phase: index * 1.7,
    angle: def.base,
    jammed: 0,
  };
}

export function updateCamera(cam, t, dt) {
  if (cam.jammed > 0) {
    cam.jammed -= dt;
    if (cam.jammed < 0) cam.jammed = 0;
    return;
  }
  cam.angle = cam.base + Math.sin(t * cam.speed + cam.phase) * cam.sweep;
}

export function nearestCamera(cameras, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const c of cameras) {
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < bestD) { bestD = d; best = c; }
  }
  return { camera: best, dist: bestD };
}
