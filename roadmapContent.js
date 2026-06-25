/**
 * Product roadmap — planned features, requirements, and implementation status.
 */

export const ROADMAP_PRIORITIES = {
  high: { label: 'High priority', emoji: '🔴' },
  medium: { label: 'Medium priority', emoji: '🟡' },
  low: { label: 'Lower priority / QoL', emoji: '🟢' },
  research: { label: 'Research / experimental', emoji: '🔬' },
  deferred: { label: 'Previously deferred', emoji: '⏳' }
};

export const ROADMAP_ITEMS = [
  {
    id: 'per-band-vocoder-transpose',
    priority: 'high',
    status: 'planned',
    title: 'Per-band vocoder transposition',
    summary:
      'Replace ring modulation with envelope-following, vocoder-style pitch shifting per CI channel for cleaner high-frequency remapping on tonal material.',
    requirements: [
      'AudioWorklet or WASM pitch shifter per 16-channel band',
      'Envelope follower aligned with vocoder diagnostic band layout',
      'A/B artefact testing vs current ring-mod path; offline pipeline parity',
      'CPU budget analysis on mobile Safari'
    ]
  },
  {
    id: 'custom-worklet-compressor',
    priority: 'high',
    status: 'planned',
    title: 'Custom AudioWorklet compressor',
    summary:
      'Lookahead brick-wall limiting per band with true RMS metering instead of DynamicsCompressorNode defaults.',
    requirements: [
      'Per-band AudioWorklet with configurable knee, ratio, attack, release',
      'Lookahead buffer (~5–20 ms) per band',
      'Wire GR meters to worklet-reported reduction values',
      'Mirror logic in offlinePipeline.js for auto-tune fidelity'
    ]
  },
  {
    id: 'audiogram-personalisation',
    priority: 'high',
    status: 'planned',
    title: 'Audiogram personalisation',
    summary:
      'Upload audiogram CSV to weight per-channel gain, compression, and clarity lift for an individual CI user.',
    requirements: [
      'CSV schema + validation (frequency vs threshold/hearing level)',
      'Map audiogram points to 16 electrode center frequencies',
      'Derive MAP weights, comp thresholds, and clarity lift per band',
      'Clinical disclaimer + audiologist review workflow',
      'Study validation against listener outcomes'
    ]
  },
  {
    id: 'tfs-encoder',
    priority: 'high',
    status: 'planned',
    title: 'Temporal fine structure (TFS) encoder',
    summary:
      'Encode amplitude-modulation sidebands at the fundamental per band to reinforce pitch cues lost in CI coding.',
    requirements: [
      'Robust F0 tracker per band (autocorrelation or YIN-style)',
      'AM sideband synthesis within CI-usable rate limits',
      'Integration with band energy comparison visualizer for tuning',
      'Listening-test protocol for pitch salience improvement'
    ]
  },
  {
    id: 'speech-music-mode',
    priority: 'medium',
    status: 'available',
    title: 'Speech / music mode switch',
    summary:
      'Different DSP profiles for speech intelligibility vs music enjoyment — now available as built-in presets.',
    requirements: [
      '✓ Built-in Speech and Music presets in Enhancement Controls',
      '✓ Speech / Music quick-switch buttons with mode memory (localStorage)'
    ]
  },
  {
    id: 'mic-input',
    priority: 'medium',
    status: 'available',
    title: 'Real-time microphone input',
    summary: 'Run the enhancement graph on live mic input for concerts, TV, or conversation monitoring.',
    requirements: [
      '✓ getUserMedia with echoCancellation/noiseSuppression',
      '✓ MediaStreamSource into enhancement chain; MIC LIVE status pill',
      '✓ Permission UX; file transport disabled while mic active',
      'Bluetooth / hearing-aid routing notes in help docs'
    ]
  },
  {
    id: 'session-snapshot',
    priority: 'medium',
    status: 'available',
    title: 'Session snapshot (export / import JSON)',
    summary: 'Export and import a full tuning session — sliders, MAP, preset/mode, vocoder, stereo width, viz settings — as one JSON file.',
    requirements: [
      '✓ sessionSnapshot.js + Tools ▾ export/import UI',
      '✓ Restores enhancement, map, vocoder, stereo width, viz, loop',
      'Does not include audio buffers or playlist files',
      'Future: include playlist metadata references in snapshot'
    ]
  },
  {
    id: 'preset-system',
    priority: 'medium',
    status: 'available',
    title: 'Preset system',
    summary: 'Save and recall named parameter sets with JSON import/export and localStorage persistence.',
    requirements: [
      '✓ Built-in presets + save/load custom presets (Enhancement Controls)',
      'Shareable preset URLs or hash-encoded settings in URL',
      'Cloud sync (optional, privacy-reviewed)'
    ]
  },
  {
    id: 'gr-metering-pro',
    priority: 'medium',
    status: 'available',
    title: 'Advanced gain-reduction metering',
    summary: 'Live GR bars with pre/post RMS dBFS readout and peak hold per band.',
    requirements: [
      '✓ Live GR bars + threshold-based estimate when paused',
      '✓ Peak/RMS AnalyserNode taps pre/post each compressor',
      '✓ Numeric dBFS readout + peak-hold decay',
      'Custom worklet compressor for laboratory-accurate reduction reporting'
    ]
  },
  {
    id: 'stereo-narrowing',
    priority: 'medium',
    status: 'available',
    title: 'Stereo field narrowing',
    summary: 'Optional mono collapse or stereo width reduction for single-CI users who perceive stereo poorly.',
    requirements: [
      '✓ Stereo input path with M/S width control before mono enhancement bus',
      '✓ Width slider (0 = mono mid, 1 = wider side blend)',
      '✓ Offline export parity via mixDownToMono width parameter',
      '✓ Help topic + default 0% for unilateral CI'
    ]
  },
  {
    id: 'export-processed-audio',
    priority: 'low',
    status: 'partial',
    title: 'Export processed audio',
    summary: 'Offline render to WAV via the offline enhancement pipeline for library pre-processing.',
    requirements: [
      '✓ Offline enhancement render to 16-bit PCM WAV',
      '✓ Progress status in transport bar',
      '✓ Optional vocoder-inclusive export mode',
      '✓ Offline pipeline smoke test (npm test)',
      'Browser live vs offline RMS harness (future)'
    ]
  },
  {
    id: 'midi-clock-sync',
    priority: 'low',
    status: 'planned',
    title: 'MIDI clock sync',
    summary: 'Lock compression attack/release to musical tempo for rhythmic coherence.',
    requirements: [
      'BPM detection or manual tap tempo',
      'Map tempo to attack/release multiples per band',
      'Web MIDI API optional input',
      'Validate on looped demo + percussive material'
    ]
  },
  {
    id: 'viz-smoothing',
    priority: 'low',
    status: 'available',
    title: 'Visualization controls',
    summary: 'Channel bar smoothing, meter stability for profile/band averages, and reset — display-only tuning.',
    requirements: [
      '✓ Channel bar smoothing slider (analyser damping)',
      '✓ Meter stability slider for enhancement profile and band energy averages',
      '✓ Reset meter averages control'
    ]
  },
  {
    id: 'theme-toggle',
    priority: 'low',
    status: 'available',
    title: 'Dark / light theme toggle',
    summary: 'High-contrast light theme for low-vision accessibility.',
    requirements: ['✓ Theme toggle in nav bar; preference stored in localStorage']
  },
  {
    id: 'built-in-demos',
    priority: 'low',
    status: 'available',
    title: 'Built-in demo tracks',
    summary: 'DSP Check engineering fixture + Music Eval stereo groove — no upload required for first-run testing.',
    requirements: [
      '✓ DSP Check (4 s mono) — sub-bass, arpeggio, kick, hi-hat per DSP stage',
      '✓ Music Eval (8 s stereo, 120 BPM Am–F–C–G) — bass, chords, lead, drums for music A/B',
      '✓ Labeled transport buttons + demo-tracks ⓘ help topic',
      '✓ playlist demoId persistence for correct reload'
    ]
  },
  {
    id: 'playlist-queue',
    priority: 'low',
    status: 'available',
    title: 'Playlist / queueing',
    summary: 'Load multiple files and play in sequence without re-uploading each track.',
    requirements: [
      '✓ Queue data model + UI list in Transport',
      '✓ Advance on ended event when loop is off',
      '✓ Persist queue metadata in sessionStorage',
      '✓ Per-track preset memory on queue items'
    ]
  },
  {
    id: 'mobile-layout',
    priority: 'low',
    status: 'available',
    title: 'Mobile layout overhaul',
    summary: 'Stacked collapsible cards and larger touch targets for phone use.',
    requirements: [
      '✓ Responsive grids and transport wrap at breakpoints',
      '✓ Collapsible panel sections with remember state',
      '✓ 44px touch targets; sticky mini-transport bar',
      '✓ iOS safe-area + PWA manifest'
    ]
  },
  {
    id: 'ai-parameter-tuning',
    priority: 'research',
    status: 'partial',
    title: 'AI-driven parameter tuning',
    summary: 'ML model trained on CI user feedback — grid-search auto-tune exists today as a heuristic proxy.',
    requirements: [
      '✓ Vocoder-in-the-loop grid search (625 combos incl. transpose mix)',
      'Listener study dataset (MUSHRA, genre, MAP)',
      'Lightweight regressor or ranking model',
      'Privacy-preserving local-only inference preferred'
    ]
  },
  {
    id: 'channel-interaction',
    priority: 'research',
    status: 'planned',
    title: 'Channel interaction simulation',
    summary: 'Model electrode current spread to pre-emphasise low-interference bands.',
    requirements: [
      'Spread matrix per manufacturer / insertion depth',
      'Convolve channel gains with spread kernel',
      'Visual overlay on cochlear map',
      'Validation against clinical fitting software exports'
    ]
  },
  {
    id: 'binaural-vocoder',
    priority: 'research',
    status: 'planned',
    title: 'Binaural CI simulation',
    summary: 'Extend diagnostic vocoder to bilateral independent electrode arrays.',
    requirements: [
      'Dual MAP profiles (L/R) with independent routing',
      'Headphone vs speaker pan law',
      'Sync with binaural research protocols',
      '2× CPU cost mitigation'
    ]
  },
  {
    id: 'proprietary-map-import',
    priority: 'deferred',
    status: 'planned',
    title: 'Proprietary MAP / fitting file import',
    summary:
      'Import manufacturer-specific MAP or fitting exports (Cochlear, Advanced Bionics, Med-El) instead of hand-built JSON only.',
    requirements: [
      'Reverse-engineer or obtain documented schemas for each manufacturer export format',
      'Map clinical fields (MCL, T-level, channel status, center frequency) to the 16-channel grid model',
      'Validation against audiologist-provided reference exports',
      'Legal/clinical review — fitting data is patient-specific PHI',
      'Fallback to JSON template when proprietary parse fails'
    ]
  },
  {
    id: 'autotune-transpose-mix',
    priority: 'deferred',
    status: 'available',
    title: 'Auto-tune includes transpose mix',
    summary: 'Freq transposition mix is included in the 625-combo offline search grid.',
    requirements: [
      '✓ autoTuner.js grid includes transposeMix (5×5×5×5)',
      '✓ Ring-mod parity in offlinePipeline.js',
      '✓ UI progress for 625-combo search'
    ]
  },
  {
    id: 'optimize-on-selection',
    priority: 'medium',
    status: 'available',
    title: 'Optimize on loop region',
    summary: 'Run CI Auto-Tune on the scrubber In/Out selection instead of a fixed 12-second center segment.',
    requirements: [
      '✓ In/Out region sliders on transport',
      '✓ Pass selected time range to autoTuner.js / ciMetrics.js',
      '✓ Minimum segment length guard (~4 s)',
      '✓ UI hint when loop region is too short'
    ]
  },
  {
    id: 'preset-diff-view',
    priority: 'low',
    status: 'available',
    title: 'Preset comparison (diff view)',
    summary: 'Show which sliders differ between two presets — e.g. Speech vs Music or custom A vs B.',
    requirements: [
      '✓ Delta table for four enhancement params',
      '✓ Compare presets button + modal with A/B dropdowns',
      'Speech/Music quick-trigger from default selection'
    ]
  },
  {
    id: 'loudness-matched-ab',
    priority: 'medium',
    status: 'available',
    title: 'Loudness-matched A/B',
    summary: 'Auto-adjust volume when toggling Bypass Enhancement so raw and enhanced are similar loudness for fair comparison.',
    requirements: [
      '✓ Short-term RMS measure on pre/post analyzers',
      '✓ Temporary makeup gain on raw bypass path',
      '✓ User checkbox to enable/disable',
      '✓ Documented in bypass help topic'
    ]
  },
  {
    id: 'slider-undo-redo',
    priority: 'low',
    status: 'available',
    title: 'Slider undo / redo',
    summary: 'In-memory stack to step back through slider changes during a tuning session.',
    requirements: [
      '✓ Capture snapshot on slider pointerup',
      '✓ Undo/redo buttons + ⌘/Ctrl+Z shortcuts',
      '✓ Cap stack depth (32 states)',
      '✓ Clear on preset load / session import'
    ]
  },
  {
    id: 'advanced-panels-default',
    priority: 'low',
    status: 'available',
    title: 'Collapse advanced panels by default',
    summary: 'Hide Diagnostic Vocoder and CI Auto-Tune sections until the user expands them — less cognitive load on mobile.',
    requirements: [
      '✓ Default collapsed on first visit for auto-tune + vocoder panels',
      '✓ Remember in localStorage with other panel state',
      '✓ Works alongside per-panel ▾ controls'
    ]
  },
  {
    id: 'offline-pipeline-parity',
    priority: 'low',
    status: 'partial',
    title: 'Offline / live pipeline parity test',
    summary: 'Automated dev script: offline pipeline determinism and parameter sensitivity (npm test).',
    requirements: [
      '✓ scripts/parity-test.mjs in npm test',
      '✓ Determinism + param sensitivity checks',
      'Browser harness for live vs offline RMS (future)',
      'Feeds export-processed-audio roadmap item'
    ]
  },
  {
    id: 'content-heuristic-mode',
    priority: 'medium',
    status: 'planned',
    title: 'Content-aware mode suggestion',
    summary: 'Lightweight spectral heuristic (speech-band vs music flux) to suggest Speech or Music preset — recommendation only, not auto-apply.',
    requirements: [
      'Feature extractors on loaded segment',
      'Non-blocking suggestion chip in UI',
      'User dismiss / accept',
      'Disclaimer — not a classifier ML model'
    ]
  },
  {
    id: 'github-vercel-deploy',
    priority: 'deferred',
    status: 'available',
    title: 'GitHub + Vercel deployment',
    summary: 'Public static hosting for demos and listener studies.',
    requirements: [
      '✓ vercel.json + README deploy steps',
      '✓ Git init/push + Vercel import (public demo URL)',
      'Optional custom domain + HTTPS headers for mic/export features'
    ]
  }
];

