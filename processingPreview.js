/**
 * Instant 16-channel preview derived from MAP profile + enhancement slider values.
 * Updates immediately when controls move — does not require audio playback.
 */

import { redistributeDeadRegionWeights } from './mapProfiles.js?v=26';

export function computeProcessingPreview(mapProfile, params) {
  const redistributed = redistributeDeadRegionWeights(mapProfile.electrodes);
  const magnitudes = new Float32Array(mapProfile.electrodes.length);

  const clarityLift = params.clarityLift ?? 8;
  const harmonicDrive = params.harmonicDrive ?? 0.65;
  const compThreshold = params.compThreshold ?? -42;
  const transposeMix = params.transposeMix ?? 0.4;
  const bypassed = params.bypassed ?? false;

  const compBoost = 1 + Math.max(0, (-compThreshold - 26) / 34) * 0.35;

  for (let i = 0; i < redistributed.length; i++) {
    const electrode = redistributed[i];
    let level = bypassed ? 0.35 : electrode.effectiveWeight;

    if (!bypassed) {
      if (electrode.centerHz >= 280 && electrode.centerHz <= 700) {
        level *= 1 + harmonicDrive * 0.85;
      }

      if (electrode.centerHz >= 1200 && electrode.centerHz <= 3500) {
        level *= 1 + (clarityLift / 18) * 0.55;
      }

      if (electrode.centerHz >= 4000) {
        level *= 1 + transposeMix * 0.45;
      }

      if (electrode.centerHz >= 2000 && electrode.centerHz <= 5000) {
        level *= 1 + transposeMix * 0.25;
      }

      level *= compBoost;
    }

    magnitudes[i] = Math.min(1, level / 2.2);
  }

  return magnitudes;
}

export function computePreviewDelta(mapProfile, params) {
  const enhanced = computeProcessingPreview(mapProfile, params);
  const raw = computeProcessingPreview(mapProfile, { ...params, bypassed: true });
  const delta = new Float32Array(enhanced.length);

  for (let i = 0; i < delta.length; i++) {
    delta[i] = enhanced[i] - raw[i];
  }

  return { raw, enhanced, delta };
}

export function estimateBandEnergies(mapProfile, params) {
  const magnitudes = computeProcessingPreview(mapProfile, params);
  const bands = { low: 0, mid: 0, high: 0 };
  const counts = { low: 0, mid: 0, high: 0 };

  mapProfile.electrodes.forEach((electrode, index) => {
    const level = magnitudes[index] || 0;
    if (electrode.centerHz < 400) {
      bands.low += level;
      counts.low += 1;
    } else if (electrode.centerHz <= 4000) {
      bands.mid += level;
      counts.mid += 1;
    } else {
      bands.high += level;
      counts.high += 1;
    }
  });

  return {
    low: counts.low ? bands.low / counts.low : 0,
    mid: counts.mid ? bands.mid / counts.mid : 0,
    high: counts.high ? bands.high / counts.high : 0
  };
}

export function estimateCompressorGr(compThreshold) {
  const threshold = compThreshold ?? -42;
  const low = Math.min(24, Math.max(0, (-threshold - 20) * 0.35));
  const mid = Math.min(28, Math.max(0, (-threshold - 18) * 0.42));
  const high = Math.min(32, Math.max(0, (-threshold - 16) * 0.48));
  return { low, mid, high };
}
