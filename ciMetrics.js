import { MIN_HZ, MAX_HZ, CHANNEL_COUNT, redistributeDeadRegionWeights } from './mapProfiles.js?v=23';

function getBandEdges(channelCount, minHz, maxHz) {
  const edges = [];
  for (let i = 0; i <= channelCount; i++) {
    const t = i / channelCount;
    edges.push(minHz * Math.pow(maxHz / minHz, t));
  }
  return edges;
}

function getBandCentersFromProfile(profile) {
  return profile.electrodes.map((electrode) => electrode.centerHz);
}

function getBandEdgesFromProfile(profile) {
  const centers = getBandCentersFromProfile(profile);
  const edges = [MIN_HZ];
  for (let i = 0; i < centers.length - 1; i++) {
    edges.push(Math.sqrt(centers[i] * centers[i + 1]));
  }
  edges.push(MAX_HZ);
  return edges;
}

function biquadBandpassSample(input, state, sampleRate, centerHz, q) {
  const omega = (2 * Math.PI * centerHz) / sampleRate;
  const alpha = Math.sin(omega) / (2 * q);
  const cosw = Math.cos(omega);
  const a0 = 1 + alpha;
  const b0 = alpha / a0;
  const b1 = 0;
  const b2 = -alpha / a0;
  const a1 = (-2 * cosw) / a0;
  const a2 = (1 - alpha) / a0;

  const x0 = input;
  const y0 = b0 * x0 + b1 * state.x1 + b2 * state.x2 - a1 * state.y1 - a2 * state.y2;
  state.x2 = state.x1;
  state.x1 = x0;
  state.y2 = state.y1;
  state.y1 = y0;
  return y0;
}

function lowpassSample(input, state, sampleRate, cutoffHz) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const alpha = 1 / (1 + rc * sampleRate);
  state.y = state.y + alpha * (input - state.y);
  return state.y;
}

function analyzeBandEnvelopes(channelData, sampleRate, profile) {
  const bandCount = profile.electrodes.length;
  const edges = getBandEdgesFromProfile(profile);
  const redistributed = redistributeDeadRegionWeights(profile.electrodes);

  const filters = profile.electrodes.map((electrode, index) => {
    const bandwidth = edges[index + 1] - edges[index];
    const q = Math.max(0.35, Math.min(1.2, electrode.centerHz / bandwidth));
    return {
      bpState: { x1: 0, x2: 0, y1: 0, y2: 0 },
      envState: { y: 0 },
      centerHz: electrode.centerHz,
      q,
      weight: redistributed[index].effectiveWeight
    };
  });

  const envelopeSeries = filters.map(() => []);
  const blockSize = Math.max(1, Math.floor(sampleRate / 200));

  for (let i = 0; i < channelData.length; i++) {
    const sample = channelData[i];
    filters.forEach((filter, bandIndex) => {
      const bandSample = biquadBandpassSample(sample, filter.bpState, sampleRate, filter.centerHz, filter.q);
      const envelope = lowpassSample(Math.abs(bandSample), filter.envState, sampleRate, 50);
      if (i % blockSize === 0) {
        envelopeSeries[bandIndex].push(envelope * filter.weight);
      }
    });
  }

  return envelopeSeries;
}

function mean(values) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (values.length === 0) {
    return 0;
  }
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function modulationDepth(envelopeSeries) {
  const depths = envelopeSeries.map((series) => {
    if (series.length === 0) {
      return 0;
    }
    const peak = Math.max(...series);
    const floor = Math.min(...series);
    return peak - floor;
  });
  return mean(depths);
}

function usableBandEnergy(envelopeSeries, profile) {
  const redistributed = redistributeDeadRegionWeights(profile.electrodes);
  let weightedSum = 0;
  let weightTotal = 0;

  envelopeSeries.forEach((series, index) => {
    const electrode = redistributed[index];
    const bandEnergy = mean(series.map((value) => value * value));
    weightedSum += bandEnergy * electrode.effectiveWeight;
    weightTotal += electrode.effectiveWeight;
  });

  return weightTotal > 0 ? weightedSum / weightTotal : 0;
}

function interBandContrast(envelopeSeries) {
  const bandMeans = envelopeSeries.map((series) => mean(series));
  return standardDeviation(bandMeans);
}

