export const INFO_TOPICS = {
  transport: {
    title: 'Transport & File Loading',
    body: `
      <p>Load common audio files (MP3, WAV, FLAC, etc.) from the local device, or use the built-in <strong>DSP Check</strong> / <strong>Music Eval</strong> demos (see ⓘ <strong>Built-in demo tracks</strong>). All decoding occurs in the browser; audio is not uploaded.</p>
      <ul>
        <li><strong>Choose Audio File</strong> — your own library track (MP3, WAV, FLAC, etc.); see ⓘ <strong>Your uploaded audio</strong>.</li>
        <li><strong>DSP Check</strong> — 4-second engineering fixture; loop enabled automatically.</li>
        <li><strong>Music Eval</strong> — 8-second stereo groove; loop enabled automatically.</li>
        <li><strong>Use Microphone</strong> — live input through the enhancement chain (permission required). Status pill reads <strong>MIC LIVE</strong>.</li>
        <li><strong>Export Processed WAV</strong> — offline render; check <strong>Include diagnostic vocoder</strong> for vocoded WAV (<code>-vocoded.wav</code>) vs enhancement-only (<code>-processed.wav</code>).</li>
        <li><strong>Playlist</strong> — <strong>Add files to queue…</strong> (multi-select), click rows to switch, auto-advance when Loop is off.</li>
        <li><strong>Play / Pause</strong> — resume from the current scrubber position.</li>
        <li><strong>Stop</strong> — stops playback and returns to the start.</li>
        <li><strong>⏮ / −5s / +5s</strong> — jump to start, rewind, or fast-forward five seconds.</li>
        <li><strong>Scrubber</strong> — seek to any point; elapsed and total time appear at the sides.</li>
        <li><strong>Loop</strong> — repeat the loaded segment continuously.</li>
        <li><strong>Volume</strong> — master output level after enhancement and optional vocoder. Default is 0 dB; lower if the chain feels loud after optimization.</li>
      </ul>
      <p>The status pill indicates <strong>IDLE</strong>, <strong>PLAYING</strong>, or <strong>VOCODER</strong> when diagnostic simulation is active. Latency displays the browser-reported output latency.</p>
    `
  },
  spectrum: {
    title: '16-Channel Spectrum Analyzer',
    body: `
      <p>The main chart compares <strong>input</strong> (wide gray bars) against <strong>enhanced output</strong> (narrow blue or gold bars in front). Move sliders while paused to see gold pull away from gray; during playback, blue live bars track the audio.</p>
      <p>Three sub-panels below show complementary views — each has its own ⓘ icon:</p>
      <ul>
        <li><strong>Channel contrast</strong> — which electrodes stand out vs the average.</li>
        <li><strong>Enhancement profile</strong> — fixed-scale percent change per channel (time-averaged during playback).</li>
        <li><strong>Band energy</strong> — large input vs enhanced bars per compressor band with lift %.</li>
      </ul>
      <p>Most enhancement is a <strong>steady spectral reshape</strong> (EQ, compression curve, MAP shaping) rather than second-by-second drama. The profile and band meters emphasize that overall character; moment-to-moment compression is shown in the <strong>GR meters</strong> on the Enhancement panel.</p>
      <p>See also: <strong>Visualization controls</strong>, <strong>Frequency readouts</strong>, and <strong>Gain-reduction meters</strong> help topics.</p>
    `
  },
  'channel-contrast': {
    title: 'Channel Contrast (vs Average)',
    body: `
      <p>Shows how each of the 16 electrode channels compares to the <strong>average level across all channels</strong> on the enhanced signal.</p>
      <ul>
        <li><strong>Blue bars above center</strong> — hotter than average (more energy in that channel).</li>
        <li><strong>Gold bars below center</strong> — cooler than average.</li>
        <li><strong>Green outline</strong> — peak channel during playback (loudest electrode).</li>
      </ul>
      <p>Useful for spotting which frequency regions dominate after enhancement — e.g. clarity lift pushing mid channels, or harmonic excitation in low-mid bands. Auto-scales to the largest deviation so the shape stays readable.</p>
    `
  },
  'enhancement-profile': {
    title: 'Enhancement Profile (% vs Input)',
    body: `
      <p>Percent change per channel: how much louder (green) or quieter (red) the enhanced signal is vs the raw input on each electrode.</p>
      <ul>
        <li><strong>Fixed ±35% scale</strong> — bars do not auto-zoom, so you can compare settings at a glance.</li>
        <li><strong>When paused</strong> — instant gold preview from current slider values.</li>
        <li><strong>When playing</strong> — time-averaged profile (see <strong>Meter stability</strong>) because the input→enhanced relationship is mostly stable for a given preset.</li>
      </ul>
      <p>This answers: <em>“What is the overall fingerprint of my settings?”</em> — not a scrolling timeline.</p>
    `
  },
  'band-energy': {
    title: 'Band Energy (Input vs Enhanced)',
    body: `
      <p>Three rows (low / mid / high) aligned with the multi-band compressor crossover (~250 Hz and ~4 kHz). Each row shows:</p>
      <ul>
        <li><strong>Gray input bar</strong> — energy before compression on that band.</li>
        <li><strong>Colored enhanced bar</strong> — energy after compression and band merge.</li>
        <li><strong>Lift %</strong> on the right — relative change (green = louder, red = quieter).</li>
      </ul>
      <p>Large horizontal bars replace the old scrolling trace — easier to read at a glance. Values are time-averaged during playback. For live pumping/compression dynamics, watch the <strong>GR meters</strong> in Enhancement Controls.</p>
    `
  },
  'viz-controls': {
    title: 'Visualization Controls',
    body: `
      <p>Display-only settings above the charts (they do not change audio processing):</p>
      <ul>
        <li><strong>Channel bar smoothing</strong> — analyser damping on the 16-channel spectrum bars. Higher = calmer motion during playback.</li>
        <li><strong>Meter stability</strong> — how quickly the enhancement profile and band energy bars settle toward a steady average. Higher = steadier “settings fingerprint.”</li>
        <li><strong>Reset meter averages</strong> — clears accumulated averages after changing sliders, switching presets, or jumping to a new song section.</li>
      </ul>
      <p>Settings are saved in localStorage with your theme preference.</p>
    `
  },
  'freq-info': {
    title: 'Frequency Readouts',
    body: `
      <p>Live diagnostics below the main spectrum chart:</p>
      <ul>
        <li><strong>F0 est.</strong> — rough fundamental estimate from low-channel energy (heuristic, not a pitch tracker).</li>
        <li><strong>Peak channel</strong> — electrode with the strongest enhanced level (E1–E16).</li>
        <li><strong>Saturated bins</strong> — count of full-scale FFT bins (clipping indicator on the wide-band analyser).</li>
        <li><strong>Harmonic gen</strong> — ON when harmonic drive &gt; 0 and enhancement is not bypassed.</li>
      </ul>
    `
  },
  'comp-gr-meters': {
    title: 'Gain-Reduction (GR) Meters',
    body: `
      <p>Three horizontal meters below the enhancement sliders — one per compressor band (low / mid / high).</p>
      <ul>
        <li><strong>During playback</strong> — live gain reduction from each <code>DynamicsCompressorNode</code>, plus pre/post RMS dBFS and peak-hold in the label.</li>
        <li><strong>When paused</strong> — threshold-based estimate from current slider position.</li>
      </ul>
      <p>These are the right place to watch <strong>moment-to-moment dynamics</strong>. The band energy panel above shows slower, averaged level comparison — not a scrolling timeline.</p>
    `
  },
  presets: {
    title: 'Enhancement Presets',
    body: `
      <p>Built-in profiles: Default, Speech intelligibility, Music enjoyment, Classical, Rock, Jazz. Each sets harmonic drive, compression threshold, clarity lift, and transpose mix.</p>
      <ul>
        <li><strong>Compare presets</strong> — table of slider differences between any two profiles (default: Speech vs Music).</li>
        <li><strong>Undo / Redo</strong> — step back through manual slider changes (⌘/Ctrl+Z, ⇧⌘/Ctrl+Z); cleared on preset load or session import.</li>
        <li><strong>Save as preset</strong> — stores current sliders to localStorage with a custom name.</li>
        <li><strong>Export preset</strong> — downloads JSON for sharing or study reproducibility.</li>
        <li><strong>Import preset</strong> — loads JSON from disk.</li>
      </ul>
      <p>Changing a preset updates the gold preview immediately when paused.</p>
    `
  },
  'export-wav': {
    title: 'Export Processed WAV',
    body: `
      <p>Offline-renders the loaded file through the current enhancement settings (MAP profile, sliders, bypass state, stereo width) and downloads a 16-bit WAV.</p>
      <ul>
        <li>Uses the transport <strong>Volume</strong> setting for output level.</li>
        <li><strong>Include diagnostic vocoder</strong> (checkbox) — when checked, runs the offline 16-channel vocoder after enhancement. Filename uses <code>-vocoded.wav</code>; unchecked uses <code>-processed.wav</code> (enhancement only).</li>
        <li>Requires a loaded file or built-in demo; disabled during live microphone input.</li>
      </ul>
      <p>Progress appears in the status line during render. For study reproducibility, also export a <strong>session JSON</strong> under Documents ▾.</p>
    `
  },
  'vocoder-enable': {
    title: 'Enable CI Hardware Simulation',
    body: `
      <p>Turns on the diagnostic 16-channel noise-band vocoder path. When unchecked, you hear only the enhancement chain (default).</p>
      <p>When checked, the <strong>Vocoder Blend</strong> slider mixes between enhanced audio (dry) and vocoded output (wet). Status pill reads <strong>VOCODER</strong> during playback.</p>
      <p>For normal listening and CI-user demos, leave this off. Use 100% simulated blend with <strong>Bypass Enhancement</strong> for developer A/B testing through the codec surrogate.</p>
      <p>WAV export can optionally include the vocoder pass (checkbox in Transport).</p>
    `
  },
  'demo-tracks': {
    title: 'Built-in Demo Tracks',
    body: `
      <p>This app targets <strong>music streaming to cochlear implants</strong> — rhythm, harmony, bass salience, and separability after CI re-coding. Manufacturer apps already optimise <strong>speech</strong>; these demos help you test <strong>music preprocessing</strong> without uploading files.</p>
      <h4>DSP Check (4 s, mono)</h4>
      <p><strong>What it is:</strong> A minimal synthetic fixture — 60 Hz sub-bass square, C-major arpeggio (one note per second), kick, and hi-hat. Both channels are identical.</p>
      <p><strong>Why those sounds:</strong> Each layer hits a specific processing stage: sub-bass → harmonic excitation; melody → mid-band clarity and MAP shaping; hi-hat → high-band compression and transposition; kick → low-band GR meters and rhythm metrics.</p>
      <p><strong>Use it to:</strong> Confirm the pipeline, visualizations, auto-tune, and GR meters work; verify gold preview when paused; run a quick 625-combo optimize. Not meant to sound like real music.</p>
      <h4>Music Eval (8 s, stereo, 120 BPM)</h4>
      <p><strong>What it is:</strong> A short Am–F–C–G groove — electric-style bass, Rhodes-like chords (panned left), lead hook (panned right), kick/snare/hi-hat, and a bar-4 crash. Loops cleanly for hands-free A/B.</p>
      <p><strong>Why those sounds:</strong> Mirrors real music-streaming challenges: sub-bass kick you may not resolve as pitch; chord + lead separation; stereo width (try the width slider at 0% vs 50%); sustained mids and HF transients for compression and transposition.</p>
      <p><strong>Use it to:</strong> Hear whether <strong>Music mode</strong> improves groove and melody vs <strong>Bypass Enhancement</strong>; compare Speech vs Music presets; test stereo narrowing; queue both demos back-to-back in the playlist. This is the demo to show stakeholders <em>musical</em> intent.</p>
      <h4>Suggested test flow</h4>
      <ol>
        <li><strong>DSP Check</strong> → Play → confirm meters and spectrum respond → run <strong>Optimize for CI</strong> once.</li>
        <li><strong>Music Eval</strong> → <strong>Music mode</strong> → Play with Loop on → toggle <strong>Bypass Enhancement</strong> for A/B.</li>
        <li>Optional: enable diagnostic vocoder at 50–100% simulated blend to hear CI-like smearing (developer tool, not clinical proof).</li>
        <li>Load your own library files for genre-specific tuning — demos are starting points only.</li>
      </ol>
      <p>Both demos regenerate from code on page reload (playlist remembers names and order). Loop is enabled automatically when you load either demo.</p>
      <p><strong>Your own files</strong> — use <strong>Choose Audio File</strong> or <strong>Add files to queue…</strong> for genre-specific tuning. See ⓘ <strong>Your uploaded audio</strong> for how uploads differ from demos.</p>
    `
  },
  'user-audio': {
    title: 'Your Uploaded Audio',
    body: `
      <p>This app is a <strong>music pre-processor</strong> for material you already stream to a CI — not a speech-therapy tool. Built-in demos are synthetic starting points; <strong>your uploaded tracks</strong> are how you tune for real listening.</p>
      <h4>What it is</h4>
      <p>Any common audio file from your device (MP3, WAV, FLAC, M4A, etc.). Decoding runs entirely in the browser — files are <strong>not uploaded</strong> to a server. The full file is held in memory for playback, optimization, and WAV export.</p>
      <h4>Why use your own files</h4>
      <ul>
        <li><strong>Genre</strong> — electronic, classical, and rock stress different bands; demos cannot cover your library.</li>
        <li><strong>Mix / mastering</strong> — commercial loudness, stereo width, and sub-bass vary; tuning should match what you actually stream.</li>
        <li><strong>Validation</strong> — stakeholders and study protocols need recognizable material, not only synthetic fixtures.</li>
        <li><strong>Playlist workflow</strong> — queue several uploads and auto-advance when Loop is off.</li>
      </ul>
      <h4>How to use uploads</h4>
      <ol>
        <li><strong>Choose Audio File</strong> — loads into the current playlist slot (replaces that row).</li>
        <li><strong>Add files to queue…</strong> — multi-select to build a set without stopping playback.</li>
        <li>Set <strong>Optimize region</strong> In/Out markers on a chorus or verse, then <strong>Optimize for CI</strong>.</li>
        <li>Try <strong>Music mode</strong> (or genre presets), then fine-tune sliders; use <strong>Undo</strong> / <strong>Redo</strong> while exploring.</li>
        <li>Toggle <strong>Bypass Enhancement</strong> with <strong>Loudness-match when bypassing</strong> on for a fair A/B.</li>
        <li><strong>Export Processed WAV</strong> and <strong>Export session JSON</strong> per study reproducibility.</li>
      </ol>
      <h4>After a page reload</h4>
      <p>Uploaded file <strong>audio is not persisted</strong> — only names and order in sessionStorage. Re-select files from disk. Built-in demos (<strong>DSP Check</strong>, <strong>Music Eval</strong>) regenerate automatically.</p>
      <h4>Demos vs uploads — quick pick</h4>
      <ul>
        <li><strong>DSP Check</strong> — verify meters, auto-tune, and visualizations (engineering).</li>
        <li><strong>Music Eval</strong> — hear musical intent with Music mode vs bypass (stakeholder demo).</li>
        <li><strong>Your files</strong> — real tuning and export for listening on implant hardware.</li>
      </ul>
    `
  },
  'optimize-region': {
    title: 'Optimize Region (In / Out)',
    body: `
      <p>Sets which part of the loaded track <strong>Optimize for CI</strong> analyzes. Default (In at start, Out at end) uses the <strong>center 12 seconds</strong> of the file.</p>
      <ul>
        <li><strong>In / Out sliders</strong> — under the transport scrubber; drag to bracket a chorus, verse, or drum break.</li>
        <li><strong>Minimum length</strong> — at least <strong>4 seconds</strong>; up to <strong>12 seconds</strong> from the selected window is analyzed.</li>
        <li><strong>Label</strong> — shows the time range and duration; warns if too short.</li>
      </ul>
      <p>Tip: load <strong>Music Eval</strong> or your own track, set In/Out on the loudest section, then optimize — results apply to the whole chain when you play.</p>
    `
  },
  'loudness-matched-ab': {
    title: 'Loudness-Matched A/B',
    body: `
      <p>When <strong>Loudness-match when bypassing</strong> is checked (default on), toggling <strong>Bypass Enhancement</strong> temporarily adjusts the raw path so perceived level matches the enhanced path — fairer for judging quality, not just loudness.</p>
      <ul>
        <li>Uses short-term energy from the 16-channel input vs enhanced analyzers.</li>
        <li>Makeup gain is clamped (0.25×–4×) and resets when bypass is turned off.</li>
        <li>Your <strong>Volume</strong> slider still controls overall output; loudness match is an A/B aid only.</li>
      </ul>
      <p>Uncheck for level-accurate raw vs enhanced comparison (raw may sound quieter because enhancement adds makeup gain).</p>
    `
  },
  'stereo-width': {
    title: 'Stereo Width',
    body: `
      <p>Collapses stereo input toward mono before the enhancement chain — useful for unilateral CI users or material with exaggerated panning.</p>
      <ul>
        <li><strong>0% (default)</strong> — mid-only (L+R)/2 mono collapse.</li>
        <li><strong>100%</strong> — retains more side information before summing to the mono enhancement bus.</li>
      </ul>
      <p>Applies to stereo files and live microphone input. Mono files are unaffected. Export uses the same width setting. Try <strong>Music Eval</strong> at 0% vs 50% width — keys and lead are panned L/R.</p>
    `
  },
  playlist: {
    title: 'Playlist Queue',
    body: `
      <p>Build a queue of tracks without re-uploading between songs.</p>
      <ul>
        <li><strong>Choose Audio File</strong> — loads/replaces the current playlist slot.</li>
        <li><strong>Add files to queue</strong> — append multiple files (multi-select).</li>
        <li><strong>Click a row</strong> — load that track.</li>
        <li><strong>×</strong> — remove a track from the queue.</li>
      </ul>
      <p>When <strong>Loop</strong> is off, playback advances to the next queue item automatically. Queue metadata persists in sessionStorage for the browser tab; re-add file items after a full page reload. Built-in demos (<strong>DSP Check</strong>, <strong>Music Eval</strong>) regenerate from code — load both and switch rows to compare engineering vs musical test material.</p>
    `
  },
  'session-snapshot': {
    title: 'Session Snapshot JSON',
    body: `
      <p>Export or import all tuning settings as one JSON file — enhancement sliders, MAP profile, preset/mode, vocoder, stereo width, viz controls, and loop preference.</p>
      <ul>
        <li><strong>Export session JSON</strong> — Documents ▾ in the nav bar.</li>
        <li><strong>Import session JSON</strong> — restores sliders and map; does not load audio files.</li>
      </ul>
      <p>Use alongside per-track WAV export and preset JSON for reproducible study sessions. Audio buffers are not included.</p>
    `
  },
  'content-mode': {
    title: 'Speech / Music Mode',
    body: `
      <p>One-click shortcuts above the preset dropdown that apply the built-in <strong>Speech intelligibility</strong> or <strong>Music enjoyment</strong> profiles.</p>
      <ul>
        <li>Your last choice is remembered in <strong>localStorage</strong> and restored on next visit.</li>
        <li>Manual slider changes switch to <strong>Custom (current)</strong> in the preset dropdown.</li>
      </ul>
      <p>Other built-in presets (Classical, Rock, Jazz) remain in the dropdown. <strong>Speech mode</strong> weights intelligibility when vocals matter inside a music mix — it does not replace clinical speech processors. Future: automatic content-type suggestion (see Roadmap).</p>
    `
  },
  'mobile-layout': {
    title: 'Mobile Layout & PWA',
    body: `
      <p>On phones and narrow windows:</p>
      <ul>
        <li><strong>Collapsible panels</strong> — ▾ on each section heading; state saved in localStorage.</li>
        <li><strong>Sticky transport bar</strong> — playback controls stay visible while scrolling.</li>
        <li><strong>44px touch targets</strong> on buttons and sliders.</li>
        <li><strong>PWA manifest</strong> — add to home screen on iOS/Android for a standalone app icon (<code>manifest.json</code>).</li>
      </ul>
      <p>Safe-area insets are respected for notched devices. ES modules still require HTTP — use a local server or deployed URL, not <code>file://</code>.</p>
    `
  },
  'enhancement-controls': {
    title: 'Enhancement Controls Overview',
    body: `
      <p>These sliders adjust the live Web Audio processing chain. The optimization target is <strong>salience after CI re-coding</strong> — rhythm, melody, consonants, and separability under ~16 channels — rather than natural timbre on conventional speakers.</p>
      <p><strong>Speech / Music mode</strong> — quick-switch buttons apply built-in profiles; choice is remembered between sessions. Use <strong>Music Eval</strong> with <strong>Music mode</strong> for musical A/B (this app targets music streaming, not clinical speech).</p>
      <p><strong>Preset dropdown</strong> — Default, Speech, Music, Classical, Rock, Jazz + saved custom presets (localStorage / JSON import).</p>
      <p><strong>Stereo width</strong> — collapses stereo toward mono before processing (default 0% for unilateral CI).</p>
      <p><strong>Optimize for CI</strong> runs a 625-combination offline search on the <strong>Optimize region</strong> (or center 12 s). <strong>Compare presets</strong>, <strong>Undo</strong>/<strong>Redo</strong>, and <strong>Loudness-match when bypassing</strong> support tuning workflow.</p>
      <p>Live and planned features are listed under <strong>Roadmap ▾</strong>, with ✓ marks on completed requirements.</p>
    `
  },
  'harmonic-drive': {
    title: 'Harmonic Drive',
    body: `
      <p>Controls sub-bass harmonic excitation via a <code>WaveShaperNode</code> polynomial curve on energy below 150 Hz.</p>
      <p>CI listeners typically cannot resolve true sub-bass pitch — there may be only 1–2 apical channels for low frequencies. This stage generates <strong>2nd and 3rd-order harmonics</strong> in the 280–650 Hz region where electrodes are usable.</p>
      <p><strong>Overtone-series mechanism:</strong> a 50 Hz fundamental produces harmonics at 100 Hz, 150 Hz, 200 Hz, and so on. Non-linear distortion creates new spectral correlates locked to the original bass rhythm, providing pitch and beat salience that level boost at 50 Hz alone cannot supply.</p>
      <p>Adjusting this control updates the gold processing preview immediately. During playback, low-mid channels (E2–E5) in the cochlear map reflect the effect.</p>
    `
  },
  'comp-threshold': {
    title: 'Multi-Band Compression Threshold',
    body: `
      <p>Sets the threshold for three compressors (low / mid / high bands) with ratios of 12:1, 16:1, and 20:1.</p>
      <p><strong>GR meters</strong> display gain reduction per band with pre/post dBFS and peak-hold labels during playback. A lower threshold increases compression on quiet material.</p>
      <p>CI speech processors apply separate envelope extraction and compression after wireless streaming. Pre-compression flattens dynamics so quiet musical detail is more likely to survive the implant's second compression stage.</p>
    `
  },
  'clarity-lift': {
    title: 'Clarity Lift',
    body: `
      <p>A broad peaking EQ centered at ~2 kHz (low Q) boosts the fundamental region of vocals and lead melodies.</p>
      <p>The boost targets the speech-critical band where CI electrode density and acclimation are typically strongest — not a generic presence shelf for normal hearing.</p>
      <p>The Speech preset applies higher clarity lift; the Music preset applies less to preserve timbral character.</p>
    `
  },
  'transpose-mix': {
    title: 'Frequency Transposition Mix',
    body: `
      <p>Blends direct high-band content (4 kHz+) with <strong>ring-modulation transposition</strong>: energy above 6 kHz is amplitude-modulated by a 3.5 kHz sine carrier, producing sum/difference sidebands, then low-pass filtered at 5 kHz.</p>
      <p>CI listeners often lose usable high-frequency pitch cues. Transposition relocates extreme treble energy into mid bands where more electrodes can represent it.</p>
      <p>At 0%, only the direct high band is audible; at 100%, the transposed path dominates. Default is 40%. Auto-tune includes transpose mix in its 625-combination search grid.</p>
    `
  },
  'master-gain': {
    title: 'Output Volume',
    body: `
      <p>Final level control after enhancement and optional vocoder blending. Located in the <strong>transport bar</strong>.</p>
      <p>Range is −24 dB to +6 dB. Default is 0 dB. Lower the slider if enhancement makeup gain feels loud — especially after <strong>Optimize for CI</strong>, which prioritizes metric scores over comfortable listening level. WAV export uses the current volume setting.</p>
    `
  },
  'enhancement-bypass': {
    title: 'Bypass Enhancement',
    body: `
      <p>Routes raw, unprocessed audio to the output bus, skipping the enhancement chain but not the optional vocoder.</p>
      <p>The gold processing preview collapses to a flat bypass shape when enabled.</p>
      <p><strong>A/B protocol:</strong> with <strong>Loudness-match when bypassing</strong> enabled, toggle bypass to compare raw vs enhanced at similar level. With diagnostic vocoder at 100% simulated, compare through the same CI-like codec.</p>
    `
  },
  'auto-tune': {
    title: 'CI Auto-Tune (Vocoder-in-the-Loop)',
    body: `
      <p>Analyzes up to a <strong>12-second window</strong> from the <strong>Optimize region</strong> (In/Out under the scrubber) or, if unset, the <strong>center 12 seconds</strong> of the track. Evaluates <strong>625 parameter combinations</strong> offline (harmonic drive × compression threshold × clarity lift × transpose mix). Each candidate passes through an offline mirror of the enhancement chain, then a 16-channel noise vocoder using the active electrode map.</p>
      <p>The selected combination maximizes a <strong>composite perceptual proxy score</strong> on the vocoded output — not conventional speaker fidelity.</p>
      <p><strong>On completion:</strong></p>
      <ul>
        <li>Metric cards display numeric scores (composite typically ~3–6 depending on material)</li>
        <li>Delta rows show percentage change vs raw-through-vocoder baseline</li>
        <li>Enhancement sliders update to the winning combination</li>
      </ul>
      <p>During the search, the composite card shows the running best score; progress text shows the evaluation count.</p>
    `
  },
  'metric-composite': {
    title: 'Composite Score',
    body: `
      <p>Weighted combination of modulation depth, usable band energy, inter-band contrast, bass rhythm salience, speech band salience, and crest factor — measured on the <strong>vocoded</strong> signal after optimization.</p>
      <p>Delta percentage compares optimized enhanced-through-vocoder output against a raw-through-vocoder baseline. Em-dashes (—) indicate a failed optimization run; refresh the page and retry.</p>
    `
  },
  'metric-modulation': {
    title: 'Modulation Depth',
    body: `
      <p>Average peak-minus-floor envelope per band after vocoding. CI strategies rely on <strong>slow amplitude envelopes</strong> (temporal envelope cues). Higher modulation generally indicates more rhythmic and consonant information surviving vocoding.</p>
    `
  },
  'metric-usable': {
    title: 'Usable Band Energy',
    body: `
      <p>Energy weighted by the active electrode map (active vs dead/weak channels). Higher values indicate signal concentrated on channels the listener can use.</p>
    `
  },
  'metric-contrast': {
    title: 'Inter-Band Contrast',
    body: `
      <p>Standard deviation of mean band levels. Under spectral smearing, instruments collapse together; higher contrast suggests better separability across the 16 channels.</p>
    `
  },
  'metric-bass': {
    title: 'Bass Rhythm Salience',
    body: `
      <p>Mean envelope energy in 280–700 Hz — the region where harmonic bass excitation places rhythmic correlates. Measures whether overtone-based bass substitution survives vocoding.</p>
    `
  },
  'metric-speech': {
    title: 'Speech Band Salience',
    body: `
      <p>Mean envelope energy in 500 Hz–4 kHz — the region most critical for speech and melody fundamentals on typical CI maps.</p>
    `
  },
  'electrode-map': {
    title: 'Electrode Map (MAP-Inspired)',
    body: `
      <p>Personalizes processing to a 16-channel layout. Built-in presets derive from published CI literature; proprietary clinical MAP files are not publicly available for direct import.</p>
      <ul>
        <li><strong>Active / Weak / Dead</strong> — dead channels trigger redistribution of processing weight to neighbors.</li>
        <li><strong>Weight</strong> — per-channel emphasis in the MAP spectral shaper and gold processing preview.</li>
        <li><strong>Import / Export JSON</strong> — audiologists can complete <code>profiles/example-custom.json</code> with patient-specific center frequencies.</li>
      </ul>
      <p>Changing the map rebuilds per-channel analysers for live visualization.</p>
    `
  },
  'vocoder-diagnostic': {
    title: 'Diagnostic Vocoder',
    body: `
      <p>A 16-channel noise-band vocoder intended for <strong>normal-hearing developers and researchers</strong>. It approximates coarse spectral resolution and loss of fine structure. Bypassed by default during normal listening.</p>
      <p>Wide overlapping bandpass filters (low Q) reduce ringing. Envelope followers are boosted (~18×) with output makeup gain so 100% wet output remains audible.</p>
      <p>This is an engineering surrogate, not a clinical CI simulator — useful for A/B testing, auto-tune modeling, and development diagnostics.</p>
    `
  },
  'vocoder-blend': {
    title: 'Vocoder Blend',
    body: `
      <p>At 0% simulated: fully enhanced pre-processed audio. At 100% simulated: fully vocoded output.</p>
      <p>The status pill reads <strong>VOCODER</strong> when simulation is enabled during playback.</p>
      <p>At 100% simulated with Bypass Enhancement enabled, the comparison isolates raw versus enhanced material through the same CI-like codec.</p>
    `
  }
};

