import { redistributeDeadRegionWeights } from './mapProfiles.js?v=15';
import { getBandEdgesFromProfile } from './vocoderBands.js?v=15';

function createSeededNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state / 0xffffffff) * 2 - 1;
  };
}

function dbToLinear(db) {
  return Math.pow(10, db / 20);
}

function makeHarmonicSample(x, drive) {
  const secondOrder = x * x * Math.sign(x);
  const thirdOrder = x * x * x;
  return x + drive * 1.8 * secondOrder + drive * 0.9 * thirdOrder;
}

function createBiquad(type, sampleRate, frequency, q = 0.707, gainDb = 0) {
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const sin = Math.sin(omega);
  const cos = Math.cos(omega);
  const alpha = sin / (2 * q);
  let b0 = 1;
  let b1 = 0;
  let b2 = 0;
  let a0 = 1;
  let a1 = 0;
  let a2 = 0;

  if (type === 'lowpass') {
    b0 = (1 - cos) / 2;
    b1 = 1 - cos;
    b2 = (1 - cos) / 2;
    a0 = 1 + alpha;
    a1 = -2 * cos;
    a2 = 1 - alpha;
  } else if (type === 'highpass') {
    b0 = (1 + cos) / 2;
    b1 = -(1 + cos);
    b2 = (1 + cos) / 2;
    a0 = 1 + alpha;
    a1 = -2 * cos;
    a2 = 1 - alpha;
  } else if (type === 'peaking') {
    const A = dbToLinear(gainDb);
    b0 = 1 + alpha * A;
    b1 = -2 * cos;
    b2 = 1 - alpha * A;
    a0 = 1 + alpha / A;
    a1 = -2 * cos;
    a2 = 1 - alpha / A;
  } else if (type === 'bandpass') {
    b0 = alpha;
    b1 = 0;
    b2 = -alpha;
    a0 = 1 + alpha;
    a1 = -2 * cos;
    a2 = 1 - alpha;
  }

  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;

  const state = { x1: 0, x2: 0, y1: 0, y2: 0 };

  return {
    process(sample) {
      const y0 = b0 * sample + b1 * state.x1 + b2 * state.x2 - a1 * state.y1 - a2 * state.y2;
      state.x2 = state.x1;
      state.x1 = sample;
      state.y2 = state.y1;
      state.y1 = y0;
      return y0;
    }
  };
}

function createCompressor(sampleRate, thresholdDb, ratio, attackSec, releaseSec, makeupDb) {
  const threshold = dbToLinear(thresholdDb);
  const makeup = dbToLinear(makeupDb);
  const attack = Math.exp(-1 / (sampleRate * attackSec));
  const release = Math.exp(-1 / (sampleRate * releaseSec));
  let envelope = 0;

  return {
    process(sample) {
      const abs = Math.abs(sample);
      envelope = abs > envelope ? attack * envelope + (1 - attack) * abs : release * envelope + (1 - release) * abs;
      let gain = 1;
      if (envelope > threshold) {
        const compressed = threshold + (envelope - threshold) / ratio;
        gain = compressed / (envelope + 1e-8);
      }
      return sample * gain * makeup;
    }
  };
}

function createMapShaper(sampleRate, profile) {
  const redistributed = redistributeDeadRegionWeights(profile.electrodes);
  const filters = profile.electrodes.map((electrode, index) => {
    const weight = redistributed[index].effectiveWeight;
    const gainDb = electrode.status === 'dead' ? -24 : (weight - 1) * 10;
    return {
      filter: createBiquad('peaking', sampleRate, electrode.centerHz, 0.85, gainDb),
      mix: electrode.status === 'dead' ? 0 : 0.7 + weight * 0.3
    };
  });

  return {
    process(sample) {
      let sum = sample * 0.25;
      filters.forEach(({ filter, mix }) => {
        sum += filter.process(sample) * mix;
      });
      return sum;
    }
  };
}

function createRingModTranspose(sampleRate, transposeMix = 0.4) {
  let phase = 0;
  const ringFreq = 3500;
  const highTransient = createBiquad('highpass', sampleRate, 6000);
  const transposeLowPass = createBiquad('lowpass', sampleRate, 5000);

  return {
    process(highBandSample) {
      phase += (2 * Math.PI * ringFreq) / sampleRate;
      if (phase > Math.PI * 2) {
        phase -= Math.PI * 2;
      }
      const hf = highTransient.process(highBandSample);
      const modulated = hf * Math.sin(phase);
      return transposeLowPass.process(modulated) * transposeMix;
    }
  };
}

