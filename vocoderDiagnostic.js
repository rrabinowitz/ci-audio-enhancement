/**
 * 16-channel noise-band vocoder for CI hardware simulation (diagnostic only).
 * Band layout follows the active MAP profile when provided.
 */

import { buildVocoderBandSpecs } from './vocoderBands.js?v=19';
import { getProfileById } from './mapProfiles.js?v=19';

function makeAbsCurve() {
  const curve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) {
    const x = (i / 1024) - 1;
    curve[i] = Math.abs(x);
  }
  return curve;
}

export class VocoderDiagnostic {
  constructor(options = {}) {
    this.channelCount = options.channelCount || 16;
    this.envelopeCutoffHz = options.envelopeCutoffHz || 50;
    this.mapProfile = options.mapProfile || getProfileById('default-log-16');

    this.audioContext = null;
    this.inputNode = null;
    this.outputNode = null;
    this.noiseBufferSource = null;
    this.bands = [];
    this.sumNode = null;
    this.outputMakeupGain = null;
  }

  async init(audioContext) {
    this.audioContext = audioContext;
    this._buildGraph();
  }

  setMapProfile(profile) {
    this.mapProfile = profile;
    if (this.audioContext) {
      this._teardownGraph();
      this._buildGraph();
    }
  }

  _teardownGraph() {
    if (this.noiseBufferSource) {
      try {
        this.noiseBufferSource.stop();
      } catch (e) {
        // Already stopped.
      }
    }

    this.bands.forEach((band) => {
      [
        band.modBandpass,
        band.modRectifier,
        band.envelopeSmoother,
        band.envelopeBoost,
        band.carrierBandpass,
        band.carrierVca,
        band.bandOutputGain
      ].forEach((node) => {
        try {
          node.disconnect();
        } catch (e) {
          // Not connected.
        }
      });
    });

    [this.inputNode, this.sumNode, this.outputMakeupGain, this.outputNode].forEach((node) => {
      if (!node) {
        return;
      }
      try {
        node.disconnect();
      } catch (e) {
        // Not connected.
      }
    });

    this.bands = [];
    this.noiseBufferSource = null;
    this.inputNode = null;
    this.outputNode = null;
    this.sumNode = null;
    this.outputMakeupGain = null;
  }

  _buildGraph() {
    const ctx = this.audioContext;
    if (!ctx) {
      return;
    }

    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.sumNode = ctx.createGain();
    this.outputMakeupGain = ctx.createGain();

    this.sumNode.gain.value = 1;
    this.outputMakeupGain.gain.value = 3.5;

    const bandSpecs = buildVocoderBandSpecs(this.mapProfile);
    const absCurve = makeAbsCurve();

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    this.noiseBufferSource = ctx.createBufferSource();
    this.noiseBufferSource.buffer = noiseBuffer;
    this.noiseBufferSource.loop = true;

    this.bands = bandSpecs.map((spec) => {
      const modBandpass = ctx.createBiquadFilter();
      modBandpass.type = 'bandpass';
      modBandpass.frequency.value = spec.centerHz;
      modBandpass.Q.value = spec.q;

      const modRectifier = ctx.createWaveShaper();
      modRectifier.curve = absCurve;
      modRectifier.oversample = 'none';

      const envelopeSmoother = ctx.createBiquadFilter();
      envelopeSmoother.type = 'lowpass';
      envelopeSmoother.frequency.value = this.envelopeCutoffHz;
      envelopeSmoother.Q.value = 0.707;

      const envelopeBoost = ctx.createGain();
      envelopeBoost.gain.value = 18;

      const carrierBandpass = ctx.createBiquadFilter();
      carrierBandpass.type = 'bandpass';
      carrierBandpass.frequency.value = spec.centerHz;
      carrierBandpass.Q.value = spec.q;

      const carrierVca = ctx.createGain();
      carrierVca.gain.value = 0;

      const bandOutputGain = ctx.createGain();
      bandOutputGain.gain.value = spec.outputGain;

      this.inputNode.connect(modBandpass);
      modBandpass.connect(modRectifier);
      modRectifier.connect(envelopeSmoother);
      envelopeSmoother.connect(envelopeBoost);
      envelopeBoost.connect(carrierVca.gain);

      this.noiseBufferSource.connect(carrierBandpass);
      carrierBandpass.connect(carrierVca);
      carrierVca.connect(bandOutputGain);
      bandOutputGain.connect(this.sumNode);

      return {
        centerHz: spec.centerHz,
        q: spec.q,
        modBandpass,
        modRectifier,
        envelopeSmoother,
        envelopeBoost,
        carrierBandpass,
        carrierVca,
        bandOutputGain
      };
    });

    this.sumNode.connect(this.outputMakeupGain);
    this.outputMakeupGain.connect(this.outputNode);

    this.noiseBufferSource.start(0);
  }

  getInput() {
    return this.inputNode;
  }

  getOutput() {
    return this.outputNode;
  }

  getBandInfo() {
    return this.bands.map((band) => ({
      centerHz: band.centerHz,
      q: band.q
    }));
  }

  dispose() {
    this._teardownGraph();
    this.audioContext = null;
  }
}
