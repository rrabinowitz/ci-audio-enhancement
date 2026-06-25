import { CIAudioEngine, getVisualizationBandCenters } from './audioGraph.js?v=23';
import { VocoderDiagnostic } from './vocoderDiagnostic.js?v=23';
import {
  getProfileList,
  getProfileById,
  parseMapProfileJson,
  exportMapProfileJson
} from './mapProfiles.js?v=23';
import { optimizeForCI } from './autoTuner.js?v=23';
import { initHelpUi, openModal } from './help.js?v=23';
import { buildDemoBuffer, getDemoMeta } from './demoTrack.js?v=23';
import { Visualizer, countSaturatedChannels, updateCompVu } from './visualizer.js?v=23';
import { estimateCompressorGr, computePreviewDelta, estimateBandEnergies } from './processingPreview.js?v=23';
import { exportProcessedWav, downloadBlob } from './exportAudio.js?v=23';
import { Playlist } from './playlist.js?v=23';
import { ParamHistory } from './paramHistory.js?v=23';
import { buildPresetDiffHtml } from './presetDiff.js?v=23';
import {
  buildSessionSnapshot,
  parseSessionSnapshot,
  downloadSessionJson
} from './sessionSnapshot.js?v=23';
import {
  getBuiltinPresetList,
  getPresetById,
  loadUserPresets,
  saveUserPresets,
  captureCurrentParams,
  exportPresetJson,
  parsePresetJson
} from './presets.js?v=23';

const CHANNEL_COUNT = 16;
const VIZ_MIN_HZ = 250;
const VIZ_MAX_HZ = 8000;

let currentMapProfile = getProfileById('default-log-16');

const engine = new CIAudioEngine();
const vocoder = new VocoderDiagnostic({
  channelCount: CHANNEL_COUNT,
  envelopeCutoffHz: 50,
  mapProfile: currentMapProfile
});

const audioFileInput = document.getElementById('audioFileInput');
const chooseFileBtn = document.getElementById('chooseFileBtn');
const startAudioBtn = document.getElementById('startAudioBtn');
const loadDemoButtons = document.querySelectorAll('[data-demo-id]');
const micBtn = document.getElementById('micBtn');
const exportWavBtn = document.getElementById('exportWavBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const toStartBtn = document.getElementById('toStartBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const loopCheckbox = document.getElementById('loopCheckbox');
const loopInSlider = document.getElementById('loopInSlider');
const loopOutSlider = document.getElementById('loopOutSlider');
const loopRegionLabel = document.getElementById('loopRegionLabel');
const positionSlider = document.getElementById('positionSlider');
const timeCurrent = document.getElementById('timeCurrent');
const timeDuration = document.getElementById('timeDuration');
const statusLabel = document.getElementById('statusLabel');
const statusPill = document.getElementById('statusPill');
const latencyLabel = document.getElementById('latencyLabel');

const harmonicDriveSlider = document.getElementById('harmonicDrive');
const compThresholdSlider = document.getElementById('compThreshold');
const clarityLiftSlider = document.getElementById('clarityLift');
const transposeMixSlider = document.getElementById('transposeMix');
const masterGainSlider = document.getElementById('masterGain');

const harmonicDriveValue = document.getElementById('harmonicDriveValue');
const compThresholdValue = document.getElementById('compThresholdValue');
const clarityLiftValue = document.getElementById('clarityLiftValue');
const transposeMixValue = document.getElementById('transposeMixValue');
const masterGainValue = document.getElementById('masterGainValue');

const compVuLow = document.getElementById('compVuLow');
const compVuMid = document.getElementById('compVuMid');
const compVuHigh = document.getElementById('compVuHigh');
const compVuLowLabel = document.getElementById('compVuLowLabel');
const compVuMidLabel = document.getElementById('compVuMidLabel');
const compVuHighLabel = document.getElementById('compVuHighLabel');

const f0Estimate = document.getElementById('f0Estimate');
const peakChannel = document.getElementById('peakChannel');
const satChannels = document.getElementById('satChannels');
const harmonicStatus = document.getElementById('harmonicStatus');

const vocoderEnableCheckbox = document.getElementById('vocoderEnable');
const vocoderDryWetSlider = document.getElementById('vocoderDryWet');
const vocoderDryWetValue = document.getElementById('vocoderDryWetValue');
const diagnosticControls = document.getElementById('diagnosticControls');
const enhancementBypassCheckbox = document.getElementById('enhancementBypass');
const abLoudnessMatchCheckbox = document.getElementById('abLoudnessMatch');

const optimizeBtn = document.getElementById('optimizeBtn');
const optimizeProgress = document.getElementById('optimizeProgress');
const mapProfileSelect = document.getElementById('mapProfileSelect');
const mapDescription = document.getElementById('mapDescription');
const electrodeGrid = document.getElementById('electrodeGrid');
const importMapBtn = document.getElementById('importMapBtn');
const exportMapBtn = document.getElementById('exportMapBtn');
const mapFileInput = document.getElementById('mapFileInput');

const metricComposite = document.getElementById('metricComposite');
const metricModulation = document.getElementById('metricModulation');
const metricUsable = document.getElementById('metricUsable');
const metricContrast = document.getElementById('metricContrast');
const metricBass = document.getElementById('metricBass');
const metricSpeech = document.getElementById('metricSpeech');
const deltaComposite = document.getElementById('deltaComposite');
const deltaModulation = document.getElementById('deltaModulation');
const deltaUsable = document.getElementById('deltaUsable');
const deltaContrast = document.getElementById('deltaContrast');
const deltaBass = document.getElementById('deltaBass');
const deltaSpeech = document.getElementById('deltaSpeech');

const spectrumCanvas = document.getElementById('spectrumCanvas');
const vizLabelsContainer = document.getElementById('vizLabels');
const vizSmoothingSlider = document.getElementById('vizSmoothing');
const vizSmoothingValue = document.getElementById('vizSmoothingValue');
const meterStabilitySlider = document.getElementById('meterStability');
const meterStabilityValue = document.getElementById('meterStabilityValue');
const meterResetBtn = document.getElementById('meterResetBtn');

const presetSelect = document.getElementById('presetSelect');
const savePresetBtn = document.getElementById('savePresetBtn');
const comparePresetsBtn = document.getElementById('comparePresetsBtn');
const undoParamsBtn = document.getElementById('undoParamsBtn');
const redoParamsBtn = document.getElementById('redoParamsBtn');
const exportPresetBtn = document.getElementById('exportPresetBtn');
const importPresetBtn = document.getElementById('importPresetBtn');
const presetFileInput = document.getElementById('presetFileInput');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const playlistList = document.getElementById('playlistList');
const queueFilesBtn = document.getElementById('queueFilesBtn');
const clearQueueBtn = document.getElementById('clearQueueBtn');
const queueFileInput = document.getElementById('queueFileInput');
const exportVocoderCheckbox = document.getElementById('exportVocoderCheckbox');
const speechModeBtn = document.getElementById('speechModeBtn');
const musicModeBtn = document.getElementById('musicModeBtn');
const stereoWidthSlider = document.getElementById('stereoWidth');
const stereoWidthValue = document.getElementById('stereoWidthValue');
const exportSessionBtn = document.getElementById('exportSessionBtn');
const importSessionBtn = document.getElementById('importSessionBtn');
const sessionFileInput = document.getElementById('sessionFileInput');

const THEME_STORAGE_KEY = 'ci-enhancement-theme';
const VIZ_SETTINGS_STORAGE_KEY = 'ci-enhancement-viz-settings';
const CONTENT_MODE_STORAGE_KEY = 'ci-enhancement-content-mode';
const PANEL_STATE_STORAGE_KEY = 'ci-enhancement-panel-state';
const ADVANCED_PANELS_INIT_KEY = 'ci-enhancement-advanced-panels-init';

const playlist = new Playlist();
const paramHistory = new ParamHistory();
let advancingQueue = false;
let contentMode = 'custom';

const bandCenters = getVisualizationBandCenters(CHANNEL_COUNT, VIZ_MIN_HZ, VIZ_MAX_HZ);

let visualizer = null;
let animationFrameId = null;
let loadedFileName = '';
let isScrubbing = false;
let customProfiles = {};
let userPresets = loadUserPresets();
let activePresetId = 'default';
let audioReady = false;

// Single source of truth for the Start Audio Engine button visibility: the
// button is hidden only while the AudioContext is actually "running". If Safari
// later interrupts the session, the statechange listener re-shows it.
function syncAudioUnlockUi() {
  const running = engine.isContextRunning?.();
  document.body.classList.toggle('audio-unlocked', Boolean(running));
}

function markAudioUnlockedIfRunning() {
  syncAudioUnlockUi();
}

// Build the audio node graph and apply one-time configuration. This does NOT
// require a running AudioContext, so it is safe to call at startup (before any
// user gesture). Resuming the context — which browsers only allow inside a
// gesture — is handled separately by ensureAudioReady().
async function setupEngineGraph() {
  if (audioReady) {
    return;
  }
  await engine.init();
  await engine.setVocoder(vocoder);
  engine.setTransposeMix(Number(transposeMixSlider.value));
  engine.setMasterGain(Number(masterGainSlider.value));
  engine.setAnalyserSmoothing(Number(vizSmoothingSlider.value));
  engine.setEnhancementBypassed(enhancementBypassCheckbox.checked);
  engine.setVocoderEnabled(vocoderEnableCheckbox.checked);
  engine.setVocoderDryWet(Number(vocoderDryWetSlider.value));
  engine.setStereoWidth(Number(stereoWidthSlider.value));
  if (typeof engine.setAbLoudnessMatchEnabled === 'function') {
    engine.setAbLoudnessMatchEnabled(abLoudnessMatchCheckbox?.checked ?? true);
  }
  applyCurrentMapProfile();
  updateLatencyDisplay();
  audioReady = true;
}

// Gesture-time path: must be called from inside a click/tap handler. Resume the
// AudioContext synchronously, before any await, while user activation is still
// active. If we resume after an await the browser can leave resume() pending
// until the next click — the "press the button twice before it works" bug.
async function ensureAudioReady() {
  engine.ensureContextForGesture();
  await setupEngineGraph();
  await engine.ensureContextRunning();
  markAudioUnlockedIfRunning();
}

function applyPreset(preset) {
  if (!preset) {
    return;
  }
  paramHistory.clear();
  updateUndoRedoButtons();
  harmonicDriveSlider.value = preset.harmonicDrive;
  compThresholdSlider.value = preset.compThreshold;
  clarityLiftSlider.value = preset.clarityLift;
  if (preset.transposeMix !== undefined) {
    transposeMixSlider.value = preset.transposeMix;
  }
  updateSliderDisplays();
  engine.applyEnhancementParams(preset);
  activePresetId = preset.id;
  if (preset.id === 'speech' || preset.id === 'music') {
    contentMode = preset.id;
    localStorage.setItem(CONTENT_MODE_STORAGE_KEY, preset.id);
  } else if (!preset.builtin) {
    contentMode = 'custom';
  }
  updateContentModeButtons();
  playlist.setPresetForCurrent(preset.id);
  if (presetSelect.value !== preset.id) {
    presetSelect.value = preset.id;
  }
}

function buildPresetSelect() {
  presetSelect.innerHTML = '';
  getBuiltinPresetList().forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name;
    presetSelect.appendChild(option);
  });
  Object.values(userPresets).forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = `${preset.name} (saved)`;
    presetSelect.appendChild(option);
  });
  presetSelect.value = activePresetId;
}

