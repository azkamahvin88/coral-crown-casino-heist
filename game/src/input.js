// input.js — keyboard (WASD / arrows) plus mouse clicks on HUD tool buttons.
// Tracks held keys, edge-triggered presses, and the last mouse position in
// world coordinates (the canvas is letterboxed, so client coords are scaled).
export function makeInput(canvas) {
  const input = {
    keys: new Set(),
    pressed: new Set(),
    mouse: { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 },
    anyKey: false,
  };

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (!e.repeat) input.pressed.add(k);
    input.keys.add(k);
    input.anyKey = true;
  });
  window.addEventListener('keyup', (e) => {
    input.keys.delete(e.key.toLowerCase());
  });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    input.mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
    input.mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
  });
  canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    input.mouse.clickX = ((e.clientX - r.left) / r.width) * canvas.width;
    input.mouse.clickY = ((e.clientY - r.top) / r.height) * canvas.height;
    input.mouse.clicked = true;
    input.anyKey = true;
  });
  return input;
}

export function moveVector(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('a') || input.keys.has('arrowleft')) x -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) x += 1;
  if (input.keys.has('w') || input.keys.has('arrowup')) y -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) y += 1;
  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.hypot(x, y);
    x *= inv;
    y *= inv;
  }
  return { x, y };
}

export function consumePress(input, key) {
  const k = key.toLowerCase();
  if (input.pressed.has(k)) {
    input.pressed.delete(k);
    return true;
  }
  return false;
}

export function consumeClick(input) {
  if (input.mouse.clicked) {
    input.mouse.clicked = false;
    return { x: input.mouse.clickX, y: input.mouse.clickY };
  }
  return null;
}

export function endFrame(input) {
  input.pressed.clear();
}
