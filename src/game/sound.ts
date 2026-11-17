// Lightweight Web Audio API sound effects for tactile student feedback

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) {
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType, gainValue: number, delay = 0) {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playClickSound(muted: boolean) {
  if (muted) return;
  playTone(520, 0.06, 'sine', 0.06);
}

export function playCorrectSound(muted: boolean) {
  if (muted) return;
  playTone(523.25, 0.12, 'triangle', 0.1, 0);
  playTone(659.25, 0.14, 'triangle', 0.1, 0.08);
  playTone(783.99, 0.22, 'triangle', 0.11, 0.16);
}

export function playWrongSound(muted: boolean) {
  if (muted) return;
  playTone(300, 0.14, 'sawtooth', 0.05, 0);
  playTone(240, 0.18, 'sawtooth', 0.05, 0.1);
}

export function playVictorySound(muted: boolean) {
  if (muted) return;
  playTone(523.25, 0.14, 'triangle', 0.1, 0);
  playTone(659.25, 0.14, 'triangle', 0.1, 0.1);
  playTone(783.99, 0.14, 'triangle', 0.1, 0.2);
  playTone(1046.5, 0.34, 'triangle', 0.12, 0.32);
}