function loadVizSettings() {
  try {
    const raw = localStorage.getItem(VIZ_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveVizSettings() {
  localStorage.setItem(VIZ_SETTINGS_STORAGE_KEY, JSON.stringify({
    channelSmoothing: Number(vizSmoothingSlider.value),
    meterStability: Number(meterStabilitySlider.value)
  }));
}

function updateMeterControlLabels() {
  meterStabilityValue.textContent = Number(meterStabilitySlider.value).toFixed(2);
}

function applyMeterSettingsToVisualizer() {
  if (!visualizer) {
    return;
  }

  visualizer.setMeterSettings({
    stability: Number(meterStabilitySlider.value)
  });
}

function initVizSettings() {
  const saved = loadVizSettings();
  if (saved.channelSmoothing !== undefined) {
    vizSmoothingSlider.value = saved.channelSmoothing;
  }
  if (saved.meterStability !== undefined) {
    meterStabilitySlider.value = saved.meterStability;
  } else if (saved.traceSmoothing !== undefined) {
    meterStabilitySlider.value = saved.traceSmoothing;
  }
  updateMeterControlLabels();
}

function initTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  document.documentElement.dataset.theme = saved === 'light' ? 'light' : 'dark';
  themeToggleBtn.textContent = saved === 'light' ? '🌙' : '☀';
}

function toggleTheme() {
  const isLight = document.documentElement.dataset.theme === 'light';
  const next = isLight ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_STORAGE_KEY, next);
  themeToggleBtn.textContent = next === 'light' ? '🌙' : '☀';
}

function getCurrentEnhancementParams() {
  return {
    harmonicDrive: Number(harmonicDriveSlider.value),
    compThreshold: Number(compThresholdSlider.value),
    clarityLift: Number(clarityLiftSlider.value),
    transposeMix: Number(transposeMixSlider.value),
    bypassed: enhancementBypassCheckbox.checked,
    stereoWidth: Number(stereoWidthSlider.value)
  };
}

function captureParamSnapshot() {
  return {
    harmonicDrive: Number(harmonicDriveSlider.value),
    compThreshold: Number(compThresholdSlider.value),
    clarityLift: Number(clarityLiftSlider.value),
    transposeMix: Number(transposeMixSlider.value),
    stereoWidth: Number(stereoWidthSlider.value),
    bypassed: enhancementBypassCheckbox.checked
  };
}

function applyParamSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }
  applyParamsToUi({
    harmonicDrive: snapshot.harmonicDrive,
    compThreshold: snapshot.compThreshold,
    clarityLift: snapshot.clarityLift,
    transposeMix: snapshot.transposeMix,
    stereoWidth: snapshot.stereoWidth
  });
  enhancementBypassCheckbox.checked = Boolean(snapshot.bypassed);
  engine.setEnhancementBypassed(enhancementBypassCheckbox.checked);
  markCustomPreset();
  visualizer?.resetMeterProfiles();
}

function updateUndoRedoButtons() {
  if (undoParamsBtn) {
    undoParamsBtn.disabled = !paramHistory.canUndo();
  }
  if (redoParamsBtn) {
    redoParamsBtn.disabled = !paramHistory.canRedo();
  }
}

function recordParamHistory() {
  paramHistory.push(captureParamSnapshot());
  updateUndoRedoButtons();
}

function getOptimizeRegionRange() {
  const duration = engine.getDuration();
  if (!duration || engine.isMicrophoneActive()) {
    return null;
  }
  const inVal = Number(loopInSlider?.value || 0);
  const outVal = Number(loopOutSlider?.value || 1000);
  if (inVal === 0 && outVal === 1000) {
    return null;
  }
  const startSec = (Math.min(inVal, outVal) / 1000) * duration;
  const endSec = (Math.max(inVal, outVal) / 1000) * duration;
  return { startSec, endSec };
}

