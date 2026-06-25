/**
 * Built-in synthetic demo tracks (no upload required).
 *
 * - dsp-check: engineering fixture — proves each DSP stage and meter
 * - music-eval: musical loop — proves music enjoyment (rhythm, harmony, stereo)
 */

function hashNoise(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
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
 * 8 s pop/lo-fi groove at 120 BPM (4 bars). Am → F → C → G.
 * Stereo: keys left, lead right, bass/drums center — for stereo-width and music A/B.
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

  const melodyHz = [
    329.63, 392.0, 440.0, 392.0, 329.63, 293.66, 329.63, 392.0,
    440.0, 493.88, 523.25, 493.88, 440.0, 392.0, 329.63, 392.0,
    329.63, 392.0, 440.0, 392.0, 329.63, 293.66, 329.63, 392.0,
    440.0, 523.25, 587.33, 523.25, 440.0, 392.0, 329.63, 392.0
  ];

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
      (Math.sin(2 * Math.PI * bassFreq * t) + 0.45 * Math.sin(2 * Math.PI * bassFreq * 2 * t));

    const chordAttack = barPhase < 0.06 ? Math.exp(-barPhase / 0.045) : 0;
    const chordSustain = barPhase >= 0.06 && barPhase < 0.85 ? 0.18 * Math.exp(-(barPhase - 0.06) / 0.55) : 0;
    const chordEnv = chordAttack + chordSustain;
    const keys =
      chordEnv *
      (0.11 * Math.sin(2 * Math.PI * root * 2 * t) +
        0.09 * Math.sin(2 * Math.PI * third * 2 * t) +
        0.07 * Math.sin(2 * Math.PI * fifth * 2 * t) +
        0.04 * Math.sin(2 * Math.PI * root * 4 * t));

    const noteIdx = Math.min(melodyHz.length - 1, Math.floor(t / eighthSec));
    const notePhase = (t % eighthSec) / eighthSec;
    const melFreq = melodyHz[noteIdx];
    const melEnv = 0.2 + 0.8 * Math.exp(-notePhase / 0.32);
    const lead =
      melEnv *
      0.19 *
      (Math.sin(2 * Math.PI * melFreq * t) +
        0.38 * Math.sin(2 * Math.PI * melFreq * 2 * t) +
        0.14 * Math.sin(2 * Math.PI * melFreq * 3 * t));

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
  'music-eval': {
    id: 'music-eval',
    buttonLabel: 'Music Eval',
    playlistLabel: 'Demo — Music Eval (8 s)',
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
