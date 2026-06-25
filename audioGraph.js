/**
 * CI Audio Enhancement Engine — Web Audio API processing graph.
 * Parallel multi-band compression, harmonic bass excitation, clarity lift,
 * and high-frequency transposition. Visualizer uses a separate analyser tap.
 */

import { getProfileById, redistributeDeadRegionWeights } from './mapProfiles.js?v=18';

function dbToLinear(db) {
  return Math.pow(10, db / 20);
}

function makeHarmonicCurve(drive) {
  const curve = new Float32Array(8192);
  const clampedDrive = Math.max(0, Math.min(1, drive));
  for (let i = 0; i < 8192; i++) {
    const x = (i / 4096) - 1;
    const secondOrder = x * x * Math.sign(x);
    const thirdOrder = x * x * x;
    curve[i] = x + clampedDrive * 1.8 * secondOrder + clampedDrive * 0.9 * thirdOrder;
  }
  return curve;
}

export class CIAudioEngine {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.audioBuffer = null;
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseOffset = 0;
    this.loopEnabled = false;
    this.playbackListener = null;
    this.analyserSmoothing = 0.6;

    this.enhancementInput = null;
    this.enhancementOutput = null;
    this.masterGainNode = null;
    this.visualAnalyser = null;
    this.visualTapGain = null;
    this.visualAnalyserSink = null;

    this.rawBypassGain = null;
    this.enhancedGain = null;
    this.enhancementBypassed = false;
    this.abLoudnessMatchEnabled = true;

    this.lowCompressor = null;
    this.midCompressor = null;
    this.highCompressor = null;
    this.lowPreAnalyser = null;
    this.midPreAnalyser = null;
    this.highPreAnalyser = null;
    this.lowPostAnalyser = null;
    this.midPostAnalyser = null;
    this.highPostAnalyser = null;
    this.meterPeakHold = {
      low: { pre: -120, post: -120 },
      mid: { pre: -120, post: -120 },
      high: { pre: -120, post: -120 }
    };
    this.lowMakeupGain = null;
    this.midMakeupGain = null;
    this.highMakeupGain = null;
    this.clarityFilter = null;
    this.harmonicBlendGain = null;
    this.harmonicShaper = null;
    this.transposeMix = 0.4;
    this.ringOsc = null;
    this.transposeGain = null;

    this.channelAnalysers = [];
    this.rawChannelAnalysers = [];
    this.fullAnalyser = null;
    this.channelMagnitudes = new Float32Array(16);
    this.rawChannelMagnitudes = new Float32Array(16);
    this._rawChannelNodes = null;

    this.vocoder = null;
    this.vocoderDryGain = null;
    this.vocoderWetGain = null;
    this.vocoderBypassGain = null;
    this.vocoderEnabled = false;
    this.vocoderDryWet = 0;

    this.harmonicDrive = 0.65;
    this.compThreshold = -42;
    this.clarityLiftDb = 8;
    this.masterGainDb = 0;

    this.mapProfile = getProfileById('default-log-16');
    this.mapShaperInput = null;
    this.mapShaperOutput = null;
    this.mapShaperFilters = [];

