/**
 * Shared vocoder band layout derived from a MAP profile.
 */

import { MIN_HZ, MAX_HZ, redistributeDeadRegionWeights } from './mapProfiles.js?v=19';

export function getBandEdgesFromProfile(profile) {
  const centers = profile.electrodes.map((electrode) => electrode.centerHz);
  const edges = [MIN_HZ];
  for (let i = 0; i < centers.length - 1; i++) {
    edges.push(Math.sqrt(centers[i] * centers[i + 1]));
  }
  edges.push(MAX_HZ);
  return edges;
}

export function buildVocoderBandSpecs(profile) {
  const edges = getBandEdgesFromProfile(profile);
  const redistributed = redistributeDeadRegionWeights(profile.electrodes);

  return profile.electrodes.map((electrode, index) => {
    const bandwidth = edges[index + 1] - edges[index];
    const q = Math.max(0.35, Math.min(1.2, electrode.centerHz / bandwidth));
    const weight = redistributed[index].effectiveWeight;
    const active = electrode.status !== 'dead' && weight > 0;
    return {
      centerHz: electrode.centerHz,
      q,
      outputGain: active ? weight * 1.4 : 0
    };
  });
}
