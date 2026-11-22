// audio.js — all sound is synthesized with WebAudio; no audio files, no network.
// A soft blip for pickups, a rising two-tone warning while spotted, a low
// thud on capture, and a bright arpeggio on the getaway.
export function makeAudio() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch (e) {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when = 0) {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  return {
    unlock() { ensure(); },
    blip() { tone(880, 0.09, 'sine', 0.12); tone(1320, 0.07, 'sine', 0.08, 0.06); },
    coin() { tone(1568, 0.07, 'triangle', 0.1); },
    grab() { tone(523, 0.12, 'triangle', 0.14); tone(659, 0.12, 'triangle', 0.14, 0.09); tone(784, 0.2, 'triangle', 0.14, 0.18); },
    warn() { tone(220, 0.16, 'square', 0.05); tone(277, 0.16, 'square', 0.05, 0.14); },
    caught() { tone(160, 0.5, 'sawtooth', 0.14); tone(110, 0.7, 'sawtooth', 0.12, 0.15); },
    win() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.13, i * 0.11));
    },
    jam() { tone(1200, 0.05, 'square', 0.05); tone(900, 0.05, 'square', 0.05, 0.06); },
  };
}
