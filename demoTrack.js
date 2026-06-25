/**
 * Built-in synthetic demo tracks (no upload required).
 *
 * - dsp-check: engineering fixture — proves each DSP stage and meter
 * - bass-focus: music probe — missing-fundamental / bass salience
 * - melody-harmony: music probe — melodic contour, chord separability, timbre
 * - music-eval: full musical loop — whole-chain A/B
 */

function hashNoise(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

function adsr(timeInNote, noteDuration, attack, decay, sustain, release) {
  if (timeInNote < attack) {
    return timeInNote / attack;
  }
  if (timeInNote < attack + decay) {
    const phase = (timeInNote - attack) / decay;
    return 1 + (sustain - 1) * phase;
  }
  if (timeInNote > noteDuration - release) {
    const phase = (noteDuration - timeInNote) / release;
    return Math.max(0, sustain * phase);
  }
  return sustain;
}

function softSaw(phase) {
  return (2 / Math.PI) * Math.atan(2.4 * Math.sin(phase) + 0.7 * Math.sin(2 * phase) + 0.25 * Math.sin(3 * phase));
}

function buildDspCheckBuffer(audioContext) {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * 4;
  const buffer = audioContext.createBuffer(2, length, sampleRate);
  const notes = [261.63, 329.63, 392.0, 523.25];
  const noteDuration = sampleRate;

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;

      const bassFund = 60;
      let bass = 0;
      for (let harmonic = 1; harmonic <= 5; harmonic += 2) {
        bass += (0.2 / harmonic) * Math.sign(Math.sin(2 * Math.PI * bassFund * harmonic * t));
      }

      const noteIndex = Math.floor((i / noteDuration) % notes.length);
      const noteFreq = notes[noteIndex];
      const melody =
        0.16 * Math.sin(2 * Math.PI * noteFreq * t) +
        0.07 * Math.sin(2 * Math.PI * noteFreq * 2 * t) +
        0.035 * Math.sin(2 * Math.PI * noteFreq * 3 * t);

      const beatPhase = (t % 0.5) / 0.5;
      const hihatEnv = beatPhase < 0.04 ? Math.exp(-beatPhase / 0.01) : 0;
      const hihat = 0.12 * hihatEnv * hashNoise(i * 0.31 + channel);

      const kickPhase = t % 1.0;
      const kickEnv = kickPhase < 0.1 ? Math.exp(-kickPhase / 0.03) : 0;
      const kick = 0.24 * kickEnv * Math.sin(2 * Math.PI * 55 * t);

      data[i] = Math.tanh((bass + melody + hihat + kick) * 0.85);
    }
  }

  return buffer;
}

/**
 * 8 s sparse groove. Low fundamentals sit near/below the usable CI bass
 * region while upper harmonics remain available for missing-fundamental cues.
 */
function buildBassFocusBuffer(audioContext) {
  const sampleRate = audioContext.sampleRate;
  const durationSec = 8;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = audioContext.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const beatSec = 0.5;
  const bassPattern = [41.2, 41.2, 55.0, 61.7, 73.4, 61.7, 55.0, 49.0];

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const step = Math.floor(t / beatSec) % bassPattern.length;
    const beatPhase = (t % beatSec) / beatSec;
    const halfBeatPhase = (t % (beatSec / 2)) / (beatSec / 2);
    const fundamental = bassPattern[step];

    const bassEnv = beatPhase < 0.7 ? Math.exp(-beatPhase / 0.42) : 0;
    const sub = Math.sin(2 * Math.PI * fundamental * t);
    const harmonicStack =
      0.62 * Math.sin(2 * Math.PI * fundamental * 2 * t) +
      0.38 * Math.sin(2 * Math.PI * fundamental * 3 * t) +
      0.22 * Math.sin(2 * Math.PI * fundamental * 4 * t);
    const bass = bassEnv * (0.42 * sub + 0.24 * harmonicStack);

    const kickPhase = t % 1.0;
    const kickEnv = kickPhase < 0.16 ? Math.exp(-kickPhase / 0.04) : 0;
    const kickSweep = 58 - 18 * Math.min(1, kickPhase / 0.16);
    const kick = 0.28 * kickEnv * Math.sin(2 * Math.PI * kickSweep * t);

    const ghost = step % 2 === 1 && beatPhase < 0.18 ? 0.055 * Math.exp(-beatPhase / 0.06) * Math.sin(2 * Math.PI * 185 * t) : 0;
    const hat = halfBeatPhase < 0.05 ? 0.038 * Math.exp(-halfBeatPhase / 0.016) * hashNoise(i * 0.29) : 0;
    const lowPad = 0.035 * Math.sin(2 * Math.PI * fundamental * 2 * t + 0.2 * Math.sin(2 * Math.PI * 0.3 * t));

    const mix = Math.tanh((bass + kick + ghost + hat + lowPad) * 1.05);
    left[i] = mix + 0.015 * hat;
    right[i] = mix - 0.015 * hat;
  }

  return buffer;
}