function updateLoopRegionLabel() {
  if (!loopRegionLabel) {
    return;
  }
  const duration = engine.getDuration();
  if (!duration || engine.isMicrophoneActive()) {
    loopRegionLabel.textContent = 'Load audio to set optimize region';
    return;
  }
  const range = getOptimizeRegionRange();
  if (!range) {
    loopRegionLabel.textContent = 'Full track — uses center 12 s';
    return;
  }
  const len = range.endSec - range.startSec;
  if (len < 4) {
    loopRegionLabel.textContent = `Too short (${len.toFixed(1)} s) — need at least 4 s`;
    return;
  }
  loopRegionLabel.textContent = `${formatTime(range.startSec)} – ${formatTime(range.endSec)} (${len.toFixed(1)} s analyzed, max 12 s)`;
}

function openPresetCompareModal() {
  const presets = [...getBuiltinPresetList(), ...Object.values(userPresets)];
  const options = presets
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join('');
  const body = `
    <p>Compare enhancement slider values between music, genre, saved, or reference presets before fine-tuning.</p>
    <div class="preset-diff-controls" style="display:flex;flex-wrap:wrap;gap:0.75rem;margin:0.75rem 0">
      <label>Preset A <select id="diffPresetA">${options}</select></label>
      <label>Preset B <select id="diffPresetB">${options}</select></label>
    </div>
    <button type="button" class="btn" id="runPresetDiffBtn">Update comparison</button>
    <div id="presetDiffResult"></div>
  `;
  openModal('Compare presets', body);
  const selectA = document.getElementById('diffPresetA');
  const selectB = document.getElementById('diffPresetB');
  if (selectA) {
    selectA.value = 'speech';
  }
  if (selectB) {
    selectB.value = 'music';
  }
  const renderDiff = () => {
    const presetA = getPresetById(selectA.value, userPresets);
    const presetB = getPresetById(selectB.value, userPresets);
    const target = document.getElementById('presetDiffResult');
    if (presetA && presetB && target) {
      target.innerHTML = buildPresetDiffHtml(presetA, presetB);
    }
  };
  document.getElementById('runPresetDiffBtn')?.addEventListener('click', renderDiff);
  selectA?.addEventListener('change', renderDiff);
  selectB?.addEventListener('change', renderDiff);
  renderDiff();
}