    this.inputMode = 'file';
    this.mediaStream = null;
    this.mediaStreamSource = null;
    this.stereoWidth = 0;
    this._lastEndedNaturally = false;
  }

  async init() {
    if (this.audioContext) {
      return;
    }

    this.audioContext = new AudioContext();

    this.enhancementInput = this.audioContext.createGain();
    this.enhancementOutput = this.audioContext.createGain();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.gain.value = dbToLinear(this.masterGainDb);

    this._buildStereoWidthNode();

    this.visualAnalyser = this.audioContext.createAnalyser();
    this.visualAnalyser.fftSize = 4096;
    this.visualAnalyser.smoothingTimeConstant = 0.6;
    this.visualAnalyser.minDecibels = -100;
    this.visualAnalyser.maxDecibels = -20;

    this.visualTapGain = this.audioContext.createGain();
    this.visualTapGain.gain.value = 1;

    this.visualAnalyserSink = this.audioContext.createGain();
    this.visualAnalyserSink.gain.value = 0;

    this.rawBypassGain = this.audioContext.createGain();
    this.rawBypassMakeupGain = this.audioContext.createGain();
    this.enhancedGain = this.audioContext.createGain();
    this.rawBypassGain.gain.value = 0;
    this.rawBypassMakeupGain.gain.value = 1;
    this.enhancedGain.gain.value = 1;

    this._buildMapShaper();
    this._buildEnhancementChain();
    this._buildOutputRouting();
    this._buildRawChannelAnalysers();
    this._updateVocoderRouting();
  }

  async ensureContextRunning() {
    if (!this.audioContext) {
      throw new Error('Audio engine is not initialized');
    }

    // Safari adds a non-standard "interrupted" state (e.g. another audio session
    // took over, or the context was just created). It recovers via resume(), the
    // same as "suspended". The state transition is async, so resume + poll.
    const needsResume = () =>
      this.audioContext.state === 'suspended' ||
      this.audioContext.state === 'interrupted';

    for (let attempt = 0; attempt < 3 && needsResume(); attempt++) {
      try {
        await this.audioContext.resume();
      } catch {
        // resume() can reject if called outside a user gesture; fall through to poll.
      }

      const deadline = Date.now() + 250;
      while (this.audioContext.state !== 'running' && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }

    if (this.audioContext.state !== 'running') {
      throw new Error(`Audio output is blocked (context state: ${this.audioContext.state}). Tap Play or click the page, then try again.`);
    }
  }

  _buildStereoWidthNode() {
    const ctx = this.audioContext;
    this.stereoInput = ctx.createGain();
    this.stereoSplitter = ctx.createChannelSplitter(2);
    this.stereoMerger = ctx.createChannelMerger(1);

    this.stereoMidL = ctx.createGain();
    this.stereoMidR = ctx.createGain();
    this.stereoMidL.gain.value = 0.5;
    this.stereoMidR.gain.value = 0.5;

    this.stereoSideL = ctx.createGain();
    this.stereoSideR = ctx.createGain();
    this.stereoSideL.gain.value = 0.5;
    this.stereoSideR.gain.value = -0.5;

    this.stereoSideGain = ctx.createGain();
    this.stereoSideGain.gain.value = this.stereoWidth;

    this.stereoInput.connect(this.stereoSplitter);
    this.stereoSplitter.connect(this.stereoMidL, 0);
    this.stereoSplitter.connect(this.stereoMidR, 1);
    this.stereoSplitter.connect(this.stereoSideL, 0);
    this.stereoSplitter.connect(this.stereoSideR, 1);

    this.stereoMidL.connect(this.stereoMerger, 0, 0);
    this.stereoMidR.connect(this.stereoMerger, 0, 0);
    this.stereoSideL.connect(this.stereoSideGain);
    this.stereoSideR.connect(this.stereoSideGain);
    this.stereoSideGain.connect(this.stereoMerger, 0, 0);

    this.stereoMerger.connect(this.enhancementInput);
  }

  setStereoWidth(value) {
    this.stereoWidth = Math.max(0, Math.min(1, value));
    if (this.stereoSideGain && this.audioContext) {
      this.stereoSideGain.gain.setTargetAtTime(
        this.stereoWidth,
        this.audioContext.currentTime,
        0.02
      );
    }
  }

  getStereoWidth() {
    return this.stereoWidth;
  }

  _buildMapShaper() {
    const ctx = this.audioContext;
    this.mapShaperInput = ctx.createGain();
    this.mapShaperOutput = ctx.createGain();
    this.mapShaperFilters = [];

    this.enhancementInput.connect(this.mapShaperInput);
    this._applyMapProfileToShaper();
  }

  _applyMapProfileToShaper() {
    const ctx = this.audioContext;
    const profile = this.mapProfile;

    if (this._mapDryPath) {
      try {
        this._mapDryPath.disconnect();
      } catch (e) {
        // Not connected.
      }
      this._mapDryPath = null;
    }

    if (this.mapShaperInput) {
      try {
        this.mapShaperInput.disconnect();
      } catch (e) {
        // Not connected.
      }
    }

    this.mapShaperFilters.forEach(({ peaking, bandGain }) => {
      try {
        peaking.disconnect();
      } catch (e) {
        // Not connected.
      }
      try {
        bandGain.disconnect();
      } catch (e) {
        // Not connected.
      }
    });

    this.mapShaperFilters = [];
    const redistributed = redistributeDeadRegionWeights(profile.electrodes);

    this._mapDryPath = ctx.createGain();
    this._mapDryPath.gain.value = 0.25;
    this.mapShaperInput.connect(this._mapDryPath);
    this._mapDryPath.connect(this.mapShaperOutput);

    profile.electrodes.forEach((electrode, index) => {
      const peaking = ctx.createBiquadFilter();
      peaking.type = 'peaking';
      peaking.frequency.value = electrode.centerHz;
      peaking.Q.value = 0.85;
      const weight = redistributed[index].effectiveWeight;
      peaking.gain.value = electrode.status === 'dead' ? -24 : (weight - 1) * 10;

      const bandGain = ctx.createGain();
      bandGain.gain.value = electrode.status === 'dead' ? 0 : 0.7 + weight * 0.3;

      this.mapShaperInput.connect(peaking);
      peaking.connect(bandGain);
      bandGain.connect(this.mapShaperOutput);

      this.mapShaperFilters.push({ peaking, bandGain, electrode });
    });
  }

  _buildEnhancementChain() {
    const ctx = this.audioContext;

    const lowSplit = ctx.createBiquadFilter();
    lowSplit.type = 'lowpass';
    lowSplit.frequency.value = 250;
    lowSplit.Q.value = 0.707;

    const midHighPass = ctx.createBiquadFilter();
    midHighPass.type = 'highpass';
    midHighPass.frequency.value = 250;
    midHighPass.Q.value = 0.707;

    const midLowPass = ctx.createBiquadFilter();
    midLowPass.type = 'lowpass';
    midLowPass.frequency.value = 4000;
    midLowPass.Q.value = 0.707;

    const highSplit = ctx.createBiquadFilter();
    highSplit.type = 'highpass';
    highSplit.frequency.value = 4000;
    highSplit.Q.value = 0.707;

    this.lowCompressor = ctx.createDynamicsCompressor();
    this.lowCompressor.threshold.value = this.compThreshold;
    this.lowCompressor.knee.value = 0;
    this.lowCompressor.ratio.value = 12;
    this.lowCompressor.attack.value = 0.002;
    this.lowCompressor.release.value = 0.08;

    this.midCompressor = ctx.createDynamicsCompressor();
    this.midCompressor.threshold.value = this.compThreshold;
    this.midCompressor.knee.value = 0;
    this.midCompressor.ratio.value = 16;
    this.midCompressor.attack.value = 0.001;
    this.midCompressor.release.value = 0.06;

    this.highCompressor = ctx.createDynamicsCompressor();
    this.highCompressor.threshold.value = this.compThreshold;
    this.highCompressor.knee.value = 0;
    this.highCompressor.ratio.value = 20;
    this.highCompressor.attack.value = 0.0008;
    this.highCompressor.release.value = 0.05;

    this.lowMakeupGain = ctx.createGain();
    this.lowMakeupGain.gain.value = dbToLinear(8);

    this.midMakeupGain = ctx.createGain();
    this.midMakeupGain.gain.value = dbToLinear(10);

    this.highMakeupGain = ctx.createGain();
    this.highMakeupGain.gain.value = dbToLinear(12);

    const makeMeterTap = () => {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.35;
      return analyser;
    };

    this.lowPreAnalyser = makeMeterTap();
    this.midPreAnalyser = makeMeterTap();
    this.highPreAnalyser = makeMeterTap();
    this.lowPostAnalyser = makeMeterTap();
    this.midPostAnalyser = makeMeterTap();
    this.highPostAnalyser = makeMeterTap();

    this.clarityFilter = ctx.createBiquadFilter();
    this.clarityFilter.type = 'peaking';
    this.clarityFilter.frequency.value = 2000;
    this.clarityFilter.Q.value = 0.7;
    this.clarityFilter.gain.value = this.clarityLiftDb;

    const harmonicSourceSplit = ctx.createBiquadFilter();
    harmonicSourceSplit.type = 'lowpass';
    harmonicSourceSplit.frequency.value = 150;
    harmonicSourceSplit.Q.value = 0.707;

    this.harmonicShaper = ctx.createWaveShaper();
    this.harmonicShaper.curve = makeHarmonicCurve(this.harmonicDrive);
    this.harmonicShaper.oversample = '4x';

    const harmonicBandLimit = ctx.createBiquadFilter();
    harmonicBandLimit.type = 'bandpass';
    harmonicBandLimit.frequency.value = 450;
    harmonicBandLimit.Q.value = 0.9;

    const harmonicHighPass = ctx.createBiquadFilter();
    harmonicHighPass.type = 'highpass';
    harmonicHighPass.frequency.value = 280;
    harmonicHighPass.Q.value = 0.707;

    this.harmonicBlendGain = ctx.createGain();
    this.harmonicBlendGain.gain.value = this.harmonicDrive;

    const highTransientExtract = ctx.createBiquadFilter();
    highTransientExtract.type = 'highpass';
    highTransientExtract.frequency.value = 6000;
    highTransientExtract.Q.value = 0.5;

    this.ringOsc = ctx.createOscillator();
    this.ringOsc.frequency.value = 3500;
    this.ringOsc.type = 'sine';

    this.ringMod = ctx.createGain();
    this.ringMod.gain.value = 0;

    const transposeLowPass = ctx.createBiquadFilter();
    transposeLowPass.type = 'lowpass';
    transposeLowPass.frequency.value = 5000;
    transposeLowPass.Q.value = 0.5;

    this.transposeGain = ctx.createGain();
    this.transposeGain.gain.value = this.transposeMix;

    const highBandDirectGain = ctx.createGain();
    highBandDirectGain.gain.value = 0.4;

    const bandMerger = ctx.createGain();
    bandMerger.gain.value = 1;

    this.ringOsc.connect(this.ringMod.gain);
    this.ringOsc.start();

    this.mapShaperOutput.connect(lowSplit);
    this.mapShaperOutput.connect(midHighPass);
    this.mapShaperOutput.connect(highSplit);
    this.mapShaperOutput.connect(harmonicSourceSplit);

    lowSplit.connect(this.lowPreAnalyser);
    lowSplit.connect(this.lowCompressor);
    this.lowCompressor.connect(this.lowPostAnalyser);
    this.lowPostAnalyser.connect(this.lowMakeupGain);
    this.lowMakeupGain.connect(bandMerger);

    midHighPass.connect(midLowPass);
    midLowPass.connect(this.midPreAnalyser);
    midLowPass.connect(this.midCompressor);
    this.midCompressor.connect(this.midPostAnalyser);
    this.midPostAnalyser.connect(this.midMakeupGain);
    this.midMakeupGain.connect(this.clarityFilter);

    harmonicSourceSplit.connect(this.harmonicShaper);
    this.harmonicShaper.connect(harmonicHighPass);
    harmonicHighPass.connect(harmonicBandLimit);
    harmonicBandLimit.connect(this.harmonicBlendGain);
    this.harmonicBlendGain.connect(this.clarityFilter);

    this.clarityFilter.connect(bandMerger);

    highSplit.connect(this.highPreAnalyser);
    highSplit.connect(this.highCompressor);
    this.highCompressor.connect(this.highPostAnalyser);
    this.highPostAnalyser.connect(this.highMakeupGain);
    this.highMakeupGain.connect(highBandDirectGain);
    highBandDirectGain.connect(bandMerger);

    this.highMakeupGain.connect(highTransientExtract);
    highTransientExtract.connect(this.ringMod);
    this.ringMod.connect(transposeLowPass);
    transposeLowPass.connect(this.transposeGain);
    this.transposeGain.connect(bandMerger);

    bandMerger.connect(this.enhancementOutput);

    this.setCompThreshold(this.compThreshold);
    this.setHarmonicDrive(this.harmonicDrive);
    this.setClarityLift(this.clarityLiftDb);
    this.setTransposeMix(this.transposeMix);

    this._enhancementNodes = {
      lowSplit,
      midHighPass,
      midLowPass,
      highSplit,
      harmonicSourceSplit,
      harmonicBandLimit,
      harmonicHighPass,
      highTransientExtract,
      transposeLowPass,
      highBandDirectGain,
      bandMerger
    };
  }

  _disconnectChannelAnalyserSet(nodes, tapNode) {
    if (nodes && tapNode) {
      nodes.forEach(({ bandpass }) => {
        try {
          tapNode.disconnect(bandpass);
        } catch (e) {
          // Not connected.
        }
      });
    }

    if (nodes) {
      nodes.forEach(({ bandpass, analyser }) => {
        try {
          bandpass.disconnect();
        } catch (e) {
          // Not connected.
        }
        try {
          analyser.disconnect();
        } catch (e) {
          // Not connected.
        }
      });
    }
  }

  _buildChannelAnalyserSet(tapNode, centers) {
    const ctx = this.audioContext;
    const nodes = [];
    const analysers = [];

    centers.forEach((centerHz) => {
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = centerHz;
      bandpass.Q.value = 2.0;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = this.analyserSmoothing;

      tapNode.connect(bandpass);
      bandpass.connect(analyser);
      nodes.push({ bandpass, analyser });
      analysers.push(analyser);
    });

    return { nodes, analysers };
  }

  _buildRawChannelAnalysers() {
    if (!this.enhancementInput || !this.audioContext) {
      return;
    }

    const centers = this.mapProfile.electrodes.map((e) => e.centerHz);
    this._disconnectChannelAnalyserSet(this._rawChannelNodes, this.enhancementInput);

    const built = this._buildChannelAnalyserSet(this.enhancementInput, centers);
    this._rawChannelNodes = built.nodes;
    this.rawChannelAnalysers = built.analysers;
  }

  _buildChannelAnalysers(tapNode) {
    const ctx = this.audioContext;
    const centers = this.mapProfile.electrodes.map((e) => e.centerHz);

    this._disconnectChannelAnalyserSet(this._channelNodes, tapNode);

    const built = this._buildChannelAnalyserSet(tapNode, centers);
    this._channelNodes = built.nodes;
    this.channelAnalysers = built.analysers;

    if (!this.fullAnalyser) {
      this.fullAnalyser = ctx.createAnalyser();
      this.fullAnalyser.fftSize = 2048;
      this.fullAnalyser.smoothingTimeConstant = this.analyserSmoothing;
      tapNode.connect(this.fullAnalyser);
    }
  }

  setAnalyserSmoothing(value) {
    this.analyserSmoothing = Math.max(0, Math.min(0.95, value));

    this.channelAnalysers.forEach((analyser) => {
      analyser.smoothingTimeConstant = this.analyserSmoothing;
    });

    this.rawChannelAnalysers.forEach((analyser) => {
      analyser.smoothingTimeConstant = this.analyserSmoothing;
    });

    if (this.fullAnalyser) {
      this.fullAnalyser.smoothingTimeConstant = this.analyserSmoothing;
    }

    if (this.visualAnalyser) {
      this.visualAnalyser.smoothingTimeConstant = this.analyserSmoothing;
    }
  }

  getAnalyserSmoothing() {
    return this.analyserSmoothing;
  }

  _buildOutputRouting() {
    const ctx = this.audioContext;

    this.vocoderDryGain = ctx.createGain();
    this.vocoderWetGain = ctx.createGain();
    this.vocoderBypassGain = ctx.createGain();

    this.vocoderDryGain.gain.value = 0;
    this.vocoderWetGain.gain.value = 0;
    this.vocoderBypassGain.gain.value = 1;

    const preVocoderBus = ctx.createGain();
    preVocoderBus.gain.value = 1;

    const outputMerger = ctx.createGain();
    outputMerger.gain.value = 1;

    this.enhancementOutput.connect(this.enhancedGain);
    this.enhancedGain.connect(preVocoderBus);

    this.enhancementInput.connect(this.rawBypassGain);
    this.rawBypassGain.connect(this.rawBypassMakeupGain);
    this.rawBypassMakeupGain.connect(preVocoderBus);

    preVocoderBus.connect(this.vocoderBypassGain);
    this.vocoderBypassGain.connect(outputMerger);

    preVocoderBus.connect(this.vocoderDryGain);
    this.vocoderDryGain.connect(outputMerger);

    this.vocoderWetGain.connect(outputMerger);

    preVocoderBus.connect(this.visualTapGain);
    this.visualTapGain.connect(this.visualAnalyser);
    this.visualAnalyser.connect(this.visualAnalyserSink);
    this.visualAnalyserSink.connect(ctx.destination);

    outputMerger.connect(this.masterGainNode);
    this.masterGainNode.connect(ctx.destination);

    this._preVocoderBus = preVocoderBus;
    this._outputMerger = outputMerger;

    this._buildChannelAnalysers(preVocoderBus);
  }

  async setVocoder(vocoderInstance) {
    if (this.vocoder && this._preVocoderBus) {
      try {
        this._preVocoderBus.disconnect(this.vocoder.getInput());
      } catch (e) {
        // Not connected.
      }
      try {
        this.vocoder.getOutput().disconnect(this.vocoderWetGain);
      } catch (e) {
        // Not connected.
      }
    }

    this.vocoder = vocoderInstance;

    if (!this.vocoder || !this.audioContext) {
      return;
    }

    await this.vocoder.init(this.audioContext);

    if (this._preVocoderBus) {
      this._preVocoderBus.connect(this.vocoder.getInput());
      this.vocoder.getOutput().connect(this.vocoderWetGain);
    }

    this._updateVocoderRouting();
  }

  _updateVocoderRouting() {
    if (!this.vocoderBypassGain || !this.vocoderDryGain || !this.vocoderWetGain || !this.audioContext) {
      return;
    }

    if (!this.vocoderEnabled) {
      this.vocoderBypassGain.gain.setTargetAtTime(1, this.audioContext.currentTime, 0.01);
      this.vocoderDryGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.01);
      this.vocoderWetGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.01);
      return;
    }

    this.vocoderBypassGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.01);

    const wet = this.vocoderDryWet;
    const dry = 1 - wet;

    this.vocoderDryGain.gain.setTargetAtTime(dry, this.audioContext.currentTime, 0.01);
    this.vocoderWetGain.gain.setTargetAtTime(wet, this.audioContext.currentTime, 0.01);
  }

  _stopMicrophone() {
    if (this.mediaStreamSource) {
      try {
        this.mediaStreamSource.disconnect();
      } catch (e) {
        // Not connected.
      }
      this.mediaStreamSource = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  async loadAudioBuffer(audioBuffer, options = {}) {
    await this.init();
    await this.ensureContextRunning();

    this._stopMicrophone();
    this.inputMode = 'file';

    this.audioBuffer = audioBuffer;
    this.pauseOffset = 0;
    if (options.loopEnabled !== undefined) {
      this.loopEnabled = options.loopEnabled;
    }
    this.stop();
    this._notifyPlayback();
  }

  _destroySource() {
    if (!this.sourceNode) {
      return;
    }

    this.sourceNode.onended = null;

    try {
      this.sourceNode.stop();
    } catch (e) {
      // Source may already be stopped.
    }

    try {
      this.sourceNode.disconnect();
    } catch (e) {
      // Not connected.
    }

    this.sourceNode = null;
  }

  _startSourceAt(offsetSeconds) {
    const duration = this.getDuration();
    if (!this.audioBuffer || duration <= 0) {
      return;
    }

    let offset = offsetSeconds;
    if (this.loopEnabled) {
      offset = ((offset % duration) + duration) % duration;
    } else {
      offset = Math.max(0, Math.min(duration, offset));
    }

    this._destroySource();

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.loop = this.loopEnabled;
    if (this.loopEnabled) {
      this.sourceNode.loopStart = 0;
      this.sourceNode.loopEnd = duration;
    }

    this.sourceNode.connect(this.stereoInput);

    this.sourceNode.onended = () => {
      if (!this.isPlaying || this.loopEnabled) {
        return;
      }

      this.isPlaying = false;
      this.pauseOffset = duration;
      this.sourceNode = null;
      this._lastEndedNaturally = true;
      this._notifyPlayback();
    };

    this.sourceNode.start(0, offset);
    this.startTime = this.audioContext.currentTime - offset;
    this.pauseOffset = offset;
    this.isPlaying = true;
    this._notifyPlayback();
  }

  async startMicrophone(options = {}) {
    await this.init();
    await this.ensureContextRunning();

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone input is not supported in this browser');
    }

    this.stop();
    this._stopMicrophone();

    const previousMode = this.inputMode;
    const previousBuffer = this.audioBuffer;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: options.echoCancellation !== false,
          noiseSuppression: options.noiseSuppression !== false,
          autoGainControl: false
        }
      });

      this.inputMode = 'mic';
      this.audioBuffer = null;
      this.loopEnabled = false;
      this.pauseOffset = 0;
      this.mediaStream = stream;
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.mediaStreamSource.connect(this.stereoInput);
      this.isPlaying = true;
      this._notifyPlayback();
    } catch (error) {
      this.inputMode = previousMode;
      this.audioBuffer = previousBuffer;
      throw error;
    }
  }

  stopMicrophone() {
    if (this.inputMode !== 'mic') {
      return;
    }

    this._stopMicrophone();
    this.inputMode = 'file';
    this.isPlaying = false;
    this._notifyPlayback();
  }

  isMicrophoneActive() {
    return this.inputMode === 'mic';
  }

  getInputMode() {
    return this.inputMode;
  }

  async play() {
    await this.init();
    await this.ensureContextRunning();

    if (this.inputMode === 'mic') {
      if (!this.mediaStream) {
        throw new Error('Microphone is not active');
      }
      if (!this.mediaStreamSource) {
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.mediaStreamSource.connect(this.stereoInput);
      }
      this.isPlaying = true;
      this._notifyPlayback();
      return;
    }

    if (!this.audioBuffer) {
      throw new Error('No audio file loaded');
    }

    if (this.isPlaying) {
      return;
    }

    if (!this.loopEnabled && this.pauseOffset >= this.getDuration()) {
      this.pauseOffset = 0;
    }

    this._startSourceAt(this.pauseOffset);
  }

  pause() {
    if (this.inputMode === 'mic') {
      if (this.mediaStreamSource) {
        try {
          this.mediaStreamSource.disconnect();
        } catch (e) {
          // Not connected.
        }
        this.mediaStreamSource = null;
      }
      this.isPlaying = false;
      this._notifyPlayback();
      return;
    }

    if (!this.isPlaying || !this.sourceNode) {
      return;
    }

    this.pauseOffset = this.getCurrentTime();
    this._destroySource();
    this.isPlaying = false;
    this._notifyPlayback();
  }

  stop() {
    if (this.inputMode === 'mic') {
      this.stopMicrophone();
      return;
    }

    this._destroySource();
    this.isPlaying = false;
    this.pauseOffset = 0;
    this._notifyPlayback();
  }

  seek(seconds) {
    if (this.inputMode === 'mic' || !this.audioBuffer) {
      return;
    }

    const duration = this.getDuration();
    let target = seconds;

    if (this.loopEnabled && duration > 0) {
      target = ((target % duration) + duration) % duration;
    } else {
      target = Math.max(0, Math.min(duration, target));
    }

    this.pauseOffset = target;

    if (this.isPlaying) {
      this._startSourceAt(target);
    } else {
      this._notifyPlayback();
    }
  }

  seekRelative(deltaSeconds) {
    this.seek(this.getCurrentTime() + deltaSeconds);
  }

  seekToStart() {
    this.seek(0);
  }

  setLoopEnabled(enabled) {
    this.loopEnabled = Boolean(enabled);

    if (this.isPlaying) {
      this._startSourceAt(this.getCurrentTime());
    } else {
      this._notifyPlayback();
    }
  }

  getCurrentTime() {
    if (!this.audioBuffer) {
      return 0;
    }

    const duration = this.getDuration();

    if (this.isPlaying && this.audioContext) {
      const elapsed = this.audioContext.currentTime - this.startTime;

      if (this.loopEnabled && duration > 0) {
        return elapsed % duration;
      }

      return Math.min(elapsed, duration);
    }

    return Math.max(0, Math.min(duration, this.pauseOffset));
  }

  getLoopEnabled() {
    return this.loopEnabled;
  }

  setPlaybackListener(listener) {
    this.playbackListener = listener;
  }

  getPlaybackState() {
    const state = {
      isPlaying: this.isPlaying,
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      loopEnabled: this.loopEnabled,
      endedNaturally: this._lastEndedNaturally
    };
    this._lastEndedNaturally = false;
    return state;
  }

  _notifyPlayback() {
    if (typeof this.playbackListener === 'function') {
      this.playbackListener(this.getPlaybackState());
    }
  }

  setHarmonicDrive(value) {
    this.harmonicDrive = Math.max(0, Math.min(1, value));

    if (!this.audioContext) {
      return;
    }

    if (this.harmonicShaper) {
      this.harmonicShaper.curve = makeHarmonicCurve(this.harmonicDrive);
    }

    if (this.harmonicBlendGain) {
      this.harmonicBlendGain.gain.setTargetAtTime(
        this.harmonicDrive,
        this.audioContext.currentTime,
        0.02
      );
    }
  }

  setCompThreshold(db) {
    this.compThreshold = db;

    if (!this.audioContext) {
      return;
    }

    const time = this.audioContext.currentTime;

    if (this.lowCompressor) {
      this.lowCompressor.threshold.setTargetAtTime(db, time, 0.02);
    }
    if (this.midCompressor) {
      this.midCompressor.threshold.setTargetAtTime(db - 2, time, 0.02);
    }
    if (this.highCompressor) {
      this.highCompressor.threshold.setTargetAtTime(db - 4, time, 0.02);
    }
  }

  setClarityLift(db) {
    this.clarityLiftDb = db;

    if (!this.audioContext || !this.clarityFilter) {
      return;
    }

    this.clarityFilter.gain.setTargetAtTime(db, this.audioContext.currentTime, 0.02);
  }

  setTransposeMix(value) {
    this.transposeMix = Math.max(0, Math.min(1, value));

    if (!this.audioContext || !this.transposeGain) {
      return;
    }

    this.transposeGain.gain.setTargetAtTime(
      this.transposeMix,
      this.audioContext.currentTime,
      0.02
    );
  }

  setMasterGain(db) {
    this.masterGainDb = db;

    if (!this.audioContext || !this.masterGainNode) {
      return;
    }

    this.masterGainNode.gain.setTargetAtTime(
      dbToLinear(db),
      this.audioContext.currentTime,
      0.02
    );
  }

  setVocoderEnabled(enabled) {
    this.vocoderEnabled = enabled;
    this._updateVocoderRouting();
  }

  setVocoderDryWet(value) {
    this.vocoderDryWet = Math.max(0, Math.min(1, value));
    if (this.vocoderEnabled) {
      this._updateVocoderRouting();
    }
  }

  setAbLoudnessMatchEnabled(enabled) {
    this.abLoudnessMatchEnabled = Boolean(enabled);
    if (!this.enhancementBypassed) {
      return;
    }
    this._applyBypassLoudnessMatch();
  }

  _meanMagnitude(magnitudes) {
    let sum = 0;
    for (let i = 0; i < magnitudes.length; i++) {
      sum += magnitudes[i];
    }
    return magnitudes.length ? sum / magnitudes.length : 0;
  }

  _applyBypassLoudnessMatch() {
    if (!this.audioContext || !this.rawBypassMakeupGain || !this.abLoudnessMatchEnabled) {
      if (this.rawBypassMakeupGain && this.audioContext) {
        this.rawBypassMakeupGain.gain.setTargetAtTime(1, this.audioContext.currentTime, 0.03);
      }
      return;
    }

    const enhancedMean = this._meanMagnitude(this.readChannelMagnitudes());
    const rawMean = this._meanMagnitude(this.readRawChannelMagnitudes());
    const ratio = enhancedMean / Math.max(rawMean, 0.01);
    const clamped = Math.max(0.25, Math.min(4, ratio));
    this.rawBypassMakeupGain.gain.setTargetAtTime(
      clamped,
      this.audioContext.currentTime,
      0.05
    );
  }

  setEnhancementBypassed(bypassed) {
    this.enhancementBypassed = bypassed;
    if (!this.audioContext) {
      return;
    }
    const time = this.audioContext.currentTime;
    if (bypassed) {
      if (this.abLoudnessMatchEnabled) {
        this._applyBypassLoudnessMatch();
      } else if (this.rawBypassMakeupGain) {
        this.rawBypassMakeupGain.gain.setTargetAtTime(1, time, 0.02);
      }
      this.enhancedGain.gain.setTargetAtTime(0, time, 0.02);
      this.rawBypassGain.gain.setTargetAtTime(1, time, 0.02);
    } else {
      this.enhancedGain.gain.setTargetAtTime(1, time, 0.02);
      this.rawBypassGain.gain.setTargetAtTime(0, time, 0.02);
      if (this.rawBypassMakeupGain) {
        this.rawBypassMakeupGain.gain.setTargetAtTime(1, time, 0.02);
      }
    }
  }

  setMapProfile(profile) {
    this.mapProfile = profile;
    if (this.vocoder?.setMapProfile) {
      this.vocoder.setMapProfile(profile);
    }
    if (!this.audioContext) {
      return;
    }
    if (this.mapShaperInput) {
      this._applyMapProfileToShaper();
    }
    if (this._preVocoderBus) {
      this._buildChannelAnalysers(this._preVocoderBus);
    }
    if (this.enhancementInput) {
      this._buildRawChannelAnalysers();
    }
    if (this.vocoder?.getInput && this._preVocoderBus && this.vocoder.getInput()) {
      try {
        this._preVocoderBus.disconnect(this.vocoder.getInput());
      } catch (e) {
        // Not connected.
      }
      try {
        this.vocoder.getOutput().disconnect(this.vocoderWetGain);
      } catch (e) {
        // Not connected.
      }
      this._preVocoderBus.connect(this.vocoder.getInput());
      this.vocoder.getOutput().connect(this.vocoderWetGain);
    }
  }

  getMapProfile() {
    return this.mapProfile;
  }

  getAudioBuffer() {
    return this.audioBuffer;
  }

  applyEnhancementParams(params) {
    this.setHarmonicDrive(params.harmonicDrive);
    this.setCompThreshold(params.compThreshold);
    this.setClarityLift(params.clarityLift);
    if (params.transposeMix !== undefined) {
      this.setTransposeMix(params.transposeMix);
    }
  }

  getCompressors() {
    return {
      low: this.lowCompressor,
      mid: this.midCompressor,
      high: this.highCompressor
    };
  }

  _readAnalyserRmsDb(analyser) {
    if (!analyser) {
      return -120;
    }

    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);
    return 20 * Math.log10(rms + 1e-8);
  }

  _updatePeakHold(band, preDb, postDb) {
    const hold = this.meterPeakHold[band];
    const decay = 0.92;
    hold.pre = Math.max(preDb, hold.pre * decay);
    hold.post = Math.max(postDb, hold.post * decay);
    return { prePeak: hold.pre, postPeak: hold.post };
  }

  getCompressorMetering() {
    const bands = ['low', 'mid', 'high'];
    const preAnalysers = {
      low: this.lowPreAnalyser,
      mid: this.midPreAnalyser,
      high: this.highPreAnalyser
    };
    const postAnalysers = {
      low: this.lowPostAnalyser,
      mid: this.midPostAnalyser,
      high: this.highPostAnalyser
    };
    const compressors = this.getCompressors();
    const result = {};

    bands.forEach((band) => {
      const preDb = this._readAnalyserRmsDb(preAnalysers[band]);
      const postDb = this._readAnalyserRmsDb(postAnalysers[band]);
      const peaks = this._updatePeakHold(band, preDb, postDb);
      const compressor = compressors[band];
      result[band] = {
        gr: compressor ? Math.abs(compressor.reduction || 0) : 0,
        preDbfs: preDb,
        postDbfs: postDb,
        prePeakDbfs: peaks.prePeak,
        postPeakDbfs: peaks.postPeak
      };
    });

    return result;
  }

  getLatencyMs() {
    if (!this.audioContext) {
      return 0;
    }
    return ((this.audioContext.baseLatency || 0) + (this.audioContext.outputLatency || 0)) * 1000;
  }

  _readAnalyserMagnitude(analyser, target, index) {
    const buffer = new Uint8Array(128);
    analyser.getByteFrequencyData(buffer);
    let sum = 0;
    for (let j = 0; j < 64; j++) {
      sum += buffer[j];
    }
    target[index] = sum / 64 / 255;
  }

  readChannelMagnitudes() {
    for (let i = 0; i < this.channelAnalysers.length; i++) {
      this._readAnalyserMagnitude(this.channelAnalysers[i], this.channelMagnitudes, i);
    }
    return this.channelMagnitudes;
  }

  readRawChannelMagnitudes() {
    if (!this.rawChannelAnalysers.length) {
      return this.rawChannelMagnitudes;
    }
    for (let i = 0; i < this.rawChannelAnalysers.length; i++) {
      this._readAnalyserMagnitude(this.rawChannelAnalysers[i], this.rawChannelMagnitudes, i);
    }
    return this.rawChannelMagnitudes;
  }

  readBandEnergyLevels() {
    return this._readBandEnergyTriplet(
      this.lowPostAnalyser,
      this.midPostAnalyser,
      this.highPostAnalyser
    );
  }

  readRawBandEnergyLevels() {
    return this._readBandEnergyTriplet(
      this.lowPreAnalyser,
      this.midPreAnalyser,
      this.highPreAnalyser
    );
  }

  _readBandEnergyTriplet(lowAnalyser, midAnalyser, highAnalyser) {
    if (!lowAnalyser || !midAnalyser || !highAnalyser) {
      return { low: 0, mid: 0, high: 0 };
    }

    const toLevel = (analyser) => {
      const db = this._readAnalyserRmsDb(analyser);
      return Math.max(0, Math.min(1, (db + 54) / 54));
    };

    return {
      low: toLevel(lowAnalyser),
      mid: toLevel(midAnalyser),
      high: toLevel(highAnalyser)
    };
  }

  readFullSpectrum() {
    if (!this.fullAnalyser) {
      return null;
    }
    const data = new Uint8Array(this.fullAnalyser.frequencyBinCount);
    this.fullAnalyser.getByteFrequencyData(data);
    return data;
  }

  estimateF0(magnitudes) {
    let maxIndex = 0;
    let maxValue = 0;
    const searchLimit = Math.min(8, magnitudes.length);
    for (let i = 0; i < searchLimit; i++) {
      if (magnitudes[i] > maxValue) {
        maxValue = magnitudes[i];
        maxIndex = i;
      }
    }
    const centerHz = this.mapProfile.electrodes[maxIndex]?.centerHz || 0;
    return { channel: maxIndex + 1, freq: Math.round(centerHz) };
  }

  getAnalyser() {
    return this.visualAnalyser;
  }

  getAudioContext() {
    return this.audioContext;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getDuration() {
    if (this.inputMode === 'mic') {
      return 0;
    }
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }
}

export function getVisualizationBandEdges(channelCount, minHz, maxHz) {
  const edges = [];
  for (let i = 0; i <= channelCount; i++) {
    const t = i / channelCount;
    edges.push(minHz * Math.pow(maxHz / minHz, t));
  }
  return edges;
}

export function getVisualizationBandCenters(channelCount, minHz, maxHz) {
  const edges = getVisualizationBandEdges(channelCount, minHz, maxHz);
  const centers = [];
  for (let i = 0; i < channelCount; i++) {
    centers.push(Math.sqrt(edges[i] * edges[i + 1]));
  }
  return centers;
}
