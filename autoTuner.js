import { scoreCIBuffer, extractAnalysisSegment, formatMetricDelta } from './ciMetrics.js?v=29';
import {
  processEnhancement,
  processVocoder,
  audioBufferToFloatArray,
  floatArrayToAudioBuffer
} from './offlinePipeline.js?v=29';

const HARMONIC_DRIVE_VALUES = [0.35, 0.5, 0.65, 0.8, 0.95];
const COMP_THRESHOLD_VALUES = [-50, -44, -38, -32, -26];
const CLARITY_LIFT_VALUES = [4, 7, 10, 13, 16];
const TRANSPOSE_MIX_VALUES = [0.15, 0.3, 0.45, 0.6, 0.75];

function generateCandidateGrid() {
  const candidates = [];
  HARMONIC_DRIVE_VALUES.forEach((harmonicDrive) => {
    COMP_THRESHOLD_VALUES.forEach((compThreshold) => {
      CLARITY_LIFT_VALUES.forEach((clarityLift) => {
        TRANSPOSE_MIX_VALUES.forEach((transposeMix) => {
          candidates.push({ harmonicDrive, compThreshold, clarityLift, transposeMix });
        });
      });
    });
  });
  return candidates;
}

function evaluateCandidate(segmentBuffer, mapProfile, params) {
  const sampleRate = segmentBuffer.sampleRate;
  const input = audioBufferToFloatArray(segmentBuffer);
  const enhanced = processEnhancement(input, sampleRate, params, mapProfile);
  const vocoded = processVocoder(enhanced, sampleRate, mapProfile);
  const vocodedBuffer = floatArrayToAudioBuffer(vocoded, sampleRate);
  const metrics = scoreCIBuffer(vocodedBuffer, mapProfile);
  return { params, metrics };
}

export async function optimizeForCI(audioBuffer, mapProfile, onProgress, options = {}) {
  if (!audioBuffer || audioBuffer.length < audioBuffer.sampleRate) {
    throw new Error('Load at least one second of audio before optimizing.');
  }

  const minRegionSec = options.minRegionSec ?? 4;
  const range = options.range || null;
  if (range && range.endSec - range.startSec < minRegionSec) {
    throw new Error(`Optimize region must be at least ${minRegionSec} seconds.`);
  }

  const segment = extractAnalysisSegment(audioBuffer, options.maxSeconds ?? 12, range);
  const sampleRate = segment.sampleRate;
  const rawInput = audioBufferToFloatArray(segment);
  const rawVocoded = processVocoder(rawInput, sampleRate, mapProfile);
  const baselineBuffer = floatArrayToAudioBuffer(rawVocoded, sampleRate);
  const baselineMetrics = scoreCIBuffer(baselineBuffer, mapProfile);

  const candidates = generateCandidateGrid();
  let best = null;
  const total = candidates.length;

  for (let index = 0; index < candidates.length; index++) {
    const candidate = evaluateCandidate(segment, mapProfile, candidates[index]);
    if (!best || candidate.metrics.composite > best.metrics.composite) {
      best = candidate;
    }
    if (onProgress) {
      onProgress({
        phase: 'search',
        current: index + 1,
        total,
        bestParams: best.params,
        bestScore: best.metrics.composite,
        baselineScore: baselineMetrics.composite
      });
    }
    if (index % 8 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  const optimizedInput = processEnhancement(rawInput, sampleRate, best.params, mapProfile);
  const optimizedVocoded = processVocoder(optimizedInput, sampleRate, mapProfile);
  const optimizedBuffer = floatArrayToAudioBuffer(optimizedVocoded, sampleRate);
  const optimizedMetrics = scoreCIBuffer(optimizedBuffer, mapProfile);
  const deltas = formatMetricDelta(baselineMetrics, optimizedMetrics);

  return {
    bestParams: best.params,
    baselineMetrics,
    optimizedMetrics,
    deltas,
    candidatesEvaluated: total
  };
}
