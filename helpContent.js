export const INFO_TOPICS = {
  transport: {
    title: 'Transport & File Loading',
    body: `
      <p>Load common audio files (MP3, WAV, FLAC, etc.) from the local device, or use the built-in music demo battery: <strong>DSP Check</strong>, <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, and <strong>Full Mix</strong> (see ⓘ <strong>Built-in demo tracks</strong>). All decoding occurs in the browser; audio is not uploaded.</p>
      <ul>
        <li><strong>Choose Audio File</strong> — your own library track (MP3, WAV, FLAC, etc.); see ⓘ <strong>Your uploaded audio</strong>.</li>
        <li><strong>DSP Check</strong> — 4-second engineering fixture; loop enabled automatically.</li>
        <li><strong>Bass Focus</strong> — sparse 8-second music probe for low fundamentals, missing-fundamental cues, kick/bass salience.</li>
        <li><strong>Melody / Harmony</strong> — 8-second music probe for melody tracking, chord separability, sustained timbre, and upper harmonics.</li>
        <li><strong>Full Mix</strong> — 8-second stereo groove for whole-chain music A/B; loop enabled automatically.</li>
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
        <li><strong>Compare presets</strong> — table of slider differences between any two profiles (Music, Classical, Rock, Jazz, Speech, or saved presets).</li>
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
      <p>Progress appears in the status line during render. For study reproducibility, also export a <strong>session JSON</strong> under Tools ▾.</p>
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
      <p>This app targets <strong>music streaming to cochlear implants</strong> — bass salience, melody contour, harmony, timbre, rhythm, and separability after CI re-coding. Manufacturer apps already optimise speech; this demo battery exists to test <strong>music preprocessing</strong> without uploading copyrighted files.</p>
      <p>All demos are <strong>synthetic, deterministic, license-free, and generated in the browser</strong>. They are not meant to be beautiful songs; each one foregrounds a specific CI music problem so engineers can hear the A/B and watch the meters respond.</p>
      <h4>DSP Check (4 s, mono)</h4>
      <p><strong>What it is:</strong> A minimal synthetic fixture — 60 Hz sub-bass square, C-major arpeggio (one note per second), kick, and hi-hat. Both channels are identical.</p>
      <p><strong>Why those sounds:</strong> Each layer hits a specific processing stage: sub-bass → harmonic excitation; melody → mid-band clarity and MAP shaping; hi-hat → high-band compression and transposition; kick → low-band GR meters and rhythm metrics.</p>
      <p><strong>Use it to:</strong> Confirm the pipeline, visualizations, auto-tune, and GR meters work; verify gold preview when paused; run a quick 625-combo optimize. Not meant to sound like real music.</p>
      <h4>Bass Focus (8 s, stereo)</h4>
      <p><strong>What it is:</strong> A sparse groove with fundamentals around 41–73 Hz, kick, light hat, and upper harmonic structure.</p>
      <p><strong>Why those sounds:</strong> Low fundamentals are often weak or ambiguous through CI processing. The enhancement should make bass <em>identity</em> and rhythmic foundation easier to follow through harmonic excitation, not simply louder.</p>
      <p><strong>Use it to:</strong> Toggle <strong>Bypass Enhancement</strong> while listening for bass pitch/contour, kick definition, and whether low-mid harmonic cues become more usable. Watch low-band energy and harmonic generation readouts.</p>
      <h4>Melody / Harmony (8 s, stereo)</h4>
      <p><strong>What it is:</strong> A cleaner musical passage with sustained chords, moving lead melody, vibrato, note attacks, bass roots, and upper harmonics.</p>
      <p><strong>Why those sounds:</strong> Melody contour, chord quality, and timbre are major music-listening pain points for CI users. This probe foregrounds clarity lift, MAP shaping, and high-frequency transposition without hiding the result behind a dense drum bed.</p>
      <p><strong>Use it to:</strong> Listen for clearer lead contour, better chord separation, and less smeared upper detail. Try <strong>Music mode</strong>, then adjust <strong>Clarity Lift</strong> and <strong>Freq Transposition Mix</strong>.</p>
      <h4>Full Mix (8 s, stereo, 120 BPM)</h4>
      <p><strong>What it is:</strong> A short Am–F–C–G groove — bass, chords (panned left), lead hook (panned right), kick/snare/hi-hat, crash, stereo width, vibrato, and richer attacks. Loops cleanly for hands-free A/B.</p>
      <p><strong>Why those sounds:</strong> Tests the whole chain together: bass foundation, chord/lead separation, stereo-to-mono width handling, sustained mids, HF transients, compression, and transposition.</p>
      <p><strong>Use it to:</strong> Demonstrate the overall music experience: <strong>Music mode</strong> vs <strong>Bypass Enhancement</strong>, loudness-matched A/B, stereo width at 0% vs 50%, and optional diagnostic vocoder blend.</p>
      <h4>Suggested test flow</h4>
      <ol>
        <li><strong>DSP Check</strong> → Play → confirm meters and spectrum respond → run <strong>Optimize for CI</strong> once.</li>
        <li><strong>Bass Focus</strong> → <strong>Music mode</strong> → toggle <strong>Bypass Enhancement</strong>; listen for bass pitch/contour and kick definition.</li>
        <li><strong>Melody / Harmony</strong> → toggle bypass; listen for lead contour, chord separation, and upper-harmonic clarity.</li>
        <li><strong>Full Mix</strong> → Play with Loop on → loudness-matched bypass A/B for the whole-chain music demo.</li>
        <li>Optional: enable diagnostic vocoder at 50–100% simulated blend to hear CI-like smearing (developer tool, not clinical proof).</li>
        <li>Load your own library files for genre-specific tuning — demos are starting points only.</li>
      </ol>
      <p>All built-in demos regenerate from code on page reload (playlist remembers names and order). Loop is enabled automatically when you load any demo.</p>
      <p><strong>Your own files</strong> — use <strong>Choose Audio File</strong> or <strong>Add files to queue…</strong> for real-world genre testing. See ⓘ <strong>Your uploaded audio</strong> for what to upload and why.</p>
    `
  },
  'user-audio': {
    title: 'Your Uploaded Audio',
    body: `
      <p>This app is a <strong>music pre-processor</strong> for material you already stream to a CI — not a speech-therapy tool. Built-in demos are synthetic probes; <strong>your uploaded music</strong> is how you test real listening material and genre-specific tuning.</p>
      <h4>What it is</h4>
      <p>Any common audio file from your device (MP3, WAV, FLAC, M4A, etc.). Decoding runs entirely in the browser — files are <strong>not uploaded</strong> to a server. The full file is held in memory for playback, optimization, and WAV export.</p>
      <h4>Why use your own files</h4>
      <ul>
        <li><strong>Genre</strong> — electronic, classical, jazz, rock, pop, acoustic, and film-score material stress different bands; demos cannot cover your library.</li>
        <li><strong>Mix / mastering</strong> — commercial loudness, stereo width, and sub-bass vary; tuning should match what you actually stream.</li>
        <li><strong>Validation</strong> — stakeholders and study protocols need recognizable material, not only synthetic fixtures.</li>
        <li><strong>Playlist workflow</strong> — queue several uploads and auto-advance when Loop is off.</li>
      </ul>
      <h4>Best uploads for testing this music DSP</h4>
      <ul>
        <li><strong>Bass-heavy tracks</strong> — electronic, hip-hop, pop, organ, or bass guitar passages with notes below ~100 Hz. Listen for bass pitch/contour becoming easier to follow, not just louder.</li>
        <li><strong>Melody-forward tracks</strong> — lead guitar, violin, piano melody, synth lead, or vocal-free instrumental hooks. Listen for contour, note attacks, and whether the tune is easier to track.</li>
        <li><strong>Harmony-rich tracks</strong> — piano, guitar chords, strings, jazz voicings, or layered synth pads. Listen for chord separation and reduced smear.</li>
        <li><strong>Dense full mixes</strong> — rock/pop choruses with drums, bass, chords, and lead together. Listen for whether the enhancement helps musical organization without harshness.</li>
        <li><strong>Dynamic acoustic music</strong> — classical, jazz trio, acoustic guitar, or lightly mastered material. Listen for timbre and dynamics, and compare genre presets.</li>
        <li><strong>Familiar personal tracks</strong> — songs the listener knows well. Recognition matters: if the listener knows the bassline or melody, A/B differences are easier to judge.</li>
      </ul>
      <p>Avoid judging only from one song. A good music test set includes at least one bass-heavy track, one melody-forward track, one harmony-rich track, and one dense full mix.</p>
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
      <p>Uploaded file <strong>audio is not persisted</strong> — only names and order in sessionStorage. Re-select files from disk. Built-in demos (<strong>DSP Check</strong>, <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, <strong>Full Mix</strong>) regenerate automatically.</p>
      <h4>Demos vs uploads — quick pick</h4>
      <ul>
        <li><strong>DSP Check</strong> — verify meters, auto-tune, and visualizations (engineering).</li>
        <li><strong>Bass Focus</strong> — test bass restoration and missing-fundamental cues.</li>
        <li><strong>Melody / Harmony</strong> — test pitch contour, chords, timbre, and high-frequency clarity.</li>
        <li><strong>Full Mix</strong> — hear the complete music-processing chain with Music mode vs bypass.</li>
        <li><strong>Your files</strong> — real tuning and export for listening on implant hardware or standard streaming chains.</li>
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
      <p>Tip: load <strong>Full Mix</strong>, <strong>Bass Focus</strong>, or your own track, set In/Out on the section you care about, then optimize — results apply to the whole chain when you play.</p>
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
      <p>Applies to stereo files and live microphone input. Mono files are unaffected. Export uses the same width setting. Try <strong>Full Mix</strong> or <strong>Melody / Harmony</strong> at 0% vs 50% width — chords and lead are panned L/R.</p>
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
      <p>When <strong>Loop</strong> is off, playback advances to the next queue item automatically. Queue metadata persists in sessionStorage for the browser tab; re-add file items after a full page reload. Built-in demos (<strong>DSP Check</strong>, <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, <strong>Full Mix</strong>) regenerate from code — queue them to move from engineering check to targeted music probes to full-mix A/B.</p>
    `
  },
  'session-snapshot': {
    title: 'Session Snapshot JSON',
    body: `
      <p>Export or import all tuning settings as one JSON file — enhancement sliders, MAP profile, preset/mode, vocoder, stereo width, viz controls, and loop preference.</p>
      <ul>
        <li><strong>Export session JSON</strong> — Tools ▾ in the nav bar.</li>
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
    title: 'Layout, Mobile & PWA',
    body: `
      <p>The interface adapts to the screen it runs on — phone, tablet, laptop, or desktop — in any modern browser (Chrome, Safari, Firefox, Edge) on macOS, Windows, iOS, or Android.</p>
      <h4>On phones and narrow windows</h4>
      <ul>
        <li><strong>🔊 Start Audio Engine</strong> — on Safari and iPhone/iPad, tap this button (top of the Transport panel) once before playing. iOS only unlocks sound from a direct tap; the button hides itself afterward.</li>
        <li><strong>☰ Menu button</strong> — the top menus collapse into a single <strong>☰ Menu</strong> button. Tap it to open the menu list, tap a section (Using the App, Science, For Industry, Roadmap, Tools) to expand it, then pick an item. Tapping a choice or anywhere outside closes the menu.</li>
        <li><strong>Single-column stack</strong> — panels stack vertically and fill the width.</li>
        <li><strong>Sticky transport bar</strong> — playback controls stay reachable while scrolling.</li>
        <li><strong>44px touch targets</strong> — buttons and sliders are finger-sized; the small ⓘ icons keep a 44px tappable area even though they look small.</li>
        <li><strong>PWA manifest</strong> — add to home screen on iOS/Android for a standalone app icon (<code>manifest.json</code>).</li>
      </ul>
      <h4>On wide screens (laptop / desktop)</h4>
      <ul>
        <li><strong>Two-column dashboard</strong> — at about 1100px and wider, the transport and the 16-channel visualizer span the full width, and the control panels arrange into two columns to use the space and cut scrolling.</li>
        <li><strong>Full menu bar</strong> — the dropdown menus appear inline instead of behind the ☰ button.</li>
      </ul>
      <h4>Everywhere</h4>
      <ul>
        <li><strong>Collapsible panels</strong> — ▾ on each section heading; state is saved in localStorage. <strong>CI Auto-Tune</strong>, <strong>Electrode Map</strong>, and <strong>Diagnostic Vocoder</strong> start collapsed on first visit to keep the first screen focused.</li>
        <li><strong>Light / dark theme</strong> — the ☀ / 🌙 toggle persists your choice.</li>
        <li><strong>Print / save as PDF</strong> — every in-app document (Instructions, FAQ, Help, the Science and Industry guides) has a <strong>⎙ Print / PDF</strong> button that exports a clean, light-background copy.</li>
      </ul>
      <p>Safe-area insets are respected for notched devices. ES modules still require HTTP — use a local server or deployed URL, not <code>file://</code>.</p>
    `
  },
  'enhancement-controls': {
    title: 'Enhancement Controls Overview',
    body: `
      <p>These sliders adjust the live Web Audio processing chain. The optimization target is <strong>salience after CI re-coding</strong> — rhythm, melody, consonants, and separability under ~16 channels — rather than natural timbre on conventional speakers.</p>
      <p><strong>Speech / Music mode</strong> — quick-switch buttons apply built-in profiles; choice is remembered between sessions. For this music-focused demo, use <strong>Full Mix</strong>, <strong>Bass Focus</strong>, or <strong>Melody / Harmony</strong> with <strong>Music mode</strong> for A/B. Speech mode remains available as a contrast/reference preset, not the main product goal.</p>
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
      <nav class="doc-toc">
        <strong>On this page</strong>
        <ul>
          <li><a href="#new-here">New here?</a></li>
          <li><a href="#quick-start">Quick start</a></li>
          <li><a href="#eng-check">Engineering check</a></li>
          <li><a href="#playlist">Playlist workflow</a></li>
          <li><a href="#full-workflow">Full workflow</a></li>
          <li><a href="#demos-only">Demos only</a></li>
          <li><a href="#study">Study &amp; research</a></li>
          <li><a href="#reference">Interface reference</a></li>
        </ul>
      </nav>
      <h3 id="help-new-here">New here?</h3>
      <p>This is a <strong>music pre-processor</strong> for material you stream to a cochlear implant — not a speech-therapy or clinical MAP-fitting tool. The blue callout under the title shows the fastest path: <strong>Full Mix</strong> → <strong>Play</strong> → toggle <strong>Bypass Enhancement</strong> (with <strong>Loudness-match when bypassing</strong> on). Every panel and major control has a ⓘ icon; <strong>For Industry ▾</strong> links the overview, PDF, and technical paper. On wide screens the control panels arrange in two columns; on phones use the <strong>☰ Menu</strong> button for docs.</p>
      <h3 id="help-quick-start">Quick start (Full Mix demo)</h3>
      <ol>
        <li><strong>Full Mix</strong> — 8-second stereo groove; loop starts automatically; appears in the playlist as <em>Demo — Full Mix (8 s)</em>.</li>
        <li><strong>Play</strong> — enhancement is active by default.</li>
        <li><strong>Music mode</strong> — one-click preset tuned for rhythm, bass salience, melody clarity, and timbre.</li>
        <li><strong>A/B</strong> — enable <strong>Loudness-match when bypassing</strong>, then toggle <strong>Bypass Enhancement</strong> with Loop on.</li>
        <li>Optional: <strong>Optimize for CI</strong> on this clip, then re-compare bypass vs enhanced.</li>
      </ol>
      <h3 id="help-targeted-music">Targeted music probes</h3>
      <ol>
        <li><strong>Bass Focus</strong> — listen for bass pitch/contour, kick definition, and low-mid harmonic cues with bypass on/off.</li>
        <li><strong>Melody / Harmony</strong> — listen for lead contour, chord separation, note attacks, and upper-harmonic clarity.</li>
        <li><strong>Full Mix</strong> — use after the probes to judge whether the complete chain improves musical organization.</li>
      </ol>
      <h3 id="help-eng-check">Engineering check (DSP Check demo)</h3>
      <ol>
        <li><strong>DSP Check</strong> — 4-second mono fixture; confirms each DSP stage and meter.</li>
        <li>Watch <strong>GR meters</strong>, <strong>band energy</strong>, and <strong>enhancement profile</strong> while looping.</li>
        <li>Run <strong>Optimize for CI</strong> once to verify auto-tune and metric cards.</li>
      </ol>
      <h3 id="help-playlist">Playlist workflow</h3>
      <ol>
        <li><strong>Add files to queue…</strong> — multi-select to build a playlist without stopping playback.</li>
        <li><strong>Click a row</strong> in the playlist to switch tracks.</li>
        <li>Turn <strong>Loop</strong> off to auto-advance to the next track when a song ends.</li>
        <li>After a full page reload, re-add file items (built-in demos regenerate automatically).</li>
      </ol>
      <h3 id="help-full-workflow">Full workflow (your uploaded audio)</h3>
      <ol>
        <li><strong>Choose Audio File</strong> — your MP3/WAV/FLAC from disk (see ⓘ <strong>Your uploaded audio</strong> — why demos are not enough for final tuning).</li>
        <li><strong>Optimize region</strong> — set In/Out under the scrubber on a representative chorus or verse (≥ 4 s).</li>
        <li><strong>Electrode map</strong> — select a preset or import participant JSON.</li>
        <li><strong>Optimize for CI</strong> — ~30–90 s; metric cards should show numeric scores.</li>
        <li><strong>Compare presets</strong> — compare Music, Classical, Rock, Jazz, or saved profiles, then fine-tune; use <strong>Undo</strong> while exploring.</li>
        <li><strong>A/B</strong> — <strong>Loudness-match when bypassing</strong> + Bypass Enhancement.</li>
        <li><strong>Export</strong> — WAV per track + session JSON for settings.</li>
      </ol>
      <h3 id="help-demos-only">Demos only (no upload yet)</h3>
      <ol>
        <li><strong>DSP Check</strong>, <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, or <strong>Full Mix</strong> — instant material; see ⓘ <strong>Built-in demo tracks</strong>.</li>
        <li><strong>Stereo width</strong> — try <strong>Full Mix</strong> or <strong>Melody / Harmony</strong> at 0% vs 50%.</li>
        <li><strong>Loop and scrub</strong> — Loop for repeated passages; −5s/+5s to focus.</li>
      </ol>
      <h3 id="help-study">Study and research preparation</h3>
      <ol>
        <li>Import participant JSON map (center frequencies, dead electrodes) from clinical records.</li>
        <li>Run Optimize on representative stimuli per genre; export map JSON, preset JSON, and session JSON.</li>
        <li>Export processed (and optionally vocoded) WAV per stimulus.</li>
        <li>Record metric deltas and winning parameter sets per track.</li>
        <li>At 100% vocoder simulation, confirm bypass A/B results align with metric predictions.</li>
        <li>Clinical validation requires streaming processed audio to the participant's implant hardware; the vocoder is a development proxy only.</li>
      </ol>
      <h3 id="help-reference">Interface reference</h3>
      <ul>
        <li><strong>Quick-start callout</strong> — numbered steps under the title; tap <strong>Full instructions</strong> for this document.</li>
        <li><strong>☰ Menu</strong> (phones) / inline menus (desktop) — <strong>Using the App ▾</strong> (how-to, FAQ, help), <strong>Science ▾</strong>, <strong>For Industry ▾</strong> (partnership + developer guides, downloadable overview/PDF/paper), <strong>Roadmap ▾</strong>, <strong>Tools ▾</strong> (session JSON).</li>
        <li><strong>Two-column layout</strong> — on screens about 1100px wide, control panels sit side-by-side; transport and the 16-channel visualizer stay full width.</li>
        <li><strong>Collapsible panels</strong> — ▾ on section headings; Auto-Tune, Electrode Map, and Diagnostic Vocoder start collapsed on first visit. State is remembered.</li>
        <li><strong>⎙ Print / PDF</strong> — every in-app document modal has a print button for a clean, shareable copy.</li>
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
        <dt>No sound on Safari / iPhone, or you have to tap a button twice</dt>
        <dd>Tap the blue <strong>🔊 Start Audio Engine</strong> button at the top of the Transport panel first — this unlocks audio inside a direct tap, which Safari and iOS require. The button disappears once audio is enabled. Then load a demo and press <strong>Play</strong>. Chrome and Edge usually don’t need it, but it’s safe to tap on any browser.</dd>
        <dt>Demo load error: Audio output is blocked (context state: interrupted)</dt>
        <dd><strong>Safari</strong> uses a non-standard <code>interrupted</code> audio state. Tap <strong>🔊 Start Audio Engine</strong> (or <strong>Play</strong>) to unlock audio, then load the demo again. If sound stops after a phone call or switching apps, tap <strong>Start Audio Engine</strong> again. After a code update, hard-refresh (<strong>Cmd+Shift+R</strong>). Chrome and Edge are less prone to this message.</dd>
        <dt>No sound after loading</dt>
        <dd>Playback requires a user gesture (click Play). Check Volume in the transport bar — confirm it is not set to −24 dB.</dd>
        <dt>Visualizations unchanged when moving sliders</dt>
        <dd>When paused, gold preview bars should update immediately. When playing, blue live bars reflect audio energy. The enhancement profile and band energy meters show time-averaged comparisons — use <strong>Reset meter averages</strong> after big setting changes. GR meters show live compression when playing.</dd>
        <dt>Profile / band meters seem static during playback</dt>
        <dd>Expected for steady presets — enhancement mostly applies a consistent reshape. Lower <strong>Meter stability</strong> for faster response, or watch GR meters for dynamics. Change sliders while paused to see the gold preview jump immediately.</dd>
        <dt>Blue spectrum bars flat during playback</dt>
        <dd>Confirm the status pill reads PLAYING and Volume is sufficient. Hard-refresh the page (Cmd+Shift+R). Test with <strong>Full Mix</strong> or <strong>DSP Check</strong>.</dd>
        <dt>Auto-tune complete but metric cards show dashes (—)</dt>
        <dd>Indicates a failed optimization run. Hard-refresh and re-run Optimize. Composite scores typically display values in the 3.5–6.0 range.</dd>
        <dt>Vocoder at 100% silent or very quiet</dt>
        <dd>Expected output is a buzzy, band-limited signal. Increase Volume or reduce blend to 50% initially. Hard-refresh if the issue persists.</dd>
        <dt>Optimize button disabled</dt>
        <dd>Load an audio file or a built-in demo (<strong>DSP Check</strong>, <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, or <strong>Full Mix</strong>) first.</dd>
        <dt>Optimization slow</dt>
        <dd>625 combinations over a 12-second segment is CPU-intensive. Typical duration is 30–90 s depending on hardware.</dd>
        <dt>Playlist item shows unavailable after reload</dt>
        <dd>File audio buffers are not persisted across full page reloads — only names and order in sessionStorage. Re-add files with <strong>Add files to queue…</strong> or <strong>Choose Audio File</strong>. Built-in demos (<strong>DSP Check</strong>, <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, <strong>Full Mix</strong>) regenerate from code automatically.</dd>
        <dt>Session import failed</dt>
        <dd>Ensure the JSON was exported from this app (version 1 snapshot). Import restores settings only — load audio separately afterward.</dd>
        <dt>Export sounds different from live playback</dt>
        <dd>Offline render uses <code>offlinePipeline.js</code>; live graph uses Web Audio nodes. Small differences are expected. Optional vocoder export uses the offline vocoder mirror. See Roadmap: offline pipeline parity test.</dd>
        <dt>Demo track too loud</dt>
        <dd>Lower transport Volume (default 0 dB). Demo synthesis levels are reduced, but enhancement makeup gain can still feel loud.</dd>
      </dl>
      <h3>Browser support</h3>
      <p>Chrome, Edge, Firefox, and Safari on macOS, Windows, iOS, and Android. Chrome or Edge recommended for development. <strong>Safari</strong> may show an <code>interrupted</code> audio state until you tap Play — see troubleshooting above. The layout adapts automatically: ☰ Menu on phones, two-column dashboard on wide screens. Transposition uses ring modulation in the live graph; AudioWorklet is not required.</p>
      <h3>Privacy</h3>
      <p>All processing occurs locally in the browser. Audio is not uploaded. Presets, theme, content mode, panel collapse state, and viz settings use localStorage; playlist names use sessionStorage.</p>
      <h3>For researchers</h3>
      <p>Source code is included in the repository. See the <a href="paper.html" target="_blank">Technical Paper</a> for collaboration protocols. Planned study features are listed under <strong>Roadmap ▾</strong>.</p>
    `
  },
  faq: {
    title: 'Frequently Asked Questions',
    body: `
      <nav class="doc-toc">
        <strong>Jump to a topic</strong>
        <ul>
          <li><a href="#faq-using">Using the app, demos &amp; A/B</a></li>
          <li><a href="#faq-viz">Visualizers &amp; meters</a></li>
          <li><a href="#faq-science">Concept &amp; science</a></li>
          <li><a href="#faq-clinical">Clinical &amp; regulatory</a></li>
          <li><a href="#faq-industry">Industry &amp; developers</a></li>
          <li><a href="#faq-research">Roadmap &amp; research</a></li>
        </ul>
      </nav>

      <h3 id="help-faq-using">Using the app, demos &amp; A/B</h3>
      <div class="faq-item"><h4>Which demo should I use first?</h4>
      <p>Start with <strong>Full Mix</strong> if you want the fastest whole-chain music A/B (Music mode vs bypass). Use <strong>Bass Focus</strong> for bass restoration, <strong>Melody / Harmony</strong> for pitch/chord/timbre clarity, and <strong>DSP Check</strong> for meters, auto-tune, or visualization behavior. Queue them in that order for a structured demo.</p></div>
      <div class="faq-item"><h4>What is the difference between demo tracks and my uploaded files?</h4>
      <p>The built-in demos are synthetic, in-browser music fixtures — no upload, always available, regenerate after reload. <strong>DSP Check</strong> verifies the engineering path; <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, and <strong>Full Mix</strong> demonstrate different music-processing problems. <strong>Your uploaded files</strong> are real library material for genre-specific tuning and WAV export; they stay in memory only until you reload the page. See ⓘ <strong>Built-in demo tracks</strong> and ⓘ <strong>Your uploaded audio</strong>.</p></div>
      <div class="faq-item"><h4>What are the built-in music demos?</h4>
      <p><strong>DSP Check</strong> is an engineering fixture. <strong>Bass Focus</strong> isolates low fundamentals and missing-fundamental cues. <strong>Melody / Harmony</strong> foregrounds lead contour, chord separation, and timbre. <strong>Full Mix</strong> combines bass, drums, chords, lead, and stereo panning for a complete Music mode vs bypass A/B. See ⓘ <strong>Built-in demo tracks</strong> for the full how and why.</p></div>
      <div class="faq-item"><h4>How do Speech mode and Music mode buttons work?</h4>
      <p>They apply the built-in Speech or Music presets in one click. Your choice is saved in localStorage. Moving any slider manually switches to Custom (current).</p></div>
      <div class="faq-item"><h4>What is the playlist for?</h4>
      <p>Queue multiple tracks and auto-advance when Loop is off — useful for tuning across a library without re-uploading each file. Names persist in the tab; re-add files after a full page reload. Built-in demos regenerate automatically.</p></div>
      <div class="faq-item"><h4>What does stereo width do?</h4>
      <p>Collapses stereo toward mono before enhancement — default 0% for unilateral CI users. 100% retains more side information before the mono processing bus. Applies to export as well.</p></div>
      <div class="faq-item"><h4>Can I use this on a phone?</h4>
      <p>Yes — on phones the menus collapse into a single <strong>☰ Menu</strong> button, panels stack in one column, the transport bar stays sticky, and buttons/sliders use 44px touch targets. <strong>On Safari/iPhone, tap 🔊 Start Audio Engine once</strong> before playing (iOS only unlocks sound from a direct tap). On laptops and desktops the same page expands into a two-column dashboard. It works in Chrome, Safari, Firefox, and Edge on macOS, Windows, iOS, and Android. Add to home screen via the PWA manifest for a standalone icon. ES modules still require HTTP (local server or deployed URL), not <code>file://</code>.</p></div>
      <div class="faq-item"><h4>What is Optimize region (In / Out)?</h4>
      <p>Sliders under the transport scrubber bracket the section of your track that <strong>Optimize for CI</strong> analyzes (4–12 seconds). Default (full track) uses the center 12 seconds. Useful on long songs — set In/Out on a chorus before optimizing.</p></div>
      <div class="faq-item"><h4>What is Loudness-match when bypassing?</h4>
      <p>When checked (default), toggling <strong>Bypass Enhancement</strong> temporarily adjusts the raw path so level matches the enhanced path — a fairer A/B for quality, not just loudness. Uncheck for level-accurate raw vs enhanced.</p></div>
      <div class="faq-item"><h4>What does Compare presets do?</h4>
      <p>Opens a table showing how harmonic drive, compression threshold, clarity lift, and transpose mix differ between any two presets. Use it to compare Music, Classical, Rock, Jazz, saved profiles, or the Speech reference preset before fine-tuning sliders.</p></div>
      <div class="faq-item"><h4>Can I undo slider changes?</h4>
      <p>Yes — <strong>Undo</strong> / <strong>Redo</strong> buttons (or ⌘/Ctrl+Z and ⇧⌘/Ctrl+Z) step through manual slider edits. History clears when you load a preset or import a session JSON.</p></div>
      <div class="faq-item"><h4>Can I save or print the in-app guides?</h4>
      <p>Yes — every in-app document (Instructions, FAQ, Help, Background, Technical chain, Industry &amp; partnership guide, Cochlear platform developer guide) has a <strong>⎙ Print / PDF</strong> button in the modal header. It opens your browser’s print dialog so you can save a clean PDF or paper copy. The one-page overview and technical paper also have print buttons on their web pages; the overview PDF is additionally available under <strong>For Industry ▾</strong>.</p></div>
      <div class="faq-item"><h4>Why does the layout look different on my laptop vs my phone?</h4>
      <p>By design. On phones, menus collapse behind <strong>☰ Menu</strong> and panels stack in one column with a sticky transport bar. On screens about 1100px wide, the same page expands into a <strong>two-column dashboard</strong> (transport + visualizer full width; control panels side-by-side). Collapsible sections remember whether you left them open. See ⓘ <strong>Layout, Mobile &amp; PWA</strong> in the quick-start callout.</p></div>
      <div class="faq-item"><h4>What is session JSON export?</h4>
      <p>Under <strong>Tools ▾</strong>, exports all settings (sliders, MAP, vocoder, stereo width, viz) as one JSON file for study reproducibility. It does not include audio — pair with WAV export per track.</p></div>

      <h3 id="help-faq-viz">Visualizers &amp; meters</h3>
      <div class="faq-item"><h4>Why are there two colors in the spectrum display?</h4>
      <p>Gray is the unprocessed input; blue (live) or gold (preview) is after enhancement. Narrow inner bars sit in front of wide gray bars so you can see exactly where the engine adds or removes energy.</p></div>
      <div class="faq-item"><h4>Why don’t the profile and band meters scroll like a timeline?</h4>
      <p>Most settings apply a steady overall change (EQ curve, compression ratio, MAP shape) — not second-by-second variation. Scrolling traces were hard to read and misleading. The app now shows large band comparison bars and a fixed-scale enhancement profile, time-averaged during playback. Live compression dynamics appear in the GR meters.</p></div>

      <h3 id="help-faq-science">Concept &amp; science</h3>
      <div class="faq-item"><h4>Is this equivalent to EQ and compression?</h4>
      <p>Partially — but the optimization target differs. Phone EQ prioritizes pleasant playback on speakers. This engine prioritizes separability and salience after CI-like re-coding. It includes harmonic generation (not level boost alone), ring-mod frequency transposition, MAP-aware shaping, vocoder-in-the-loop auto-tune, and control-linked visualizations.</p></div>
      <div class="faq-item"><h4>Is this app for speech understanding?</h4>
      <p>No — manufacturer CI apps and clinical MAP fitting already target speech. This engine is a <strong>music pre-processor</strong> upstream of wireless streaming: bass harmonic substitution, multi-band compression, clarity lift, and transposition for rhythm, melody, and separability. <strong>Speech mode</strong> is a preset name for mixes with prominent vocals, not a replacement for clinical speech processing.</p></div>
      <div class="faq-item"><h4>How does harmonic excitation relate to the overtone series?</h4>
      <p>Non-linear distortion on sub-bass generates integer harmonics (2f, 3f, …) in perceptible bands. The listener may not resolve the fundamental; the perceptual correlate is new spectral energy in electrode-usable regions that preserves rhythm and pitch-class structure.</p></div>
      <div class="faq-item"><h4>How do Speech and Music presets differ?</h4>
      <p>Speech: lower harmonic drive, higher clarity lift, less transposition — favors intelligibility. Music: higher harmonic drive, heavier compression, more transposition — favors rhythm and timbral salience.</p></div>

      <h3 id="help-faq-clinical">Clinical &amp; regulatory</h3>
      <div class="faq-item"><h4>Is this a medical device or cleared for clinical use?</h4>
      <p>No. This is an <strong>evaluation proof-of-concept</strong> and open reference implementation for industry R&amp;D, audiologists, and researchers. It is not FDA- or CE-marked, not a clinical diagnostic, and does not replace manufacturer MAP fitting or speech programs. Listener studies on implant hardware are required before efficacy claims.</p></div>
      <div class="faq-item"><h4>Why is this processing not available in manufacturer CI apps?</h4>
      <p>Manufacturer applications focus on clinical fitting, speech programs, and implant safety. Aggressive music pre-processing upstream of the envelope coder requires validation against each manufacturer's coding strategy.</p></div>
      <div class="faq-item"><h4>Can clinical MAP files be imported directly?</h4>
      <p>Proprietary MAP formats are not supported. JSON import accepts center frequencies from clinical records, or literature-based presets can be used. Audiogram CSV import is planned (see Roadmap).</p></div>
      <div class="faq-item"><h4>Does the diagnostic vocoder demonstrate clinical benefit?</h4>
      <p>The vocoder is an engineering surrogate only. Clinical benefit requires listener studies with processed audio streamed to actual implants.</p></div>

      <h3 id="help-faq-industry">Industry &amp; developers</h3>
      <div class="faq-item"><h4>How does this relate to manufacturer companion apps (e.g. streaming / fitting apps)?</h4>
      <p>Manufacturer apps handle clinical fitting, programs, device management, and speech-oriented features. This engine adds an <strong>upstream music mastering layer</strong> on the phone before Bluetooth streaming — a gap typical companion apps do not address today. See <strong>For Industry ▾ → Industry &amp; partnership guide</strong>.</p></div>
      <div class="faq-item"><h4>What would a manufacturer partnership look like?</h4>
      <p>Phase A: technical evaluation with this browser demo. Phase B: blind listener study streaming processed audio to participant hardware. Phase C: port DSP to native iOS/Android in the companion app, validated proprietary MAP import, and market-specific regulatory review. Algorithms and presets transfer; the browser shell does not.</p></div>
      <div class="faq-item"><h4>Does this apply to Osia®, Baha®, or Cochlear™ CoPilot?</h4>
      <p><strong>Primary target:</strong> cochlear-implant direct streaming (Nucleus® / Kanso® processors via Nucleus® Smart App). <strong>CoPilot</strong> is rehabilitation-only — no audio insertion point. <strong>Osia</strong> and <strong>Baha</strong> use different sound paths and apps; this 16-channel CI vocoder reference is <strong>not validated</strong> for those lines without separate work. See <strong>For Industry ▾ → Cochlear platform developer guide</strong>.</p></div>
      <div class="faq-item"><h4>Where would a Nucleus Smart App engineer hook this in?</h4>
      <p>On the phone, <strong>before</strong> media audio is routed to the MFi (iOS) or ASHA (Android) CI streaming path — upstream of processor firmware. Port <code>audioGraph.js</code> to a native real-time graph; do not embed the WebView demo or modify implant coding. Details in the developer guide.</p></div>

      <h3 id="help-faq-research">Roadmap &amp; research</h3>
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
      <p>This engine implements multi-band compression, harmonic bass excitation, clarity lift, ring-mod transposition, MAP shaping, profile-based visualizers, a synthetic music demo battery (<strong>DSP Check</strong>, <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, <strong>Full Mix</strong>), playlist queue, session JSON, stereo width control, Speech/Music mode memory, optimize region, loudness-matched A/B, compare presets, undo/redo, microphone input, WAV export (optional vocoder), mobile collapsible UI, PWA manifest, and offline vocoder-in-the-loop optimization.</p>
      <p><a href="paper.html" target="_blank"><strong>Technical paper →</strong></a> Signal-chain diagrams, overtone-series mechanism, double-compression theory, validation phases, and research collaboration guidelines. See <strong>For Industry ▾ → Industry &amp; partnership guide</strong> (commercial) and <strong>Cochlear platform developer guide</strong> (companion-app engineering).</p>
    `
  },
  industry: {
    title: 'Industry & Partnership Guide',
    body: `
      <p><em>For manufacturer marketing, sales, clinical affairs, and R&amp;D teams evaluating upstream music pre-processing — e.g. implant makers and their companion-app organizations. Mobile engineers: see also <strong>Cochlear platform developer guide</strong> in this menu.</em></p>
      <nav class="doc-toc">
        <strong>On this page</strong>
        <ul>
          <li><a href="#ind-summary">Executive summary</a></li>
          <li><a href="#ind-ecosystem">Where it sits</a></li>
          <li><a href="#ind-isnot">Is / is not</a></li>
          <li><a href="#ind-demo">5-minute demo script</a></li>
          <li><a href="#ind-eq">Why not just EQ?</a></li>
          <li><a href="#ind-path">Partnership path</a></li>
          <li><a href="#ind-evidence">Evidence package</a></li>
          <li><a href="#ind-privacy">Privacy &amp; data</a></li>
          <li><a href="#ind-questions">Commercial questions</a></li>
          <li><a href="#ind-docs">External documents</a></li>
        </ul>
      </nav>
      <h3 id="help-ind-summary">Executive summary</h3>
      <p>The CI Audio Enhancement Engine is a <strong>music pre-processor</strong> that runs on the phone <strong>before</strong> audio is wirelessly streamed to a sound processor. It does not modify implant firmware, clinical MAP fitting, or manufacturer safety systems. The browser app is an <strong>evaluation reference</strong>; production value is the DSP methodology, presets, MAP-aware shaping, and vocoder-in-the-loop auto-tune — portable to a native module inside a manufacturer companion app.</p>
      <h3 id="help-ind-ecosystem">Where it sits in your product ecosystem</h3>
      <ul>
        <li><strong>Manufacturer companion apps</strong> (fitting, programs, streaming control, remote care) — remain the system of record for clinical settings and device management.</li>
        <li><strong>This engine</strong> — optional upstream layer on streamed music: harmonic bass substitution, MAP-weighted shaping, pre-compression, transposition, and genre presets tuned for envelope-coded hearing.</li>
        <li><strong>Sound processor</strong> — unchanged; receives pre-conditioned audio via existing Bluetooth / Auracast / accessory paths.</li>
      </ul>
      <p>Positioning: <strong>complements</strong> speech-first programs and clinical MAP workflows; targets the documented <strong>music-enjoyment gap</strong> without replacing audiologist fitting.</p>
      <h3 id="help-ind-isnot">What this is — and is not</h3>
      <table class="compare" style="width:100%;font-size:0.9em">
        <tr><th>Is</th><th>Is not</th></tr>
        <tr><td>Evaluation POC + open reference implementation</td><td>FDA / CE-marked medical device or clinical diagnostic</td></tr>
        <tr><td>Upstream mastering for music streaming</td><td>Replacement for clinical MAP fitting or speech processors</td></tr>
        <tr><td>On-device processing; no audio cloud upload</td><td>Affiliated with or endorsed by any implant manufacturer</td></tr>
        <tr><td>Engineering vocoder surrogate for R&amp;D tuning</td><td>Validated predictor of individual listener outcomes (yet)</td></tr>
      </table>
      <h3 id="help-ind-demo">5-minute live demo script (for stakeholder meetings)</h3>
      <ol>
        <li>Open deployed demo URL or local server — confirm status line is ready (not an initialization error).</li>
        <li><strong>Full Mix</strong> → <strong>Play</strong> → <strong>Music mode</strong> — “This is the whole-chain music demo; rhythm, bass salience, melody, and separation are the design targets, not speaker fidelity.”</li>
        <li><strong>Bass Focus</strong> and <strong>Melody / Harmony</strong> — show targeted probes for the two hardest music questions: low-frequency foundation and pitch/chord clarity.</li>
        <li>Enable <strong>Loudness-match when bypassing</strong> → toggle <strong>Bypass Enhancement</strong> with Loop on — fair A/B vs raw stream.</li>
        <li><strong>Compare presets</strong> — show Music, Classical, Rock, Jazz, saved profiles, or the Speech reference preset in one table.</li>
        <li>Optional: <strong>Optimize for CI</strong> on Full Mix or Bass Focus (~30–90 s) — metric cards show vocoder-surrogate scores (engineering proxy, not clinical endpoints).</li>
        <li>Close with <strong>For Industry ▾ → Download overview (PDF)</strong> and <strong>Technical paper</strong> for R&amp;D follow-up.</li>
      </ol>
      <h3 id="help-ind-eq">Why not “just add EQ” to the companion app?</h3>
      <p>Phone EQ optimizes timbre on speakers. CI users receive ~16–22 amplitude envelopes. This stack adds <strong>harmonic generation</strong> in usable bands, <strong>pre-compression</strong> before implant-side dynamics, <strong>frequency transposition</strong>, <strong>MAP-aware 16-channel shaping</strong>, and <strong>vocoder-in-the-loop parameter search</strong> — mechanisms a parametric EQ cannot replicate. See comparison table in the one-page overview.</p>
      <h3 id="help-ind-path">Partnership path (typical manufacturer integration)</h3>
      <ol>
        <li><strong>Phase A — Technical eval</strong> (now): browser demo, open codebase, internal listening with diagnostic vocoder; no patient data required.</li>
        <li><strong>Phase B — Pilot study</strong>: blind A/B on participant hardware (Bluetooth stream); MUSHRA / preference scales; participant MAP JSON from clinic (PHI — IRB required).</li>
        <li><strong>Phase C — Product integration</strong>: port DSP to native iOS/Android SDK; validated proprietary MAP import; music mode in companion app; regulatory pathway per market.</li>
      </ol>
      <p>Proprietary clinical MAP import (Cochlear, Advanced Bionics, MED-EL, etc.) requires manufacturer cooperation — see Roadmap ▾ <em>Proprietary MAP import</em>.</p>
      <h3 id="help-ind-evidence">Evidence package today</h3>
      <ul>
        <li>Working reference app with built-in demos, presets, session export, and WAV render.</li>
        <li>Technical paper: psychoacoustic rationale, signal chain, validation protocol (Phases A–C).</li>
        <li>Automated engineering checks (<code>npm test</code>): help/docs consistency + offline pipeline smoke test.</li>
        <li><strong>Not yet included:</strong> peer-reviewed listener outcomes, manufacturer-coder-specific validation, or regulatory clearance.</li>
      </ul>
      <h3 id="help-ind-privacy">Privacy &amp; data handling (for commercial / legal review)</h3>
      <ul>
        <li>Audio files and microphone input are processed <strong>locally in the browser</strong> — not uploaded to a server.</li>
        <li>Participant-specific electrode-map JSON may constitute <strong>PHI</strong> if it identifies a patient; handle under clinic IRB and data agreements.</li>
        <li>Session JSON exports contain tuning settings only — no audio buffers.</li>
      </ul>
      <h3 id="help-ind-questions">Common commercial questions</h3>
      <dl>
        <dt>Does this compete with our speech programs?</dt>
        <dd>No — it targets <strong>music streaming</strong> upstream. Speech programs and clinical MAP fitting remain authoritative for speech-in-noise and safety limits.</dd>
        <dt>Does it change implant firmware?</dt>
        <dd>No — preprocessing occurs on the phone before wireless delivery. Processor coding strategy is unchanged.</dd>
        <dt>Can we brand this as a “music mode”?</dt>
        <dd>Yes — that is the intended product concept: MAP-personalized music preprocessing inside the companion app, validated with your hardware and regulatory team.</dd>
        <dt>What would we license or port?</dt>
        <dd>Algorithms (harmonic excitation, transposition, MAP shaper, auto-tune grid), preset library, JSON MAP schema, and evaluation metrics — implemented natively, not as a WebView wrapper.</dd>
        <dt>What deliverables exist for due diligence?</dt>
        <dd>Live demo URL, one-page overview (PDF), technical paper, source repo, electrode-map template (<code>profiles/example-custom.json</code>), and in-app Roadmap with ✓ on completed items.</dd>
      </dl>
      <h3 id="help-ind-docs">External documents</h3>
      <p>Mobile / platform engineers: <strong>For Industry ▾ → Cochlear platform developer guide</strong> (product-line scope, native porting map, insertion point).</p>
      <p>
        <a href="overview.html" target="_blank">One-page overview</a> ·
        <a href="CI-Audio-Enhancement-Overview.pdf" download>Overview PDF</a> ·
        <a href="paper.html" target="_blank">Technical paper</a>
      </p>
    `
  },
  'industry-developer': {
    title: 'Cochlear Platform Developer Guide',
    body: `
      <p><em>For mobile, firmware, and audio engineers evaluating porting this reference stack into a manufacturer companion app — written against the Cochlear product portfolio as an illustrative example. Not affiliated with or endorsed by Cochlear Ltd.</em></p>
      <nav class="doc-toc">
        <strong>On this page</strong>
        <ul>
          <li><a href="#dev-portfolio">Product portfolio scope</a></li>
          <li><a href="#dev-insertion">Insertion point</a></li>
          <li><a href="#dev-existing">What the app already does</a></li>
          <li><a href="#dev-porting">Native porting map</a></li>
          <li><a href="#dev-platform">Platform considerations</a></li>
          <li><a href="#dev-validation">Validation matrix</a></li>
          <li><a href="#dev-nongoals">Non-goals (v1)</a></li>
          <li><a href="#dev-flags">Feature flag architecture</a></li>
          <li><a href="#dev-related">Related docs</a></li>
        </ul>
      </nav>
      <h3 id="help-dev-portfolio">Product portfolio — what this doc applies to</h3>
      <table class="compare" style="width:100%;font-size:0.88em">
        <tr><th>Cochlear product / app</th><th>Role today</th><th>Relevance to this engine</th></tr>
        <tr>
          <td><strong>Nucleus® Smart App</strong> + <strong>Nucleus®</strong> / <strong>Kanso® 2</strong> sound processors</td>
          <td>Device control, programs, volume, MFi / ASHA <strong>direct streaming</strong> of calls and media to CI processors</td>
          <td><strong>Primary integration target.</strong> Music pre-processing would run on the phone <em>before</em> audio is routed to the hearing-device / CI streaming path.</td>
        </tr>
        <tr>
          <td><strong>Kanso® 2 Sound Processor</strong></td>
          <td>Off-the-ear CI processor; paired and controlled via <strong>Nucleus Smart App</strong> (not a separate app)</td>
          <td>Same streaming insertion point as Nucleus 7/8 — processor firmware and SmartSound™ processing unchanged.</td>
        </tr>
        <tr>
          <td><strong>Cochlear™ CoPilot</strong> mobile app</td>
          <td>Rehabilitation / listening-skills education — no live audio path to hardware</td>
          <td><strong>Out of scope.</strong> No DSP insertion point; different product category.</td>
        </tr>
        <tr>
          <td><strong>Osia® Smart App</strong> + Osia® 2 processor</td>
          <td>Active bone-conduction implant; app control + True Wireless™ accessory streaming</td>
          <td><strong>Not validated by this reference.</strong> Different physiology and coding; would need Osia-specific study and DSP targets — not the 16-ch CI vocoder surrogate.</td>
        </tr>
        <tr>
          <td><strong>Baha® Smart App</strong> + Baha® 6 Max</td>
          <td>Bone-conduction device; in-app bass/mid/treble; True Wireless™ Streaming Hub</td>
          <td><strong>Not validated by this reference.</strong> Acoustic BC path ≠ cochlear envelope coding; separate product decision if similar ideas were explored.</td>
        </tr>
      </table>
      <p>Trademarks (Nucleus, Kanso, Osia, Baha, Cochlear, SmartSound, True Wireless) belong to their respective owners. This open reference is independent.</p>
      <h3 id="help-dev-insertion">Signal-chain insertion point (Nucleus / Kanso CI streaming)</h3>
      <pre class="chain-diagram">
Media app (Spotify, Apple Music, etc.)
  → OS audio mixer
  → [ INSERT: CI music pre-processor ]  ← this engine (native port)
  → MFi hearing-device route (iOS) / ASHA LE route (Android)
  → Nucleus / Kanso sound processor
  → SmartSound™ iQ + implant coding (unchanged in firmware)
      </pre>
      <p>The reference browser app uses <code>Web Audio API</code> (<code>audioGraph.js</code>) for the same logical chain ending at <code>AudioContext.destination</code>. In production you would tap <strong>before</strong> the platform routes audio to the paired CI processor, not inside processor firmware or over the clinic fitting radio link.</p>
      <h3 id="help-dev-existing">What Nucleus Smart App already does (do not duplicate)</h3>
      <ul>
        <li>Pairing, programs, volume, battery/status, Find My Processor, Sound Check</li>
        <li>Clinic-driven MAP / fitting outcomes reflected as <strong>processor programs</strong> (SmartSound iQ with SCAN, ForwardFocus, etc.)</li>
        <li>Streaming <strong>control plane</strong> — not per-sample media DSP on the music bus today</li>
      </ul>
      <p>This engine proposes a new <strong>media-plane</strong> feature: optional upstream mastering when the user streams music — complementary to existing programs, not a replacement for Custom Sound® fitting or clinical MAP tools.</p>
      <h3 id="help-dev-porting">Native porting map (reference → production module)</h3>
      <table class="compare" style="width:100%;font-size:0.88em">
        <tr><th>Reference module</th><th>Native target</th><th>Notes for app teams</th></tr>
        <tr><td><code>audioGraph.js</code></td><td>iOS <code>AVAudioEngine</code> graph; Android <code>Oboe</code> / <code>AAudio</code> or <code>AudioTrack</code> effects</td><td>Live playback path; meet real-time + battery budget on phone</td></tr>
        <tr><td><code>offlinePipeline.js</code></td><td>Offline bounce / export; optional background worker</td><td>Used by auto-tune and WAV export; can run off UI thread</td></tr>
        <tr><td><code>autoTuner.js</code> + <code>ciMetrics.js</code></td><td>Native worker / GCD queue; 625-combo search</td><td>CPU-heavy; gate on charger or user opt-in</td></tr>
        <tr><td><code>mapProfiles.js</code></td><td>Import from proprietary fitting store via <strong>partner API</strong></td><td>JSON template today; production needs validated MAP read path</td></tr>
        <tr><td><code>presets.js</code> / session snapshot</td><td>App settings bundle + cloud sync (if approved)</td><td>Align with existing Cochlear Account / device prefs patterns</td></tr>
        <tr><td><code>vocoderDiagnostic.js</code></td><td>R&amp;D / developer mode only</td><td>Do not ship as default user path without clinical review</td></tr>
        <tr><td><code>visualizer.js</code></td><td>Optional debug UI or stripped for production</td><td>Display-only; not required for shipped music mode</td></tr>
      </table>
      <h3 id="help-dev-platform">Platform engineering considerations</h3>
      <ul>
        <li><strong>iOS</strong> — Music enhancement must coexist with <code>MPRemoteCommandCenter</code>, Bluetooth handoff, and the MFi hearing-aid audio route. Test on devices paired to Nucleus 7/8 and Kanso 2; measure end-to-end latency vs lip-sync tolerance.</li>
        <li><strong>Android</strong> — ASHA direct streaming path differs from iOS; verify on Cochlear-published compatibility list. Audio focus and call interruption behavior must match existing Smart App patterns.</li>
        <li><strong>Scope of processing</strong> — Apply only to <strong>media / music streams</strong> the product intends to enhance — not telephony codecs, clinic fitting sessions, or accessory firmware update channels.</li>
        <li><strong>Stereo width default 0%</strong> — mono collapse before processing aligns with unilateral CI and many bimodal setups; preserve user override.</li>
        <li><strong>No cloud audio</strong> — processing on-device matches typical Cochlear privacy posture; MAP/fitting PHI stays in existing secure stores.</li>
        <li><strong>Regulatory</strong> — treat as new SaMD / feature under your QMS; this reference is not cleared software.</li>
      </ul>
      <h3 id="help-dev-validation">Validation matrix (what you would run internally)</h3>
      <ol>
        <li><strong>Functional</strong> — bit-exact or bounded-diff parity: native live graph vs <code>offlinePipeline.js</code> on golden files (<code>npm test</code> parity script is a starting pattern).</li>
        <li><strong>Hardware</strong> — blind A/B: raw vs enhanced media streamed to Nucleus / Kanso processors across SmartSound programs.</li>
        <li><strong>Coder interaction</strong> — confirm enhancement does not push levels that trigger unintended AGC / limiting on processor input.</li>
        <li><strong>Battery / thermal</strong> — auto-tune and continuous enhancement while streaming; Kanso 2 off-the-ear wearables are battery-sensitive.</li>
        <li><strong>Regression</strong> — pairing, ForwardFocus, accessory streaming, and firmware update flows unchanged.</li>
      </ol>
      <h3 id="help-dev-nongoals">Explicit non-goals for v1 integration</h3>
      <ul>
        <li>Modifying sound-processor firmware or implant MAP fitting tools</li>
        <li>Replacing SmartSound iQ / SCAN scene analysis on the processor</li>
        <li>Embedding a WebView of this demo as the production music feature</li>
        <li>Extending the same vocoder surrogate to Osia or Baha without separate validation</li>
        <li>CoPilot content or rehabilitation UX changes</li>
      </ul>
      <h3 id="help-dev-flags">Suggested feature flag architecture</h3>
      <pre class="chain-diagram">
UserSettings.musicEnhancementEnabled (default off in pilot)
  → load MAP-derived profile from clinical store OR literature preset
  → apply preset (Music / Speech / genre) + optional auto-tune on device
  → route processed PCM to existing CI streaming sink
  → telemetry: opt-in anonymized preset + outcome surveys (IRB / privacy review)
      </pre>
      <h3 id="help-dev-related">Related in-app docs</h3>
      <p>
        <strong>Industry &amp; partnership guide</strong> (commercial framing) ·
        <strong>Technical signal chain</strong> (module list) ·
        <a href="paper.html" target="_blank">Technical paper</a> (validation Phases A–C)
      </p>
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
        <li><strong>Built-in demos</strong> — <code>demoTrack.js</code> generates <strong>DSP Check</strong> (4 s mono fixture), <strong>Bass Focus</strong>, <strong>Melody / Harmony</strong>, and <strong>Full Mix</strong> (8 s music probes); playlist stores <code>demoId</code> for reload.</li>
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
Extract up to 12 s from Optimize region (In/Out) or track center
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
