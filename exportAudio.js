import {
  processEnhancement,
  processVocoder,
  floatArrayToAudioBuffer
} from './offlinePipeline.js?v=31';

function encodeWavFromAudioBuffer(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const samples = audioBuffer.length;
  const dataSize = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, value) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData = [];
  for (let channel = 0; channel < numChannels; channel++) {
    channelData.push(audioBuffer.getChannelData(channel));
  }

  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function applyStereoWidth(left, right, width) {
  const mid = (left + right) * 0.5;
  const side = (left - right) * 0.5;
  return mid + side * width;
}

function mixDownToMono(audioBuffer, stereoWidth = 0) {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0).slice();
  }

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);
  const mixed = new Float32Array(audioBuffer.length);
  for (let i = 0; i < mixed.length; i++) {
    mixed[i] = applyStereoWidth(left[i], right[i], stereoWidth);
  }
  return mixed;
}

export async function exportProcessedWav(audioBuffer, params, mapProfile, onProgress, options = {}) {
  const sampleRate = audioBuffer.sampleRate;
  const input = mixDownToMono(audioBuffer, params.stereoWidth ?? 0);

  if (onProgress) {
    onProgress({ phase: 'processing', percent: 10 });
  }
  await new Promise((resolve) => setTimeout(resolve, 0));

  let output = processEnhancement(input, sampleRate, params, mapProfile);

  if (options.includeVocoder) {
    if (onProgress) {
      onProgress({ phase: 'vocoder', percent: 55 });
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    output = processVocoder(output, sampleRate, mapProfile);
  }

  const masterGainDb = params.masterGainDb ?? 0;
  const masterLinear = Math.pow(10, masterGainDb / 20);
  for (let i = 0; i < output.length; i++) {
    output[i] *= masterLinear;
  }

  if (onProgress) {
    onProgress({ phase: 'encoding', percent: 85 });
  }
  await new Promise((resolve) => setTimeout(resolve, 0));

  const rendered = floatArrayToAudioBuffer(output, sampleRate);
  const blob = encodeWavFromAudioBuffer(rendered);

  if (onProgress) {
    onProgress({ phase: 'done', percent: 100 });
  }

  return blob;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