function formatFrequencyLabel(hz) {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(1)}k`;
  }
  return `${Math.round(hz)}`;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatDbfs(value) {
  if (value === null || value === undefined || Number.isNaN(value) || value <= -119) {
    return '—';
  }
  return `${value.toFixed(1)} dBFS`;
}

function formatMeterLabel(meter, estimated = false) {
  if (!meter) {
    return '';
  }
  if (estimated) {
    return 'estimated';
  }
  return `pre ${formatDbfs(meter.preDbfs)} · post ${formatDbfs(meter.postDbfs)} · pk ${formatDbfs(meter.postPeakDbfs)}`;
}

function markCustomPreset() {
  activePresetId = '__custom__';
  let customOption = presetSelect.querySelector('option[value="__custom__"]');
  if (!customOption) {
    customOption = document.createElement('option');
    customOption.value = '__custom__';
    customOption.textContent = 'Custom (current)';
    presetSelect.appendChild(customOption);
  }
  presetSelect.value = '__custom__';
  contentMode = 'custom';
  updateContentModeButtons();
  playlist.setPresetForCurrent(activePresetId);
}

function updateInputModeUi() {
  const micActive = engine.isMicrophoneActive();
  const hasFile = Boolean(engine.getAudioBuffer());

  micBtn.textContent = micActive ? 'Stop Microphone' : 'Use Microphone';
  micBtn.classList.toggle('active', micActive);
  exportWavBtn.disabled = !hasFile || micActive;
  optimizeBtn.disabled = !hasFile || micActive;
  positionSlider.disabled = micActive || !hasFile;
  rewindBtn.disabled = micActive || !hasFile;
  forwardBtn.disabled = micActive || !hasFile;
  toStartBtn.disabled = micActive || !hasFile;
  loopCheckbox.disabled = micActive;
  playPauseBtn.disabled = !hasFile && !micActive;
  stopBtn.disabled = !hasFile && !micActive;
  chooseFileBtn.disabled = micActive;
  loadDemoButtons.forEach((btn) => {
    btn.disabled = micActive;
  });
  if (queueFilesBtn) {
    queueFilesBtn.disabled = micActive;
  }
}

function setTransportEnabled(enabled) {
  playPauseBtn.disabled = !enabled;
  stopBtn.disabled = !enabled;
  toStartBtn.disabled = !enabled;
  rewindBtn.disabled = !enabled;
  forwardBtn.disabled = !enabled;
  positionSlider.disabled = !enabled;
  optimizeBtn.disabled = !enabled;
  exportWavBtn.disabled = !enabled;
  if (loopInSlider) {
    loopInSlider.disabled = !enabled;
  }
  if (loopOutSlider) {
    loopOutSlider.disabled = !enabled;
  }
  updateInputModeUi();
  updateLoopRegionLabel();
}

function updateTransportDisplay(state = engine.getPlaybackState()) {
  const micActive = engine.isMicrophoneActive();
  const duration = micActive ? 0 : state.duration || 0;
  const current = micActive ? 0 : state.currentTime || 0;

  timeCurrent.textContent = micActive ? 'LIVE' : formatTime(current);
  timeDuration.textContent = micActive ? 'MIC' : formatTime(duration);

  if (!isScrubbing && duration > 0) {
    positionSlider.value = String(Math.round((current / duration) * 1000));
  } else if (!isScrubbing) {
    positionSlider.value = '0';
  }

  loopCheckbox.checked = state.loopEnabled;
  playPauseBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
  updateInputModeUi();
}

function handlePlaybackState(state) {
  updateTransportDisplay(state);
  updateStatusPill();

  if (state.endedNaturally && !state.loopEnabled && playlist.length > 1) {
    playNextInQueue();
    return;
  }

  if (!state.isPlaying && loadedFileName) {
    if (!state.loopEnabled && state.duration > 0 && state.currentTime >= state.duration - 0.05) {
      setStatus(`Finished: ${loadedFileName}`);
    } else if (state.currentTime > 0 && state.currentTime < state.duration) {
      setStatus(`Paused: ${loadedFileName}`);
    }
  }
}

function buildVizLabels() {
  vizLabelsContainer.innerHTML = '';
  bandCenters.forEach((center) => {
    const label = document.createElement('span');
    label.textContent = formatFrequencyLabel(center);
    vizLabelsContainer.appendChild(label);
  });
}

function setStatus(message, className = '') {
  statusLabel.textContent = message;
  statusLabel.className = `status ${className}`.trim();
}

function updateStatusPill() {
  const vocoderOn = vocoderEnableCheckbox.checked;
  const vocoderWet = Number(vocoderDryWetSlider.value);
  const playing = engine.getIsPlaying();
  const micActive = engine.isMicrophoneActive();

  statusPill.className = 'status-pill';
  if (micActive && playing) {
    statusPill.textContent = 'MIC LIVE';
    statusPill.classList.add('playing');
  } else if (micActive) {
    statusPill.textContent = 'MIC PAUSED';
    statusPill.classList.add('playing');
  } else if (vocoderOn && vocoderWet > 0 && playing) {
    statusPill.textContent = 'VOCODER';
    statusPill.classList.add('vocoder');
  } else if (playing) {
    statusPill.textContent = 'PLAYING';
    statusPill.classList.add('playing');
  } else {
    statusPill.textContent = 'IDLE';
  }
}

function updateLatencyDisplay() {
  const ms = engine.getLatencyMs();
  latencyLabel.textContent = ms > 0 ? `Latency: ${ms.toFixed(1)} ms` : 'Latency: —';
}

function formatMetricValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return value.toFixed(3);
}

function formatDelta(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  const rounded = value.toFixed(1);
  const sign = value > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

function setDeltaElement(element, value) {
  element.textContent = formatDelta(value);
  element.className = 'delta';
  if (value > 1) {
    element.classList.add('positive');
  } else if (value < -1) {
    element.classList.add('negative');
  } else {
    element.classList.add('neutral');
  }
}

function updateMetricsDisplay(result, phase = 'final') {
  if (!result) {
    return;
  }

  const metrics = phase === 'baseline' ? result.baselineMetrics : result.optimizedMetrics;
  if (!metrics) {
    return;
  }

  metricComposite.textContent = formatMetricValue(metrics.composite);
  metricModulation.textContent = formatMetricValue(metrics.modulation);
  metricUsable.textContent = formatMetricValue(metrics.usableEnergy);
  metricContrast.textContent = formatMetricValue(metrics.contrast);
  metricBass.textContent = formatMetricValue(metrics.bassRhythm);
  metricSpeech.textContent = formatMetricValue(metrics.speechBand);

  if (result.deltas) {
    setDeltaElement(deltaComposite, result.deltas.composite);
    setDeltaElement(deltaModulation, result.deltas.modulation);
    setDeltaElement(deltaUsable, result.deltas.usableEnergy);
    setDeltaElement(deltaContrast, result.deltas.contrast);
    setDeltaElement(deltaBass, result.deltas.bassRhythm);
    setDeltaElement(deltaSpeech, result.deltas.speechBand);
  }
}

function showOptimizeRunning(progress) {
  metricComposite.textContent = progress.bestScore.toFixed(3);
  metricModulation.textContent = '…';
  metricUsable.textContent = '…';
  metricContrast.textContent = '…';
  metricBass.textContent = '…';
  metricSpeech.textContent = '…';
  deltaComposite.textContent = `baseline ${progress.baselineScore.toFixed(3)}`;
  deltaComposite.className = 'delta neutral';
  deltaModulation.textContent = `${progress.current}/${progress.total}`;
  deltaModulation.className = 'delta neutral';
}

function updateContentModeButtons() {
  speechModeBtn?.classList.toggle('active', contentMode === 'speech');
  musicModeBtn?.classList.toggle('active', contentMode === 'music');
}

function applyContentMode(mode) {
  const preset = getPresetById(mode, userPresets);
  if (!preset) {
    return;
  }
  applyPreset(preset);
  contentMode = mode;
  localStorage.setItem(CONTENT_MODE_STORAGE_KEY, mode);
  updateContentModeButtons();
}

function initContentMode() {
  const saved = localStorage.getItem(CONTENT_MODE_STORAGE_KEY);
  if (saved === 'speech' || saved === 'music') {
    applyContentMode(saved);
  } else {
    updateContentModeButtons();
  }
}

async function loadPlaylistItem(item, autoplay = false) {
  if (!item?.audioBuffer) {
    setStatus(`Unavailable: ${item?.name || 'track'} — re-add the file`, 'error');
    return false;
  }

  // Loading a buffer for display/scrubbing only needs the graph built, not a
  // running context. Resuming (which requires a user gesture) is deferred to
  // autoplay below or to the Play button, so this stays safe at startup on
  // Safari where there is no gesture yet.
  await setupEngineGraph();
  const loopDefault = item.source === 'demo';
  await engine.loadAudioBuffer(item.audioBuffer, {
    loopEnabled: loopCheckbox.checked || loopDefault
  });
  loadedFileName = item.name;
  playlist.selectById(item.id);
  setTransportEnabled(true);
  visualizer?.resetMeterProfiles();

  if (item.presetId) {
    const preset = getPresetById(item.presetId, userPresets);
    if (preset) {
      applyPreset(preset);
    }
  }

  updateTransportDisplay();
  updateStatusPill();
  updateInputModeUi();
  renderPlaylist();

  if (autoplay) {
    await engine.ensureContextRunning();
    markAudioUnlockedIfRunning();
    await engine.play();
    setStatus(`Playing: ${loadedFileName}`, 'playing');
    updateStatusPill();
  } else {
    setStatus(`Loaded: ${loadedFileName}`);
  }

  return true;
}

async function playNextInQueue() {
  if (advancingQueue) {
    return;
  }

  const nextItem = playlist.next();
  if (!nextItem) {
    setStatus('Playlist finished');
    return;
  }

  advancingQueue = true;
  try {
    await loadPlaylistItem(nextItem, true);
  } finally {
    advancingQueue = false;
  }
}

function renderPlaylist() {
  if (!playlistList) {
    return;
  }

  const state = playlist.getState();
  playlistList.innerHTML = '';

  if (state.items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'playlist-empty';
    empty.textContent = 'Load a file or built-in demo to start a playlist.';
    playlistList.appendChild(empty);
    if (clearQueueBtn) {
      clearQueueBtn.disabled = true;
    }
    if (queueFilesBtn) {
      queueFilesBtn.disabled = engine.isMicrophoneActive();
    }
    return;
  }

  if (clearQueueBtn) {
    clearQueueBtn.disabled = false;
  }
  if (queueFilesBtn) {
    queueFilesBtn.disabled = engine.isMicrophoneActive();
  }

  state.items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    if (index === state.currentIndex) {
      li.classList.add('active');
    }
    if (!item.ready) {
      li.classList.add('unavailable');
    }

    const indexSpan = document.createElement('span');
    indexSpan.className = 'playlist-item-index';
    indexSpan.textContent = `${index + 1}.`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'playlist-item-name';
    nameSpan.textContent = item.name;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'playlist-item-remove';
    removeBtn.title = 'Remove from queue';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const removed = playlist.remove(item.id);
      if (removed && removed.name === loadedFileName) {
        const current = playlist.getCurrentItem();
        if (current) {
          await loadPlaylistItem(current);
        } else {
          loadedFileName = '';
          engine.stop();
          setTransportEnabled(false);
          setStatus('Playlist cleared');
        }
      } else {
        renderPlaylist();
      }
    });

    li.appendChild(indexSpan);
    li.appendChild(nameSpan);
    li.appendChild(removeBtn);

    li.addEventListener('click', async () => {
      const selected = playlist.select(index);
      if (selected) {
        await loadPlaylistItem(selected);
      }
    });

    playlistList.appendChild(li);
  });
}

function initCollapsiblePanels() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(PANEL_STATE_STORAGE_KEY) || '{}');
  } catch (error) {
    saved = {};
  }

  if (!localStorage.getItem(ADVANCED_PANELS_INIT_KEY)) {
    saved['auto-tune'] = false;
    saved['diagnostic-vocoder'] = false;
    saved['electrode-map'] = false;
    localStorage.setItem(ADVANCED_PANELS_INIT_KEY, '1');
  }

  document.querySelectorAll('section.panel').forEach((panel, index) => {
    if (panel.querySelector('.collapse-btn')) {
      return;
    }

    const id = panel.dataset.panelId || `panel-${index}`;
    panel.dataset.panelId = id;
    const heading = panel.querySelector('.panel-heading');
    if (!heading) {
      return;
    }

    const collapseBtn = document.createElement('button');
    collapseBtn.type = 'button';
    collapseBtn.className = 'collapse-btn';
    collapseBtn.textContent = '▾';
    collapseBtn.setAttribute('aria-expanded', saved[id] !== false ? 'true' : 'false');
    collapseBtn.title = 'Collapse section';

    let actions = heading.querySelector('.panel-heading-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'panel-heading-actions';
      const infoBtn = heading.querySelector('.info-btn');
      if (infoBtn) {
        actions.appendChild(infoBtn);
      }
      heading.appendChild(actions);
    }
    actions.appendChild(collapseBtn);

    const bodyNodes = [...panel.children].filter((child) => child !== heading);
    const body = document.createElement('div');
    body.className = 'panel-body';
    bodyNodes.forEach((node) => body.appendChild(node));
    panel.appendChild(body);

    if (saved[id] === false) {
      panel.classList.add('is-collapsed');
    }

    collapseBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      panel.classList.toggle('is-collapsed');
      const collapsed = panel.classList.contains('is-collapsed');
      collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      saved[id] = !collapsed;
      localStorage.setItem(PANEL_STATE_STORAGE_KEY, JSON.stringify(saved));
    });
  });
}

function buildSessionState() {
  return buildSessionSnapshot({
    mapProfile: currentMapProfile,
    enhancement: getCurrentEnhancementParams(),
    masterGainDb: Number(masterGainSlider.value),
    presetId: activePresetId,
    contentMode,
    vocoder: {
      enabled: vocoderEnableCheckbox.checked,
      dryWet: Number(vocoderDryWetSlider.value)
    },
    stereoWidth: Number(stereoWidthSlider.value),
    vizSettings: {
      channelSmoothing: Number(vizSmoothingSlider.value),
      meterStability: Number(meterStabilitySlider.value)
    },
    loopEnabled: loopCheckbox.checked
  });
}

async function applySessionSnapshot(snapshot) {
  if (snapshot.mapProfile) {
    try {
      currentMapProfile = snapshot.mapProfile;
      applyCurrentMapProfile();
    } catch (error) {
      console.warn('Could not apply map from session snapshot', error);
    }
  }

  if (snapshot.enhancement) {
    applyParamsToUi(snapshot.enhancement);
    enhancementBypassCheckbox.checked = Boolean(snapshot.enhancement.bypassed);
    engine.setEnhancementBypassed(enhancementBypassCheckbox.checked);
  }

  if (snapshot.masterGainDb !== undefined) {
    masterGainSlider.value = snapshot.masterGainDb;
    engine.setMasterGain(snapshot.masterGainDb);
  }

  if (snapshot.stereoWidth !== undefined) {
    stereoWidthSlider.value = snapshot.stereoWidth;
    engine.setStereoWidth(snapshot.stereoWidth);
  }

  if (snapshot.vocoder) {
    vocoderEnableCheckbox.checked = Boolean(snapshot.vocoder.enabled);
    vocoderDryWetSlider.value = snapshot.vocoder.dryWet ?? 0;
    diagnosticControls.classList.toggle('active', vocoderEnableCheckbox.checked);
    engine.setVocoderEnabled(vocoderEnableCheckbox.checked);
    engine.setVocoderDryWet(Number(vocoderDryWetSlider.value));
  }

  if (snapshot.vizSettings) {
    if (snapshot.vizSettings.channelSmoothing !== undefined) {
      vizSmoothingSlider.value = snapshot.vizSettings.channelSmoothing;
      engine.setAnalyserSmoothing(Number(vizSmoothingSlider.value));
    }
    if (snapshot.vizSettings.meterStability !== undefined) {
      meterStabilitySlider.value = snapshot.vizSettings.meterStability;
      applyMeterSettingsToVisualizer();
    }
    saveVizSettings();
  }

  if (snapshot.loopEnabled !== undefined) {
    loopCheckbox.checked = snapshot.loopEnabled;
    engine.setLoopEnabled(snapshot.loopEnabled);
  }

  if (snapshot.contentMode === 'speech' || snapshot.contentMode === 'music') {
    applyContentMode(snapshot.contentMode);
  } else if (snapshot.presetId) {
    const preset = getPresetById(snapshot.presetId, userPresets);
    if (preset) {
      applyPreset(preset);
    }
  }

  updateSliderDisplays();
  updateContentModeButtons();
  visualizer?.resetMeterProfiles();
  paramHistory.clear();
  updateUndoRedoButtons();
}

function applyParamsToUi(params) {
  harmonicDriveSlider.value = params.harmonicDrive;
  compThresholdSlider.value = params.compThreshold;
  clarityLiftSlider.value = params.clarityLift;
  if (params.transposeMix !== undefined) {
    transposeMixSlider.value = params.transposeMix;
  }
  if (params.stereoWidth !== undefined) {
    stereoWidthSlider.value = params.stereoWidth;
    engine.setStereoWidth(params.stereoWidth);
  }
  updateSliderDisplays();
  engine.applyEnhancementParams(params);
  markCustomPreset();
}

function buildMapProfileSelect() {
  mapProfileSelect.innerHTML = '';
  getProfileList().forEach((profile) => {
    const option = document.createElement('option');
    option.value = profile.id;
    option.textContent = profile.name;
    mapProfileSelect.appendChild(option);
  });
  Object.values(customProfiles).forEach((profile) => {
    const option = document.createElement('option');
    option.value = profile.id;
    option.textContent = `${profile.name} (custom)`;
    mapProfileSelect.appendChild(option);
  });
  mapProfileSelect.value = currentMapProfile.id;
}

function buildElectrodeGrid() {
  electrodeGrid.innerHTML = '';
  currentMapProfile.electrodes.forEach((electrode, index) => {
    const card = document.createElement('div');
    card.className = `electrode-card ${electrode.status}`;
    card.innerHTML = `
      <header>
        <strong>E${electrode.index}</strong>
        <span>${formatFrequencyLabel(electrode.centerHz)}</span>
      </header>
      <label>Status
        <select data-index="${index}" class="electrode-status">
          <option value="active" ${electrode.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="weak" ${electrode.status === 'weak' ? 'selected' : ''}>Weak</option>
          <option value="dead" ${electrode.status === 'dead' ? 'selected' : ''}>Dead</option>
        </select>
      </label>
      <label>Weight ${electrode.weight.toFixed(2)}
        <input type="range" class="electrode-weight" data-index="${index}" min="0" max="2" step="0.05" value="${electrode.weight}">
      </label>
    `;
    electrodeGrid.appendChild(card);
  });

  electrodeGrid.querySelectorAll('.electrode-status').forEach((select) => {
    select.addEventListener('change', (event) => {
      const idx = Number(event.target.dataset.index);
      currentMapProfile.electrodes[idx].status = event.target.value;
      applyCurrentMapProfile();
      buildElectrodeGrid();
    });
  });

  electrodeGrid.querySelectorAll('.electrode-weight').forEach((slider) => {
    slider.addEventListener('input', (event) => {
      const idx = Number(event.target.dataset.index);
      currentMapProfile.electrodes[idx].weight = Number(event.target.value);
      applyCurrentMapProfile();
    });
  });
}

function applyCurrentMapProfile() {
  mapDescription.textContent = `${currentMapProfile.description} Source: ${currentMapProfile.source}`;
  engine.setMapProfile(currentMapProfile);
}

function loadMapProfileById(profileId) {
  const builtIn = getProfileById(profileId);
  if (builtIn) {
    currentMapProfile = builtIn;
  } else if (customProfiles[profileId]) {
    currentMapProfile = JSON.parse(JSON.stringify(customProfiles[profileId]));
  }
  buildElectrodeGrid();
  applyCurrentMapProfile();
}

function updateSliderDisplays() {
  harmonicDriveValue.textContent = Number(harmonicDriveSlider.value).toFixed(2);
  compThresholdValue.textContent = `${compThresholdSlider.value} dB`;
  clarityLiftValue.textContent = `${Number(clarityLiftSlider.value).toFixed(1)} dB`;
  transposeMixValue.textContent = `${Math.round(Number(transposeMixSlider.value) * 100)}%`;
  masterGainValue.textContent = `${Number(masterGainSlider.value).toFixed(1)} dB`.replace('-', '−');
  vocoderDryWetValue.textContent = `${Math.round(Number(vocoderDryWetSlider.value) * 100)}% simulated`;
  harmonicStatus.textContent = Number(harmonicDriveSlider.value) > 0.05 ? 'ON' : 'OFF';
  if (stereoWidthValue) {
    stereoWidthValue.textContent = `${Math.round(Number(stereoWidthSlider.value) * 100)}%`;
  }
}

function updateFreqInfo(magnitudes, fullSpectrum) {
  const f0 = engine.estimateF0(magnitudes);
  f0Estimate.textContent = f0.freq > 0 ? `${f0.freq} Hz (E${f0.channel})` : '—';

  let peakIdx = 0;
  let peakVal = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    if (magnitudes[i] > peakVal) {
      peakVal = magnitudes[i];
      peakIdx = i;
    }
  }
  peakChannel.textContent = peakVal > 0.02 ? `E${peakIdx + 1}` : '—';
  satChannels.textContent = String(countSaturatedChannels(fullSpectrum));

  if (visualizer) {
    visualizer.setF0Channel(f0.channel - 1);
  }
}

function drawVisualizationLoop() {
  if (!visualizer) {
    animationFrameId = requestAnimationFrame(drawVisualizationLoop);
    return;
  }

  const isPlaying = engine.getIsPlaying();
  const params = getCurrentEnhancementParams();
  const previewData = computePreviewDelta(currentMapProfile, params);
  const magnitudes = isPlaying && audioReady ? engine.readChannelMagnitudes() : new Float32Array(CHANNEL_COUNT);
  const rawMagnitudes = isPlaying && audioReady ? engine.readRawChannelMagnitudes() : previewData.raw;
  const fullSpectrum = isPlaying && audioReady ? engine.readFullSpectrum() : null;
  const previewMagnitudes = previewData.enhanced;
  const previewBandEnergies = estimateBandEnergies(currentMapProfile, params);
  const previewRawBandEnergies = estimateBandEnergies(currentMapProfile, { ...params, bypassed: true });
  const bandEnergies = isPlaying && audioReady ? engine.readBandEnergyLevels() : null;
  const rawBandEnergies = isPlaying && audioReady ? engine.readRawBandEnergyLevels() : previewRawBandEnergies;
  const f0 = engine.estimateF0(isPlaying ? magnitudes : previewMagnitudes);

  visualizer.draw(magnitudes, fullSpectrum, {
    previewMagnitudes,
    rawMagnitudes,
    bandEnergies,
    rawBandEnergies,
    previewBandEnergies,
    previewRawBandEnergies,
    isPlaying,
    peakChannel: f0.channel,
    timestamp: performance.now()
  });
  updateFreqInfo(isPlaying ? magnitudes : previewMagnitudes, fullSpectrum);

  if (!isScrubbing) {
    updateTransportDisplay();
  }

  if (isPlaying && (engine.isMicrophoneActive() || engine.getAudioBuffer())) {
    const metering = engine.getCompressorMetering();
    updateCompVu(compVuLow, metering.low.gr, compVuLowLabel, formatMeterLabel(metering.low));
    updateCompVu(compVuMid, metering.mid.gr, compVuMidLabel, formatMeterLabel(metering.mid));
    updateCompVu(compVuHigh, metering.high.gr, compVuHighLabel, formatMeterLabel(metering.high));
  } else {
    const estimated = estimateCompressorGr(params.compThreshold);
    updateCompVu(compVuLow, estimated.low, compVuLowLabel, formatMeterLabel({ gr: estimated.low }, true));
    updateCompVu(compVuMid, estimated.mid, compVuMidLabel, formatMeterLabel({ gr: estimated.mid }, true));
    updateCompVu(compVuHigh, estimated.high, compVuHighLabel, formatMeterLabel({ gr: estimated.high }, true));
  }

  animationFrameId = requestAnimationFrame(drawVisualizationLoop);
}

async function initializeEngine() {
  engine.setPlaybackListener(handlePlaybackState);
  visualizer = new Visualizer({
    channelCount: CHANNEL_COUNT,
    bandCenters
  });
  applyMeterSettingsToVisualizer();
  buildMapProfileSelect();
  buildElectrodeGrid();
  applyCurrentMapProfile();
  playlist.subscribe(() => renderPlaylist());
  // Re-show / hide the Start Audio Engine button when Safari interrupts or
  // resumes the audio session (phone call, app switch, route change).
  engine.onContextStateChange?.(() => syncAudioUnlockUi());
  // Build the graph at load. Do NOT resume the context here — Safari blocks
  // resume() outside a user gesture and would throw, aborting the rest of
  // startup (visualization loop, status). The context is resumed later from
  // the Start Audio Engine button or the first Play/demo tap.
  await setupEngineGraph();
  playlist.restoreFromSession((demoId) => buildDemoBuffer(engine.getAudioContext(), demoId));
  renderPlaylist();
  const restored = playlist.getCurrentItem();
  if (restored?.audioBuffer) {
    await loadPlaylistItem(restored);
  }
  updateTransportDisplay();
  updateInputModeUi();
  drawVisualizationLoop();
  setStatus('Load a file or built-in demo, then press Play');
}

chooseFileBtn.addEventListener('click', () => {
  audioFileInput.click();
});

audioFileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  try {
    setStatus('Decoding audio…');
    await ensureAudioReady();
    const item = await playlist.setCurrentFromFile(file, engine.getAudioContext());
    loopCheckbox.checked = false;
    engine.setLoopEnabled(false);
    await loadPlaylistItem(item);
  } catch (error) {
    console.error(error);
    setStatus(`Error loading file: ${error.message}`, 'error');
    setTransportEnabled(Boolean(engine.getAudioBuffer()));
  } finally {
    audioFileInput.value = '';
  }
});

async function loadDemoById(demoId) {
  const meta = getDemoMeta(demoId);
  try {
    setStatus(`Generating ${meta.buttonLabel} demo…`);
    await ensureAudioReady();
    const demoBuffer = buildDemoBuffer(engine.getAudioContext(), demoId);
    const item = playlist.setCurrentDemo(demoBuffer, meta.playlistLabel, demoId);
    loopCheckbox.checked = meta.loopDefault;
    engine.setLoopEnabled(meta.loopDefault);
    await loadPlaylistItem(item);
  } catch (error) {
    console.error(error);
    setStatus(`Demo load error: ${error.message}`, 'error');
    setTransportEnabled(Boolean(engine.getAudioBuffer()));
  }
}

loadDemoButtons.forEach((btn) => {
  btn.addEventListener('click', () => loadDemoById(btn.dataset.demoId));
});

micBtn.addEventListener('click', async () => {
  try {
    if (engine.isMicrophoneActive()) {
      engine.stopMicrophone();
      loadedFileName = '';
      setTransportEnabled(false);
      setStatus('Microphone stopped');
      updateStatusPill();
      updateInputModeUi();
      return;
    }

    setStatus('Requesting microphone access…');
    await ensureAudioReady();
    await engine.startMicrophone();
    loadedFileName = 'Live microphone';
    setTransportEnabled(true);
    visualizer?.resetMeterProfiles();
    setStatus('Live microphone — enhancement chain active', 'playing');
    updateTransportDisplay();
    updateStatusPill();
    updateInputModeUi();
  } catch (error) {
    console.error(error);
    setStatus(`Microphone error: ${error.message}`, 'error');
    engine.stopMicrophone();
    loadedFileName = '';
    setTransportEnabled(Boolean(engine.getAudioBuffer()));
    updateStatusPill();
    updateInputModeUi();
  }
});

exportWavBtn.addEventListener('click', async () => {
  const audioBuffer = engine.getAudioBuffer();
  if (!audioBuffer) {
    setStatus('Load audio before exporting.', 'error');
    return;
  }

  exportWavBtn.disabled = true;
  setStatus('Rendering processed WAV…');

  try {
    const params = getCurrentEnhancementParams();
    const includeVocoder = exportVocoderCheckbox?.checked;
    const blob = await exportProcessedWav(
      audioBuffer,
      {
        ...params,
        masterGainDb: Number(masterGainSlider.value)
      },
      currentMapProfile,
      (progress) => {
        setStatus(`Exporting WAV… ${progress.percent}%`);
      },
      { includeVocoder }
    );
    const baseName = loadedFileName.replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '-');
    const suffix = includeVocoder ? '-vocoded' : '-processed';
    downloadBlob(blob, `${baseName || 'ci-enhanced'}${suffix}.wav`);
    setStatus(`Exported: ${baseName || 'ci-enhanced'}${suffix}.wav`);
  } catch (error) {
    console.error(error);
    setStatus(`Export error: ${error.message}`, 'error');
  } finally {
    exportWavBtn.disabled = false;
    updateInputModeUi();
  }
});

startAudioBtn?.addEventListener('click', async () => {
  // Unlock synchronously inside the gesture (Safari/iOS requirement) — silent
  // buffer + resume happen before any await. Do NOT hide the button yet; only
  // hide once the context is confirmed running (handled by syncAudioUnlockUi).
  engine.unlockAudio();
  try {
    await ensureAudioReady();
    if (engine.isContextRunning?.()) {
      setStatus('Audio engine ready — load a demo or file, then press Play');
    } else {
      setStatus('Tap “Start Audio Engine” once more to enable sound.', 'error');
    }
  } catch (error) {
    console.error(error);
    syncAudioUnlockUi();
    setStatus(`Could not start audio: ${error.message}. Tap “Start Audio Engine” again.`, 'error');
  }
});

playPauseBtn.addEventListener('click', async () => {
  try {
    if (engine.getIsPlaying()) {
      engine.pause();
      if (engine.isMicrophoneActive()) {
        setStatus('Microphone paused');
      } else {
        setStatus(`Paused: ${loadedFileName}`);
      }
    } else {
      await ensureAudioReady();
      await engine.play();
      if (engine.isMicrophoneActive()) {
        setStatus('Live microphone — enhancement chain active', 'playing');
      } else {
        setStatus(`Playing: ${loadedFileName}`, 'playing');
      }
    }
    updateStatusPill();
  } catch (error) {
    console.error(error);
    syncAudioUnlockUi();
    setStatus(`Playback error: ${error.message}`, 'error');
  }
});

stopBtn.addEventListener('click', () => {
  if (engine.isMicrophoneActive()) {
    engine.stopMicrophone();
    loadedFileName = '';
    setTransportEnabled(false);
    setStatus('Microphone stopped');
    updateInputModeUi();
  } else {
    engine.stop();
    if (loadedFileName) {
      setStatus(`Stopped: ${loadedFileName}`);
    } else {
      setStatus('No file loaded');
    }
  }
  updateStatusPill();
});

toStartBtn.addEventListener('click', () => {
  engine.seekToStart();
  if (!engine.getIsPlaying() && loadedFileName) {
    setStatus(`At start: ${loadedFileName}`);
  }
});

rewindBtn.addEventListener('click', () => {
  engine.seekRelative(-5);
});

forwardBtn.addEventListener('click', () => {
  engine.seekRelative(5);
});

loopCheckbox.addEventListener('change', () => {
  engine.setLoopEnabled(loopCheckbox.checked);
  if (loadedFileName) {
    setStatus(
      loopCheckbox.checked
        ? `Loop enabled: ${loadedFileName}`
        : `Loop disabled: ${loadedFileName}`
    );
  }
});

positionSlider.addEventListener('pointerdown', () => {
  isScrubbing = true;
});

positionSlider.addEventListener('pointerup', () => {
  isScrubbing = false;
});

positionSlider.addEventListener('pointercancel', () => {
  isScrubbing = false;
});

positionSlider.addEventListener('input', () => {
  const duration = engine.getDuration();
  if (duration <= 0) {
    return;
  }

  const target = (Number(positionSlider.value) / 1000) * duration;
  engine.seek(target);
  timeCurrent.textContent = formatTime(target);
});

harmonicDriveSlider.addEventListener('input', () => {
  updateSliderDisplays();
  engine.setHarmonicDrive(Number(harmonicDriveSlider.value));
});

compThresholdSlider.addEventListener('input', () => {
  updateSliderDisplays();
  engine.setCompThreshold(Number(compThresholdSlider.value));
});

clarityLiftSlider.addEventListener('input', () => {
  updateSliderDisplays();
  engine.setClarityLift(Number(clarityLiftSlider.value));
});

transposeMixSlider.addEventListener('input', () => {
  updateSliderDisplays();
  engine.setTransposeMix(Number(transposeMixSlider.value));
});

stereoWidthSlider.addEventListener('input', () => {
  updateSliderDisplays();
  engine.setStereoWidth(Number(stereoWidthSlider.value));
});

const paramSliders = [
  harmonicDriveSlider,
  compThresholdSlider,
  clarityLiftSlider,
  transposeMixSlider,
  stereoWidthSlider
];
let sliderGestureStart = null;

paramSliders.forEach((slider) => {
  if (!slider) {
    return;
  }
  slider.addEventListener('pointerdown', () => {
    sliderGestureStart = captureParamSnapshot();
  });
  slider.addEventListener('pointerup', () => {
    if (!sliderGestureStart) {
      return;
    }
    const now = captureParamSnapshot();
    if (JSON.stringify(sliderGestureStart) !== JSON.stringify(now)) {
      paramHistory.push(sliderGestureStart);
      updateUndoRedoButtons();
    }
    sliderGestureStart = null;
    markCustomPreset();
  });
});

let bypassGestureStart = null;
enhancementBypassCheckbox?.addEventListener('pointerdown', () => {
  bypassGestureStart = captureParamSnapshot();
});
enhancementBypassCheckbox?.addEventListener('change', () => {
  if (bypassGestureStart) {
    paramHistory.push(bypassGestureStart);
    updateUndoRedoButtons();
  }
  bypassGestureStart = null;
  engine.setEnhancementBypassed(enhancementBypassCheckbox.checked);
  updateSliderDisplays();
  markCustomPreset();
});

abLoudnessMatchCheckbox?.addEventListener('change', () => {
  if (typeof engine.setAbLoudnessMatchEnabled === 'function') {
    engine.setAbLoudnessMatchEnabled(abLoudnessMatchCheckbox.checked);
  }
  if (enhancementBypassCheckbox.checked) {
    engine.setEnhancementBypassed(true);
  }
});

loopInSlider?.addEventListener('input', updateLoopRegionLabel);
loopOutSlider?.addEventListener('input', updateLoopRegionLabel);

comparePresetsBtn?.addEventListener('click', openPresetCompareModal);

undoParamsBtn?.addEventListener('click', () => {
  const restored = paramHistory.undo(captureParamSnapshot());
  if (restored) {
    applyParamSnapshot(restored);
    updateUndoRedoButtons();
  }
});

redoParamsBtn?.addEventListener('click', () => {
  const restored = paramHistory.redo(captureParamSnapshot());
  if (restored) {
    applyParamSnapshot(restored);
    updateUndoRedoButtons();
  }
});

document.addEventListener('keydown', (event) => {
  if (!(event.metaKey || event.ctrlKey) || event.target.matches('input, textarea, select')) {
    return;
  }
  if (event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undoParamsBtn?.click();
  } else if (event.key === 'z' && event.shiftKey) {
    event.preventDefault();
    redoParamsBtn?.click();
  }
});

speechModeBtn.addEventListener('click', () => applyContentMode('speech'));
musicModeBtn.addEventListener('click', () => applyContentMode('music'));

queueFilesBtn.addEventListener('click', () => {
  queueFileInput.click();
});

queueFileInput.addEventListener('change', async (event) => {
  const files = [...event.target.files];
  if (!files.length) {
    return;
  }

  try {
    await ensureAudioReady();
    setStatus(`Adding ${files.length} file(s) to queue…`);
    for (const file of files) {
      await playlist.addFromFile(file, engine.getAudioContext());
    }
    renderPlaylist();
    if (!engine.getAudioBuffer() && playlist.getCurrentItem()) {
      await loadPlaylistItem(playlist.getCurrentItem());
    }
    setStatus(`Added ${files.length} file(s) to playlist`);
  } catch (error) {
    console.error(error);
    setStatus(`Queue error: ${error.message}`, 'error');
  } finally {
    queueFileInput.value = '';
  }
});

clearQueueBtn.addEventListener('click', async () => {
  playlist.clear();
  loadedFileName = '';
  engine.stop();
  setTransportEnabled(false);
  renderPlaylist();
  setStatus('Playlist cleared');
});

exportSessionBtn?.addEventListener('click', () => {
  downloadSessionJson(buildSessionState());
  setStatus('Session JSON downloaded');
});

importSessionBtn?.addEventListener('click', () => {
  sessionFileInput.click();
});

sessionFileInput?.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  try {
    const snapshot = parseSessionSnapshot(await file.text());
    await applySessionSnapshot(snapshot);
    setStatus('Session settings restored from JSON');
  } catch (error) {
    console.error(error);
    setStatus(`Session import error: ${error.message}`, 'error');
  } finally {
    sessionFileInput.value = '';
  }
});

masterGainSlider.addEventListener('input', () => {
  updateSliderDisplays();
  engine.setMasterGain(Number(masterGainSlider.value));
});

vocoderEnableCheckbox.addEventListener('change', () => {
  const enabled = vocoderEnableCheckbox.checked;
  diagnosticControls.classList.toggle('active', enabled);
  engine.setVocoderEnabled(enabled);
  updateStatusPill();
});

vocoderDryWetSlider.addEventListener('input', () => {
  updateSliderDisplays();
  engine.setVocoderDryWet(Number(vocoderDryWetSlider.value));
});

mapProfileSelect.addEventListener('change', () => {
  loadMapProfileById(mapProfileSelect.value);
});

importMapBtn.addEventListener('click', () => {
  mapFileInput.click();
});

mapFileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  try {
    const text = await file.text();
    const profile = parseMapProfileJson(text);
    customProfiles[profile.id] = profile;
    buildMapProfileSelect();
    mapProfileSelect.value = profile.id;
    loadMapProfileById(profile.id);
    setStatus(`Imported map: ${profile.name}`);
  } catch (error) {
    console.error(error);
    setStatus(`Map import error: ${error.message}`, 'error');
  }
  mapFileInput.value = '';
});

exportMapBtn.addEventListener('click', () => {
  const blob = new Blob([exportMapProfileJson(currentMapProfile)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${currentMapProfile.id || 'ci-map'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

presetSelect.addEventListener('change', () => {
  if (presetSelect.value === '__custom__') {
    return;
  }
  const preset = getPresetById(presetSelect.value, userPresets);
  if (!preset) {
    setStatus('Unknown preset selected.', 'error');
    return;
  }
  applyPreset(preset);
  activePresetId = preset.id;
  setStatus(`Preset: ${preset.name}`);
});

savePresetBtn.addEventListener('click', () => {
  const name = window.prompt('Preset name:', `My preset ${Object.keys(userPresets).length + 1}`);
  if (!name) {
    return;
  }
  const preset = captureCurrentParams(getCurrentEnhancementParams(), name.trim());
  userPresets[preset.id] = preset;
  saveUserPresets(userPresets);
  buildPresetSelect();
  activePresetId = preset.id;
  presetSelect.value = preset.id;
  setStatus(`Saved preset: ${preset.name}`);
});

exportPresetBtn.addEventListener('click', () => {
  const preset = getPresetById(presetSelect.value, userPresets) || captureCurrentParams(getCurrentEnhancementParams(), 'Current settings');
  const blob = new Blob([exportPresetJson(preset)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${preset.id || 'ci-preset'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

importPresetBtn.addEventListener('click', () => {
  presetFileInput.click();
});

presetFileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  try {
    const preset = parsePresetJson(await file.text());
    userPresets[preset.id] = preset;
    saveUserPresets(userPresets);
    buildPresetSelect();
    applyPreset(preset);
    setStatus(`Imported preset: ${preset.name}`);
  } catch (error) {
    console.error(error);
    setStatus(`Preset import error: ${error.message}`, 'error');
  }
  presetFileInput.value = '';
});

vizSmoothingSlider.addEventListener('input', () => {
  vizSmoothingValue.textContent = Number(vizSmoothingSlider.value).toFixed(2);
  engine.setAnalyserSmoothing(Number(vizSmoothingSlider.value));
  saveVizSettings();
});

meterStabilitySlider.addEventListener('input', () => {
  updateMeterControlLabels();
  applyMeterSettingsToVisualizer();
  saveVizSettings();
});

meterResetBtn.addEventListener('click', () => {
  visualizer?.resetMeterProfiles();
});

themeToggleBtn.addEventListener('click', toggleTheme);

optimizeBtn.addEventListener('click', async () => {
  const audioBuffer = engine.getAudioBuffer();
  if (!audioBuffer) {
    setStatus('Load audio to enable optimization.', 'error');
    return;
  }

  optimizeBtn.disabled = true;
  const range = getOptimizeRegionRange();
  if (range && range.endSec - range.startSec < 4) {
    setStatus('Optimize region must be at least 4 seconds.', 'error');
    optimizeBtn.disabled = false;
    return;
  }
  optimizeProgress.textContent = range
    ? `Starting search on ${formatTime(range.startSec)}–${formatTime(range.endSec)}…`
    : 'Starting vocoder-in-the-loop search (625 combinations)…';

  try {
    const result = await optimizeForCI(
      audioBuffer,
      currentMapProfile,
      (progress) => {
        showOptimizeRunning(progress);
        optimizeProgress.textContent =
          `Evaluating ${progress.current}/${progress.total}… best score ${progress.bestScore.toFixed(3)} (baseline ${progress.baselineScore.toFixed(3)})`;
      },
      { range }
    );

    applyParamsToUi(result.bestParams);
    paramHistory.clear();
    updateUndoRedoButtons();
    updateMetricsDisplay(result);
    optimizeProgress.textContent =
      `Done. Tested ${result.candidatesEvaluated} combinations. Composite +${result.deltas.composite.toFixed(1)}% vs raw-through-vocoder baseline.`;
    setStatus(`Optimized for CI map: ${currentMapProfile.name}`);
  } catch (error) {
    console.error(error);
    optimizeProgress.textContent = `Optimization failed: ${error.message}`;
    setStatus(`Optimization error: ${error.message}`, 'error');
  } finally {
    optimizeBtn.disabled = false;
    updateInputModeUi();
  }
});

buildVizLabels();
buildPresetSelect();
initTheme();
initVizSettings();
initCollapsiblePanels();
initContentMode();
updateSliderDisplays();
vizSmoothingValue.textContent = Number(vizSmoothingSlider.value).toFixed(2);
engine.setAnalyserSmoothing(Number(vizSmoothingSlider.value));
engine.setStereoWidth(Number(stereoWidthSlider.value));
initHelpUi();
initializeEngine().catch((error) => {
  console.error('Engine initialization failed:', error);
  setStatus(`Initialization error: ${error.message}`, 'error');
});

window.addEventListener('beforeunload', () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  engine.stop();
  vocoder.dispose();
});