function bassRhythmSalience(envelopeSeries, profile) {
  let bassSum = 0;
  let bassCount = 0;
  profile.electrodes.forEach((electrode, index) => {
    if (electrode.centerHz >= 280 && electrode.centerHz <= 700) {
      bassSum += mean(envelopeSeries[index]);
      bassCount += 1;
    }
  });
  return bassCount > 0 ? bassSum / bassCount : 0;
}

function speechBandSalience(envelopeSeries, profile) {
  let speechSum = 0;
  let speechCount = 0;
  profile.electrodes.forEach((electrode, index) => {
    if (electrode.centerHz >= 500 && electrode.centerHz <= 4000) {
      speechSum += mean(envelopeSeries[index]);
      speechCount += 1;
    }
  });
  return speechCount > 0 ? speechSum / speechCount : 0;
}

function crestFactor(channelData) {
  let peak = 0;
  let sumSquares = 0;
  for (let i = 0; i < channelData.length; i++) {
    const value = Math.abs(channelData[i]);
    peak = Math.max(peak, value);
    sumSquares += channelData[i] * channelData[i];
  }
  const rms = Math.sqrt(sumSquares / channelData.length);
  return rms > 0 ? peak / rms : 0;
}

export function scoreCIBuffer(audioBuffer, profile) {
  const channelData = audioBuffer.getChannelData(0);
  if (!channelData.length) {
    return {
      composite: 0,
      modulation: 0,
      usableEnergy: 0,
      contrast: 0,
      bassRhythm: 0,
      speechBand: 0,
      crestFactor: 0
    };
  }

  const sampleRate = audioBuffer.sampleRate;
  const envelopeSeries = analyzeBandEnvelopes(channelData, sampleRate, profile);

  const modulation = modulationDepth(envelopeSeries);
  const usableEnergy = usableBandEnergy(envelopeSeries, profile);
  const contrast = interBandContrast(envelopeSeries);
  const bassRhythm = bassRhythmSalience(envelopeSeries, profile);
  const speechBand = speechBandSalience(envelopeSeries, profile);
  const crest = crestFactor(channelData);

  const composite =
    modulation * 0.28 +
    usableEnergy * 120 * 0.22 +
    contrast * 0.2 +
    bassRhythm * 0.15 +
    speechBand * 0.1 +
    Math.min(crest, 12) * 0.05;

  return {
    composite,
    modulation,
    usableEnergy,
    contrast,
    bassRhythm,
    speechBand,
    crestFactor: crest
  };
}

export function formatMetricDelta(before, after) {
  const percent = (metric) => {
    if (before[metric] === 0) {
      return after[metric] > 0 ? 100 : 0;
    }
    return ((after[metric] - before[metric]) / before[metric]) * 100;
  };

  return {
    composite: percent('composite'),
    modulation: percent('modulation'),
    usableEnergy: percent('usableEnergy'),
    contrast: percent('contrast'),
    bassRhythm: percent('bassRhythm'),
    speechBand: percent('speechBand')
  };
}

export function extractAnalysisSegment(audioBuffer, maxSeconds = 12, range = null) {
  const sampleRate = audioBuffer.sampleRate;
  const totalSamples = audioBuffer.length;

  let startSample = 0;
  let endSample = totalSamples;

  if (range && Number.isFinite(range.startSec) && Number.isFinite(range.endSec)) {
    startSample = Math.max(0, Math.floor(range.startSec * sampleRate));
    endSample = Math.min(totalSamples, Math.floor(range.endSec * sampleRate));
    if (endSample <= startSample) {
      throw new Error('Optimize region end must be after start.');
    }
  } else {
    const segmentSamples = Math.min(totalSamples, Math.floor(sampleRate * maxSeconds));
    startSample = Math.max(0, Math.floor((totalSamples - segmentSamples) / 2));
    endSample = startSample + segmentSamples;
  }

  const available = endSample - startSample;
  const maxSamples = Math.floor(sampleRate * maxSeconds);
  const length = Math.min(available, maxSamples);
  startSample = Math.max(0, Math.min(startSample, totalSamples - length));

  const segmentBuffer = new AudioBuffer({
    length,
    numberOfChannels: 1,
    sampleRate
  });

  const source = audioBuffer.getChannelData(0);
  const destination = segmentBuffer.getChannelData(0);
  destination.set(source.subarray(startSample, startSample + length));
  return segmentBuffer;
}

export { getBandEdges, getBandCentersFromProfile };