/**
 * 8 s musical probe focused on pitch contour and harmony: sustained chords,
 * long stable lead tones, clean attacks, and upper harmonics without a dense drum bed.
 */
function buildMelodyHarmonyBuffer(audioContext) {
  const sampleRate = audioContext.sampleRate;
  const durationSec = 8;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = audioContext.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const noteSec = 2;
  const chordSec = 2;
  const chords = [
    [220.0, 261.63, 329.63],
    [196.0, 246.94, 329.63],
    [174.61, 220.0, 293.66],
    [196.0, 246.94, 392.0]
  ];
  const melody = [440.0, 523.25, 392.0, 493.88];

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(t / chordSec) % chords.length;
    const chordPhase = t % chordSec;
    const noteIndex = Math.floor(t / noteSec) % melody.length;
    const notePhase = t % noteSec;
    const chordEnv = adsr(chordPhase, chordSec, 0.04, 0.18, 0.58, 0.35);
    const leadEnv = adsr(notePhase, noteSec, 0.025, 0.12, 0.78, 0.18);

    let chord = 0;
    chords[chordIndex].forEach((freq, idx) => {
      const detune = 1 + (idx - 1) * 0.0025;
      chord +=
        0.1 * softSaw(2 * Math.PI * freq * detune * t) +
        0.045 * Math.sin(2 * Math.PI * freq * 2 * t) +
        0.025 * Math.sin(2 * Math.PI * freq * 3 * t);
    });

    const leadFreq = melody[noteIndex];
    const lead =
      0.22 * Math.sin(2 * Math.PI * leadFreq * t) +
      0.11 * Math.sin(2 * Math.PI * leadFreq * 2 * t) +
      0.055 * Math.sin(2 * Math.PI * leadFreq * 3 * t) +
      0.025 * Math.sin(2 * Math.PI * leadFreq * 5 * t);

    const pick = notePhase < 0.055 ? 0.025 * Math.exp(-notePhase / 0.016) * hashNoise(i * 0.33) : 0;
    const bassRoot = chords[chordIndex][0] / 2;
    const bass = 0.075 * Math.sin(2 * Math.PI * bassRoot * t) + 0.035 * Math.sin(2 * Math.PI * bassRoot * 2 * t);

    const mixL = chordEnv * chord * 0.72 + leadEnv * lead * 0.22 + bass + pick * 0.35;
    const mixR = chordEnv * chord * 0.28 + leadEnv * lead * 0.82 + bass + pick;
    left[i] = Math.tanh(mixL * 0.9);
    right[i] = Math.tanh(mixR * 0.9);
  }

  return buffer;
}

/**
 * 8 s pop/lo-fi groove at 120 BPM (4 bars). Am -> F -> C -> G.
 * Stereo: keys left, lead right, bass/drums center — for whole-chain music A/B.
 */
