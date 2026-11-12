export type Melody = {
  id: string;
  title: string;
  artist: string;
  notes: { f: number; d: number; line?: string }[];
};

const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392;
const A4 = 440;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;

export const MELODIES: Melody[] = [
  {
    id: "box",
    title: "Hộp nhạc đêm",
    artist: "Ngàn Ngày",
    notes: [
      { f: E5, d: 0.28, line: "Đèn vàng vừa bật ở cuối phố" },
      { f: D5, d: 0.22 },
      { f: C5, d: 0.28 },
      { f: D5, d: 0.22 },
      { f: E5, d: 0.28, line: "Anh còn một câu chưa gửi" },
      { f: E5, d: 0.22 },
      { f: E5, d: 0.4 },
      { f: D5, d: 0.28, line: "Em cứ về chậm cũng được" },
      { f: D5, d: 0.22 },
      { f: D5, d: 0.4 },
      { f: E5, d: 0.28, line: "Miễn là còn muốn kể" },
      { f: G4, d: 0.22 },
      { f: C5, d: 0.55 },
    ],
  },
  {
    id: "waltz",
    title: "Valse nhỏ",
    artist: "Ngàn Ngày",
    notes: [
      { f: C5, d: 0.32, line: "Một hai ba, bước rất gần" },
      { f: E5, d: 0.32 },
      { f: G4, d: 0.32 },
      { f: A4, d: 0.32, line: "Không cần sàn, chỉ cần tay" },
      { f: F4, d: 0.32 },
      { f: A4, d: 0.32 },
      { f: B4, d: 0.32, line: "Ngày thường cũng đếm được nhịp" },
      { f: G4, d: 0.32 },
      { f: E4, d: 0.48 },
      { f: D4, d: 0.24 },
      { f: C4, d: 0.6, line: "Rồi mình về" },
    ],
  },
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function context(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMasterVolume(v: number): void {
  const audio = context();
  if (!master) return;
  master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), audio.currentTime, 0.03);
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0): void {
  const audio = context();
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  if (master) g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur: number, gain: number, delay = 0): void {
  const audio = context();
  const t0 = audio.currentTime + delay;
  const length = Math.floor(audio.sampleRate * dur);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  const g = audio.createGain();
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  if (master) g.connect(master);
  src.start(t0);
}

export function playHeartbeat(): void {
  tone(90, 0.12, "sine", 0.5);
  tone(70, 0.16, "sine", 0.35, 0.18);
}

export function playKiss(): void {
  noise(0.18, 0.25);
  tone(880, 0.12, "triangle", 0.08, 0.02);
}

export function playMeow(): void {
  const audio = context();
  const t0 = audio.currentTime;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(500, t0);
  osc.frequency.exponentialRampToValueAtTime(820, t0 + 0.18);
  osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.45);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
  osc.connect(g);
  if (master) g.connect(master);
  osc.start(t0);
  osc.stop(t0 + 0.52);
}

export function playSparkle(): void {
  [880, 1175, 1568, 2093].forEach((f, i) => tone(f, 0.18, "sine", 0.08, i * 0.07));
}

export function playPop(): void {
  tone(220, 0.08, "square", 0.05);
  tone(440, 0.1, "square", 0.04, 0.05);
}

export function playChime(): void {
  tone(523, 0.4, "sine", 0.12);
  tone(659, 0.5, "sine", 0.08, 0.08);
  tone(784, 0.7, "triangle", 0.06, 0.16);
}

export type MelodyHandle = { stop: () => void };

export function playMelody(
  melody: Melody,
  onLine: (line: string) => void,
  onEnd: () => void,
): MelodyHandle {
  const audio = context();
  let when = audio.currentTime + 0.05;
  let stopped = false;
  const oscs: OscillatorNode[] = [];
  for (const note of melody.notes) {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(note.f, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.12, when + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, when + note.d);
    osc.connect(g);
    if (master) g.connect(master);
    osc.start(when);
    osc.stop(when + note.d + 0.02);
    oscs.push(osc);
    if (note.line) {
      const line = note.line;
      const delay = Math.max(0, (when - audio.currentTime) * 1000);
      window.setTimeout(() => {
        if (!stopped) onLine(line);
      }, delay);
    }
    when += note.d + 0.04;
  }
  const endIn = Math.max(0, (when - audio.currentTime) * 1000 + 40);
  const timer = window.setTimeout(() => {
    if (!stopped) onEnd();
  }, endIn);
  return {
    stop: () => {
      stopped = true;
      window.clearTimeout(timer);
      for (const osc of oscs) {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      }
    },
  };
}