export const MENU_CONTENT = {
  instructions: {
    title: 'How to Use — Step by Step',
    body: `
      <h3>Quick start (Music Eval demo)</h3>
      <ol>
        <li><strong>Music Eval</strong> — 8-second stereo groove; loop starts automatically; appears in the playlist as <em>Demo — Music Eval (8 s)</em>.</li>
        <li><strong>Play</strong> — enhancement is active by default.</li>
        <li><strong>Music mode</strong> — one-click preset tuned for rhythm and timbral salience (not clinical speech).</li>
        <li><strong>A/B</strong> — enable <strong>Loudness-match when bypassing</strong>, then toggle <strong>Bypass Enhancement</strong> with Loop on.</li>
        <li>Optional: <strong>Optimize for CI</strong> on this clip, then re-compare bypass vs enhanced.</li>
      </ol>
      <h3>Engineering check (DSP Check demo)</h3>
      <ol>
        <li><strong>DSP Check</strong> — 4-second mono fixture; confirms each DSP stage and meter.</li>
        <li>Watch <strong>GR meters</strong>, <strong>band energy</strong>, and <strong>enhancement profile</strong> while looping.</li>
        <li>Run <strong>Optimize for CI</strong> once to verify auto-tune and metric cards.</li>
      </ol>
      <h3>Playlist workflow</h3>
      <ol>
        <li><strong>Add files to queue…</strong> — multi-select to build a playlist without stopping playback.</li>
        <li><strong>Click a row</strong> in the playlist to switch tracks.</li>
        <li>Turn <strong>Loop</strong> off to auto-advance to the next track when a song ends.</li>
        <li>After a full page reload, re-add file items (built-in demos regenerate automatically).</li>
      </ol>
      <h3>Full workflow (your uploaded audio)</h3>
      <ol>
        <li><strong>Choose Audio File</strong> — your MP3/WAV/FLAC from disk (see ⓘ <strong>Your uploaded audio</strong> — why demos are not enough for final tuning).</li>
        <li><strong>Optimize region</strong> — set In/Out under the scrubber on a representative chorus or verse (≥ 4 s).</li>
        <li><strong>Electrode map</strong> — select a preset or import participant JSON.</li>
        <li><strong>Optimize for CI</strong> — ~30–90 s; metric cards should show numeric scores.</li>
        <li><strong>Compare presets</strong> — Speech vs Music table, then fine-tune; use <strong>Undo</strong> while exploring.</li>
        <li><strong>A/B</strong> — <strong>Loudness-match when bypassing</strong> + Bypass Enhancement.</li>
        <li><strong>Export</strong> — WAV per track + session JSON for settings.</li>
      </ol>
      <h3>Demos only (no upload yet)</h3>
      <ol>
        <li><strong>Music Eval</strong> or <strong>DSP Check</strong> — instant material; see ⓘ <strong>Built-in demo tracks</strong>.</li>
        <li><strong>Stereo width</strong> — try Music Eval at 0% vs 50%.</li>
        <li><strong>Loop and scrub</strong> — Loop for repeated passages; −5s/+5s to focus.</li>
      </ol>
      <h3>Study and research preparation</h3>
      <ol>
        <li>Import participant JSON map (center frequencies, dead electrodes) from clinical records.</li>
        <li>Run Optimize on representative stimuli per genre; export map JSON, preset JSON, and session JSON.</li>
        <li>Export processed (and optionally vocoded) WAV per stimulus.</li>
        <li>Record metric deltas and winning parameter sets per track.</li>
        <li>At 100% vocoder simulation, confirm bypass A/B results align with metric predictions.</li>
        <li>Clinical validation requires streaming processed audio to the participant's implant hardware; the vocoder is a development proxy only.</li>
      </ol>
      <h3>Interface reference</h3>
      <ul>
        <li><strong>Documents ▾</strong> — overview, PDF, technical paper, session JSON export/import.</li>
        <li><strong>Roadmap ▾</strong> — live, partial, and planned features with ✓ on completed requirements.</li>
        <li><strong>Collapsible panels</strong> — ▾ on section headings; state remembered on mobile and desktop.</li>
        <li><strong>☀ / 🌙</strong> — light/dark theme (localStorage).</li>
        <li><strong>ⓘ icons</strong> — contextual help on every panel, sub-panel, and major control.</li>
      </ul>
    `
  },
  help: {
    title: 'Help & Troubleshooting',
    body: `
      <h3>Common issues</h3>
      <dl>
        <dt>Menus, buttons, or ⓘ popups do nothing</dt>
        <dd>Usually means JavaScript failed to load — a red banner appears at the top when the app module cannot start, or the status line shows <strong>Initialization error</strong> (e.g. a missing engine method after a code update). Open the browser console (F12) for details. <strong>Hard-refresh</strong> with <strong>Cmd+Shift+R</strong> (Mac) or <strong>Ctrl+Shift+R</strong> (Windows) so all JS modules reload — only refreshing <code>app.js</code> is not enough if the browser cached an older dependency. Run <code>npm test</code> in the repo to validate help topics and module syntax. The app requires HTTP (<code>python3 -m http.server 8765</code>), not <code>file://</code>.</dd>
        <dt>No sound after loading</dt>
        <dd>Playback requires a user gesture (click Play). Check Volume in the transport bar — confirm it is not set to −24 dB.</dd>
        <dt>Visualizations unchanged when moving sliders</dt>
        <dd>When paused, gold preview bars should update immediately. When playing, blue live bars reflect audio energy. The enhancement profile and band energy meters show time-averaged comparisons — use <strong>Reset meter averages</strong> after big setting changes. GR meters show live compression when playing.</dd>
        <dt>Profile / band meters seem static during playback</dt>
        <dd>Expected for steady presets — enhancement mostly applies a consistent reshape. Lower <strong>Meter stability</strong> for faster response, or watch GR meters for dynamics. Change sliders while paused to see the gold preview jump immediately.</dd>
        <dt>Blue spectrum bars flat during playback</dt>
        <dd>Confirm the status pill reads PLAYING and Volume is sufficient. Hard-refresh the page (Cmd+Shift+R). Test with <strong>Music Eval</strong> or <strong>DSP Check</strong>.</dd>
        <dt>Auto-tune complete but metric cards show dashes (—)</dt>
        <dd>Indicates a failed optimization run. Hard-refresh and re-run Optimize. Composite scores typically display values in the 3.5–6.0 range.</dd>
        <dt>Vocoder at 100% silent or very quiet</dt>
        <dd>Expected output is a buzzy, band-limited signal. Increase Volume or reduce blend to 50% initially. Hard-refresh if the issue persists.</dd>
        <dt>Optimize button disabled</dt>
        <dd>Load an audio file or a built-in demo (<strong>DSP Check</strong> or <strong>Music Eval</strong>) first.</dd>
        <dt>Optimization slow</dt>
        <dd>625 combinations over a 12-second segment is CPU-intensive. Typical duration is 30–90 s depending on hardware.</dd>
        <dt>Playlist item shows unavailable after reload</dt>
        <dd>File audio buffers are not persisted across full page reloads — only names and order in sessionStorage. Re-add files with <strong>Add files to queue…</strong> or <strong>Choose Audio File</strong>. Built-in demos (<strong>DSP Check</strong>, <strong>Music Eval</strong>) regenerate from code automatically.</dd>
        <dt>Session import failed</dt>
        <dd>Ensure the JSON was exported from this app (version 1 snapshot). Import restores settings only — load audio separately afterward.</dd>
        <dt>Export sounds different from live playback</dt>
        <dd>Offline render uses <code>offlinePipeline.js</code>; live graph uses Web Audio nodes. Small differences are expected. Optional vocoder export uses the offline vocoder mirror. See Roadmap: offline pipeline parity test.</dd>
        <dt>Demo track too loud</dt>
        <dd>Lower transport Volume (default 0 dB). Demo synthesis levels are reduced, but enhancement makeup gain can still feel loud.</dd>
      </dl>
      <h3>Browser support</h3>
      <p>Chrome or Edge recommended. Safari and Firefox are generally supported. Transposition uses ring modulation in the live graph; AudioWorklet is not required.</p>
      <h3>Privacy</h3>
      <p>All processing occurs locally in the browser. Audio is not uploaded. Presets, theme, content mode, panel collapse state, and viz settings use localStorage; playlist names use sessionStorage.</p>
      <h3>For researchers</h3>
      <p>Source code is included in the repository. See the <a href="paper.html" target="_blank">Technical Paper</a> for collaboration protocols. Planned study features are listed under <strong>Roadmap ▾</strong>.</p>
    `
  },
  faq: {
    title: 'Frequently Asked Questions',
    body: `
      <div class="faq-item"><h4>Is this equivalent to EQ and compression?</h4>
      <p>Partially — but the optimization target differs. Phone EQ prioritizes pleasant playback on speakers. This engine prioritizes separability and salience after CI-like re-coding. It includes harmonic generation (not level boost alone), ring-mod frequency transposition, MAP-aware shaping, vocoder-in-the-loop auto-tune, and control-linked visualizations.</p></div>
      <div class="faq-item"><h4>Why are there two colors in the spectrum display?</h4>
      <p>Gray is the unprocessed input; blue (live) or gold (preview) is after enhancement. Narrow inner bars sit in front of wide gray bars so you can see exactly where the engine adds or removes energy.</p></div>
      <div class="faq-item"><h4>Why don’t the profile and band meters scroll like a timeline?</h4>
      <p>Most settings apply a steady overall change (EQ curve, compression ratio, MAP shape) — not second-by-second variation. Scrolling traces were hard to read and misleading. The app now shows large band comparison bars and a fixed-scale enhancement profile, time-averaged during playback. Live compression dynamics appear in the GR meters.</p></div>
      <div class="faq-item"><h4>How do Speech mode and Music mode buttons work?</h4>
      <p>They apply the built-in Speech or Music presets in one click. Your choice is saved in localStorage. Moving any slider manually switches to Custom (current).</p></div>
      <div class="faq-item"><h4>What is the difference between demo tracks and my uploaded files?</h4>
      <p><strong>DSP Check</strong> and <strong>Music Eval</strong> are synthetic, in-browser fixtures — no upload, always available, regenerate after reload. They prove engineering (meters, auto-tune) and musical intent (Music mode A/B). <strong>Your uploaded files</strong> are real library material for genre-specific tuning and WAV export; they stay in memory only until you reload the page. See ⓘ <strong>Built-in demo tracks</strong> and ⓘ <strong>Your uploaded audio</strong>.</p></div>
      <div class="faq-item"><h4>What are DSP Check and Music Eval?</h4>
      <p><strong>DSP Check</strong> (4 s, mono) is an engineering fixture: sub-bass, arpeggio, kick, and hi-hat — each layer exercises one part of the chain and the meters. <strong>Music Eval</strong> (8 s, stereo groove) is the musical demo: bass, chords, lead, drums, and stereo panning so you can hear whether <strong>Music mode</strong> improves rhythm and separation for CI streaming. See ⓘ <strong>Built-in demo tracks</strong> for the full how and why.</p></div>
      <div class="faq-item"><h4>Is this app for speech understanding?</h4>
      <p>No — manufacturer CI apps and clinical MAP fitting already target speech. This engine is a <strong>music pre-processor</strong> upstream of wireless streaming: bass harmonic substitution, multi-band compression, clarity lift, and transposition for rhythm, melody, and separability. <strong>Speech mode</strong> is a preset name for mixes with prominent vocals, not a replacement for clinical speech processing.</p></div>
      <div class="faq-item"><h4>Which demo should I use first?</h4>
      <p>Start with <strong>Music Eval</strong> if you want to hear musical intent (Music mode vs bypass). Use <strong>DSP Check</strong> if you are verifying meters, auto-tune, or visualization behavior. Queue both in the playlist to compare.</p></div>
      <div class="faq-item"><h4>What is the playlist for?</h4>
      <p>Queue multiple tracks and auto-advance when Loop is off — useful for tuning across a library without re-uploading each file. Names persist in the tab; re-add files after a full page reload. Built-in demos regenerate automatically.</p></div>
      <div class="faq-item"><h4>What is session JSON export?</h4>
      <p>Under Documents ▾, exports all settings (sliders, MAP, vocoder, stereo width, viz) as one JSON file for study reproducibility. It does not include audio — pair with WAV export per track.</p></div>
      <div class="faq-item"><h4>What does stereo width do?</h4>
      <p>Collapses stereo toward mono before enhancement — default 0% for unilateral CI users. 100% retains more side information before the mono processing bus. Applies to export as well.</p></div>
      <div class="faq-item"><h4>Can I use this on a phone?</h4>
      <p>Yes — collapsible panels, sticky transport, and 44px touch targets are built in. Add to home screen via the PWA manifest for a standalone icon. ES modules still require HTTP (local server or deployed URL), not <code>file://</code>.</p></div>
      <div class="faq-item"><h4>How does harmonic excitation relate to the overtone series?</h4>
      <p>Non-linear distortion on sub-bass generates integer harmonics (2f, 3f, …) in perceptible bands. The listener may not resolve the fundamental; the perceptual correlate is new spectral energy in electrode-usable regions that preserves rhythm and pitch-class structure.</p></div>
      <div class="faq-item"><h4>How do Speech and Music presets differ?</h4>
      <p>Speech: lower harmonic drive, higher clarity lift, less transposition — favors intelligibility. Music: higher harmonic drive, heavier compression, more transposition — favors rhythm and timbral salience.</p></div>
      <div class="faq-item"><h4>Why is this processing not available in manufacturer CI apps?</h4>
      <p>Manufacturer applications focus on clinical fitting, speech programs, and implant safety. Aggressive music pre-processing upstream of the envelope coder requires validation against each manufacturer's coding strategy.</p></div>
      <div class="faq-item"><h4>Can clinical MAP files be imported directly?</h4>
      <p>Proprietary MAP formats are not supported. JSON import accepts center frequencies from clinical records, or literature-based presets can be used. Audiogram CSV import is planned (see Roadmap).</p></div>
      <div class="faq-item"><h4>Does the diagnostic vocoder demonstrate clinical benefit?</h4>
      <p>The vocoder is an engineering surrogate only. Clinical benefit requires listener studies with processed audio streamed to actual implants.</p></div>
      <div class="faq-item"><h4>What is the Roadmap menu?</h4>
      <p>A catalog of planned and in-progress features. Each entry in <strong>Roadmap ▾</strong> shows a status badge (live, partial, planned), a short description, and a bulleted list of implementation requirements — including items marked ✓ when already delivered.</p></div>
      <div class="faq-item"><h4>How can researchers evaluate the system independently?</h4>
      <p>The open codebase supports local deployment. Recommended return data includes MAP JSON, MUSHRA scores, genre-specific ratings, and correlation between proxy metrics and listener outcomes. Protocol details are in the Technical Paper.</p></div>
    `
  },
  background: {
    title: 'Background — Why CI Pre-Processing?',
    body: `
      <p>Cochlear implants provide excellent speech perception for many users but music often suffers: weak bass, blurred timbre, poor pitch resolution above ~300–500 Hz, and limited dynamic range after envelope extraction.</p>
      <p>Commercial CI companion apps offer volume, programs, and sometimes coarse tone controls — not harmonic regeneration, transposition, vocoder-aware auto-tuning, MAP-personalized mastering, or researcher-facing diagnostics.</p>
      <p>Phone EQ assumes normal hearing with intact temporal fine structure. CI users receive ~16–22 channels of slowly varying envelopes — a fundamentally different representation.</p>
      <p>This engine implements multi-band compression, harmonic bass excitation, clarity lift, ring-mod transposition, MAP shaping, profile-based visualizers, two built-in demos (<strong>DSP Check</strong> engineering fixture + <strong>Music Eval</strong> stereo groove), playlist queue, session JSON, stereo width control, Speech/Music mode memory, microphone input, WAV export (optional vocoder), mobile collapsible UI, PWA manifest, and offline vocoder-in-the-loop optimization.</p>
      <p><a href="paper.html" target="_blank"><strong>Technical paper →</strong></a> Signal-chain diagrams, overtone-series mechanism, double-compression theory, and research collaboration guidelines.</p>
    `
  },
  technical: {
    title: 'Technical Signal Chain',
    body: `
      <pre class="chain-diagram">
Source (file / mic / playlist queue)
  → Stereo width (M/S → mono, user slider)
  → Enhancement input
  → MAP Spectral Shaper (16 parallel peaking, profile-weighted)
  → Parallel 3-band crossover + compression (12:1 / 16:1 / 20:1)
  → Harmonic excitation (sub-bass → 280–650 Hz via WaveShaper)
  → Clarity peaking (~2 kHz)
  → High band: direct path + ring-mod transposition (6 kHz+ × 3.5 kHz carrier → LP 5 kHz)
  → Merge → [Optional vocoder dry/wet] → Master gain → Output
  ↳ Parallel tap → 16× bandpass analysers + full FFT (visualization only)
      </pre>
      <h4>Session &amp; export</h4>
      <ul>
        <li><strong>Session JSON</strong> — <code>sessionSnapshot.js</code> export/import of all UI settings (no audio).</li>
        <li><strong>WAV export</strong> — <code>exportAudio.js</code> offline enhancement; optional <code>processVocoder</code> pass.</li>
        <li><strong>Built-in demos</strong> — <code>demoTrack.js</code> generates <strong>DSP Check</strong> (4 s mono fixture) and <strong>Music Eval</strong> (8 s stereo groove); playlist stores <code>demoId</code> for reload.</li>
        <li><strong>Playlist</strong> — <code>playlist.js</code> in-memory queue + sessionStorage metadata.</li>
      </ul>
      <h4>Visualization panels</h4>
      <ul>
        <li><strong>Main spectrum</strong> — input vs enhanced per electrode (live blue / preview gold).</li>
        <li><strong>Channel contrast</strong> — deviation from average on enhanced signal.</li>
        <li><strong>Enhancement profile</strong> — fixed ±35% scale; time-averaged % change vs input.</li>
        <li><strong>Band energy</strong> — large pre/post compression bars per band + lift %.</li>
        <li><strong>GR meters</strong> — live gain reduction per compressor band.</li>
      </ul>
      <h4>Live vs preview visualization</h4>
      <ul>
        <li><strong>Live (blue)</strong> — per-channel AnalyserNodes on the post-enhancement bus; requires playback.</li>
        <li><strong>Preview (gold)</strong> — <code>processingPreview.js</code> computes expected emphasis from MAP and slider values without audio playback.</li>
      </ul>
      <h4>Offline auto-tune loop</h4>
      <pre class="chain-diagram">
Extract 12 s segment (centered)
Baseline: raw → offline vocoder → score metrics
For each (harmonicDrive, compThreshold, clarityLift, transposeMix) in 5×5×5×5 grid:
  segment → offline enhancement (ring-mod transposition)
         → offline 16-ch vocoder → score metrics
Pick max composite → apply to live engine sliders
      </pre>
      <p>Metrics: modulation depth, MAP-weighted energy, inter-band contrast, bass rhythm salience (280–700 Hz), speech band salience (500 Hz–4 kHz), crest factor.</p>
      <p>The live diagnostic vocoder and offline vocoder share MAP-derived band centers and dead-region weighting via <code>vocoderBands.js</code>.</p>
      <h4>Module map</h4>
      <ul>
        <li><code>audioGraph.js</code> — live processing graph</li>
        <li><code>vocoderBands.js</code> — shared MAP-derived vocoder band layout</li>
        <li><code>vocoderDiagnostic.js</code> — live 16-ch vocoder</li>
        <li><code>exportAudio.js</code> — processed WAV export</li>
        <li><code>offlinePipeline.js</code> — offline mirror for auto-tune</li>
        <li><code>visualizer.js</code> — spectrum, contrast, profile, band energy, GR helpers</li>
        <li><code>processingPreview.js</code> — control-linked visualization preview</li>
        <li><code>presets.js</code> — built-in and localStorage presets</li>
        <li><code>roadmapContent.js</code> — product roadmap data</li>
        <li><code>playlist.js</code> — track queue + sessionStorage metadata</li>
        <li><code>sessionSnapshot.js</code> — full settings export/import JSON</li>
        <li><code>ciMetrics.js</code> / <code>autoTuner.js</code> — scoring and 625-combo search</li>
      </ul>
      <p><a href="paper.html" target="_blank">Full technical paper →</a></p>
    `
  }
};