function buildMusicEvalBuffer(audioContext) {
  const sampleRate = audioContext.sampleRate;
  const durationSec = 8;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = audioContext.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const beatSec = 0.5;
  const barSec = beatSec * 4;

  const barRoots = [110.0, 87.31, 65.41, 98.0];
  const barThirds = [130.81, 103.83, 82.41, 123.47];
  const barFifths = [164.81, 130.81, 98.0, 146.83];

  // Long, stable held notes. No vibrato/warble: a wavering melody can sound
  // like processing damage to first-time listeners.
  const melodyHz = [329.63, 440.0, 392.0, 493.88];

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const beat = Math.floor(t / beatSec);
    const beatPhase = (t % beatSec) / beatSec;
    const bar = Math.min(3, Math.floor(t / barSec));
    const barPhase = (t % barSec) / barSec;
    const beatInBar = beat % 4;

    const root = barRoots[bar];
    const third = barThirds[bar];
    const fifth = barFifths[bar];

    const kick =
      (beatInBar === 0 || beatInBar === 2) && beatPhase < 0.14
        ? 0.34 * Math.exp(-beatPhase / 0.045) * Math.sin(2 * Math.PI * 52 * t)
        : 0;

    const snare =
      (beatInBar === 1 || beatInBar === 3) && beatPhase < 0.16
        ? 0.2 * Math.exp(-beatPhase / 0.055) * (hashNoise(i * 0.07) * 0.75 + Math.sin(2 * Math.PI * 200 * t) * 0.25)
        : 0;

    const eighthSec = beatSec / 2;
    const eighthPhase = (t % eighthSec) / eighthSec;
    const hihat = eighthPhase < 0.07 ? 0.075 * Math.exp(-eighthPhase / 0.018) * hashNoise(i * 0.19 + 3) : 0;

    const bassGate = beatPhase < 0.38 ? Math.exp(-beatPhase / 0.14) : 0;
    const bassFreq = beatInBar < 2 ? root : root * 2;
    const bass =
      0.26 *
      bassGate *
      (Math.sin(2 * Math.PI * bassFreq * t) +
        0.45 * Math.sin(2 * Math.PI * bassFreq * 2 * t) +
        0.18 * softSaw(2 * Math.PI * bassFreq * 3 * t));

    const chordAttack = barPhase < 0.06 ? Math.exp(-barPhase / 0.045) : 0;
    const chordSustain = barPhase >= 0.06 && barPhase < 0.85 ? 0.18 * Math.exp(-(barPhase - 0.06) / 0.55) : 0;
    const chordEnv = chordAttack + chordSustain;
    const keys =
      chordEnv *
      (0.11 * Math.sin(2 * Math.PI * root * 2 * t) +
        0.09 * Math.sin(2 * Math.PI * third * 2 * t) +
        0.07 * Math.sin(2 * Math.PI * fifth * 2 * t) +
        0.04 * Math.sin(2 * Math.PI * root * 4 * t));

    const noteIdx = bar;
    const notePhaseSec = t % barSec;
    const melFreq = melodyHz[noteIdx];
    const melEnv = adsr(notePhaseSec, barSec, 0.035, 0.2, 0.72, 0.25);
    const lead =
      melEnv *
      0.19 *
      (Math.sin(2 * Math.PI * melFreq * t) +
        0.38 * Math.sin(2 * Math.PI * melFreq * 2 * t) +
        0.14 * Math.sin(2 * Math.PI * melFreq * 3 * t) +
        0.045 * Math.sin(2 * Math.PI * melFreq * 5 * t));

    const crash =
      bar === 3 && barPhase < 0.35 ? 0.14 * Math.exp(-barPhase / 0.12) * hashNoise(i * 0.41) : 0;

    const pad =
      0.04 *
      (Math.sin(2 * Math.PI * root * t) +
        Math.sin(2 * Math.PI * third * t) +
        Math.sin(2 * Math.PI * fifth * t));

    const center = kick + snare + bass + pad + crash + hihat * 0.45;
    const mixL = center + keys * 0.92 + lead * 0.18;
    const mixR = center + keys * 0.12 + lead * 0.88;

    left[i] = Math.tanh(mixL * 0.7);
    right[i] = Math.tanh(mixR * 0.7);
  }

  return buffer;
}

export const DEMO_TRACKS = {
  'dsp-check': {
    id: 'dsp-check',
    buttonLabel: 'DSP Check',
    playlistLabel: 'Demo — DSP Check (4 s)',
    durationSec: 4,
    loopDefault: true,
    build: buildDspCheckBuffer
  },
  'bass-focus': {
    id: 'bass-focus',
    buttonLabel: 'Bass Focus',
    playlistLabel: 'Demo — Bass Focus (8 s)',
    durationSec: 8,
    loopDefault: true,
    build: buildBassFocusBuffer
  },
  'melody-harmony': {
    id: 'melody-harmony',
    buttonLabel: 'Melody / Harmony',
    playlistLabel: 'Demo — Melody / Harmony (8 s)',
    durationSec: 8,
    loopDefault: true,
    build: buildMelodyHarmonyBuffer
  },
  'music-eval': {
    id: 'music-eval',
    buttonLabel: 'Full Mix',
    playlistLabel: 'Demo — Full Mix (8 s)',
    durationSec: 8,
    loopDefault: true,
    build: buildMusicEvalBuffer
  }
};

export function getDemoMeta(demoId) {
  return DEMO_TRACKS[demoId] || DEMO_TRACKS['dsp-check'];
}

export function buildDemoBuffer(audioContext, demoId = 'dsp-check') {
  const meta = getDemoMeta(demoId);
  return meta.build(audioContext);
}