export function processEnhancement(input, sampleRate, params, mapProfile) {
  const output = new Float32Array(input.length);

  const mapShaper = createMapShaper(sampleRate, mapProfile);
  const lowPass = createBiquad('lowpass', sampleRate, 250);
  const midHigh = createBiquad('highpass', sampleRate, 250);
  const midLow = createBiquad('lowpass', sampleRate, 4000);
  const highPass = createBiquad('highpass', sampleRate, 4000);
  const lowComp = createCompressor(sampleRate, params.compThreshold, 12, 0.002, 0.08, 8);
  const midComp = createCompressor(sampleRate, params.compThreshold - 2, 16, 0.001, 0.06, 10);
  const highComp = createCompressor(sampleRate, params.compThreshold - 4, 20, 0.0008, 0.05, 12);
  const clarity = createBiquad('peaking', sampleRate, 2000, 0.7, params.clarityLift);
  const harmonicLow = createBiquad('lowpass', sampleRate, 150);
  const harmonicHigh = createBiquad('highpass', sampleRate, 280);
  const harmonicBand = createBiquad('bandpass', sampleRate, 450, 0.9);
  const ringMod = createRingModTranspose(sampleRate, params.transposeMix ?? 0.4);

  for (let i = 0; i < input.length; i++) {
    const source = mapShaper.process(input[i]);

    const low = lowComp.process(lowPass.process(source));
    let mid = midComp.process(midLow.process(midHigh.process(source)));
    const harmonic = harmonicBand.process(
      harmonicHigh.process(makeHarmonicSample(harmonicLow.process(source), params.harmonicDrive))
    );
    mid = clarity.process(mid + harmonic * params.harmonicDrive);

    const highBand = highComp.process(highPass.process(source));
    const highDirect = highBand * 0.4;
    const transposed = ringMod.process(highBand);

    output[i] = low + mid + highDirect + transposed;
  }

  return output;
}

export function processVocoder(input, sampleRate, profile) {
  const output = new Float32Array(input.length);
  const edges = getBandEdgesFromProfile(profile);
  const redistributed = redistributeDeadRegionWeights(profile.electrodes);

  const bands = profile.electrodes.map((electrode, index) => {
    const bandwidth = edges[index + 1] - edges[index];
    const q = Math.max(0.35, Math.min(1.2, electrode.centerHz / bandwidth));
    const weight = redistributed[index].effectiveWeight;
    const active = electrode.status !== 'dead' && weight > 0;
    const noise = createSeededNoise(0x9e3779b9 + index * 2654435761);
    return {
      modBand: createBiquad('bandpass', sampleRate, electrode.centerHz, q),
      carrierBand: createBiquad('bandpass', sampleRate, electrode.centerHz, q),
      envState: { y: 0 },
      weight: active ? weight : 0,
      noisePhase: 0,
      nextNoise: noise
    };
  });

  for (let i = 0; i < input.length; i++) {
    const sample = input[i];
    let sum = 0;

    bands.forEach((band) => {
      if (band.weight <= 0) {
        return;
      }
      const mod = band.modBand.process(sample);
      const abs = Math.abs(mod);
      band.envState.y = band.envState.y + (abs - band.envState.y) * (1 - Math.exp(-1 / (sampleRate * (1 / (2 * Math.PI * 50)))));
      const envelope = band.envState.y * 18;
      band.noisePhase += (2 * Math.PI * 120) / sampleRate;
      const noiseSample = Math.sin(band.noisePhase) * 0.85 + band.nextNoise() * 0.15;
      const carrier = band.carrierBand.process(noiseSample);
      sum += carrier * envelope * band.weight * 0.09;
    });

    output[i] = sum * 3.5;
  }

  return output;
}

export function floatArrayToAudioBuffer(floatData, sampleRate) {
  const buffer = new AudioBuffer({
    length: floatData.length,
    numberOfChannels: 1,
    sampleRate
  });
  buffer.copyToChannel(floatData, 0);
  return buffer;
}

export function audioBufferToFloatArray(audioBuffer) {
  return audioBuffer.getChannelData(0).slice();
}