export function getRoadmapItem(id) {
  return ROADMAP_ITEMS.find((item) => item.id === id);
}

export function getRoadmapByPriority() {
  const order = ['high', 'medium', 'low', 'research', 'deferred'];
  return order.map((priority) => ({
    priority,
    meta: ROADMAP_PRIORITIES[priority],
    items: ROADMAP_ITEMS.filter((item) => item.priority === priority)
  }));
}

export function formatRoadmapModalBody(item) {
  const statusLabel =
    item.status === 'available'
      ? '✅ Available now'
      : item.status === 'partial'
        ? '🔶 Partially implemented'
        : '📋 Planned';

  return `
    <p><strong>Status:</strong> ${statusLabel}</p>
    <p>${item.summary}</p>
    <h3>Requirements to implement</h3>
    ${formatRoadmapRequirementsHtml(item)}
  `;
}

function roadmapStatusBadge(item) {
  const badgeClass =
    item.status === 'available' ? 'available' : item.status === 'partial' ? 'partial' : 'planned';
  const badgeText =
    item.status === 'available' ? 'live' : item.status === 'partial' ? 'partial' : 'planned';
  return { badgeClass, badgeText };
}

export function formatRoadmapRequirementsHtml(item) {
  const reqHtml = item.requirements.map((req) => `<li>${req}</li>`).join('');
  return `<ul class="roadmap-req-list">${reqHtml}</ul>`;
}

export function formatRoadmapDropdownItem(item) {
  const { badgeClass, badgeText } = roadmapStatusBadge(item);
  return `
    <div class="roadmap-item" data-roadmap-item="${item.id}">
      <div class="roadmap-item-head">
        <strong class="roadmap-item-title">${item.title}</strong>
        <span class="roadmap-badge ${badgeClass}">${badgeText}</span>
      </div>
      <span class="menu-desc">${item.summary}</span>
      <div class="roadmap-req-block">
        <span class="roadmap-req-label">Required to implement</span>
        ${formatRoadmapRequirementsHtml(item)}
      </div>
    </div>
  `;
}
