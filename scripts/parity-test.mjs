/**
 * Offline pipeline determinism + sensitivity smoke test.
 * Run: node scripts/parity-test.mjs
 */

import { processEnhancement } from '../offlinePipeline.js';
import { getProfileById } from '../mapProfiles.js';

function rms(samples) {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

const profile = getProfileById('default-log-16');
const params = { harmonicDrive: 0.65, compThreshold: -42, clarityLift: 8, transposeMix: 0.4 };
const sampleRate = 48000;
const length = sampleRate * 2;
const input = new Float32Array(length);
for (let i = 0; i < length; i++) {
  input[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
}

const out1 = processEnhancement(input, sampleRate, params, profile);
const out2 = processEnhancement(input, sampleRate, params, profile);
let maxDiff = 0;
for (let i = 0; i < out1.length; i++) {
  maxDiff = Math.max(maxDiff, Math.abs(out1[i] - out2[i]));
}
if (maxDiff > 1e-9) {
  console.error(`FAIL: offline pipeline not deterministic (max diff ${maxDiff})`);
  process.exit(1);
}

const outAlt = processEnhancement(input, sampleRate, { ...params, harmonicDrive: 0.2 }, profile);
let diffAlt = 0;
for (let i = 0; i < out1.length; i++) {
  diffAlt += Math.abs(out1[i] - outAlt[i]);
}
if (diffAlt < 0.001) {
  console.error('FAIL: parameter change did not affect offline output');
  process.exit(1);
}

const rmsBase = rms(out1);
if (rmsBase <= 0 || !Number.isFinite(rmsBase)) {
  console.error('FAIL: offline output RMS invalid');
  process.exit(1);
}

console.log(
  `OK — offline pipeline deterministic; param sensitivity sum|Δ|=${diffAlt.toFixed(4)}; output RMS=${rmsBase.toFixed(4)}`
);
