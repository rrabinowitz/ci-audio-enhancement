# CI Audio Enhancement Engine

Browser-based music pre-processor for cochlear implant users. Runs entirely client-side (Web Audio API); no server upload of audio.

## Features

- **Enhancement chain** — MAP spectral shaper, 3-band compression, harmonic bass excitation, clarity lift, ring-mod frequency transposition
- **Built-in demos** — **DSP Check** engineering fixture + music probes (**Bass Focus**, **Melody / Harmony**, **Full Mix**); see ⓘ help topics
- **Your uploads** — local MP3/WAV/FLAC; optimize region, export, playlist (not persisted across reload)
- **Speech / Music mode** — one-click presets with localStorage memory
- **Stereo width** — mono collapse toward CI-friendly processing (default 0%)
- **Visualizations** — 16-channel spectrum (live + preview), channel contrast, enhancement profile (fixed ±35%), band energy comparison, GR meters
- **Presets** — Speech, Music, Classical, Rock, Jazz + save/import/export custom presets
- **CI Auto-Tune** — 625-combo vocoder-in-the-loop offline optimization (includes transpose mix); **optimize region** In/Out markers
- **Tuning workflow** — compare presets, undo/redo, Original / Enhanced A/B with Match loudness in transport
- **Export WAV** — offline render; optional diagnostic vocoder pass
- **Session JSON** — export/import full tuning session (**Tools ▾**)
- **Microphone input** — live enhancement chain via getUserMedia
- **Diagnostic vocoder** — 16-channel noise vocoder for developer A/B (bypassed by default)
- **Electrode maps** — literature presets + JSON import/export
- **Mobile UI** — ☰ hamburger menu, single-column stack, sticky transport, 44px touch targets, PWA manifest
- **Desktop UI** — two-column dashboard at wide widths; full inline menu bar
- **Roadmap** — live / partial / planned features with ✓ on completed requirements
- **Theme** — dark/light toggle

## Local testing

```bash
cd ci-audio-enhancement
python3 -m http.server 8765
```

Open http://localhost:8765

> ES modules require HTTP — do not open `index.html` as a `file://` URL.

## Deploy to Vercel (recommended)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Other** (no build step).
4. Root directory: `.` (default).
5. Deploy.

Vercel assigns a URL like `https://ci-audio-enhancement.vercel.app`.

## Deploy to GitHub Pages

1. Push to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source**: Deploy from branch `main`, folder `/ (root)`.
3. Site URL: `https://<username>.github.io/<repo-name>/`

## Tester notes

- Use Chrome or Edge for development; **Safari** (macOS/iOS) is supported — tap Play if you see an `interrupted` audio error.
- **Quick test:** **Full Mix** → Play → **Music mode** → tap **Original** / **Enhanced** (Match loudness on); then try **Bass Focus** and **Melody / Harmony** for targeted music probes. Upload your own files for real tuning.
- Run `npm test` — validates help topics, module imports, and offline pipeline smoke test.
- Hard-refresh (`Cmd+Shift+R`) after updates — the app shows a red banner if JavaScript fails to load.
- All processing stays on the device; nothing is uploaded.

## Help & documentation

In-app: **Using the App** (instructions, FAQ, help), **Science**, **For Industry** (partnership + developer guides), **Roadmap**, and **Tools** menus, plus ⓘ icons on every panel. Every in-app document has **⎙ Print / PDF**.

**For manufacturer evaluators (sales, marketing, R&D):** start with **For Industry ▾ → Industry & partnership guide** in the live app, then the one-page overview and technical paper below.

**For companion-app developers (e.g. Nucleus Smart App teams):** **For Industry ▾ → Cochlear platform developer guide** — product-line scope (Nucleus/Kanso vs Osia/Baha/CoPilot), native porting map, and streaming insertion point.

**Industry pitch:** [One-page overview](overview.html) · [Download PDF](CI-Audio-Enhancement-Overview.pdf) · also under **For Industry ▾** in the app nav.

**Public demo:** deploy via Vercel/GitHub Pages (see above); processing remains entirely client-side.

## Files

| File | Purpose |
|------|---------|
| `index.html` | UI shell |
| `app.js` | UI bindings, transport, playlist, presets, viz loop |
| `audioGraph.js` | Live Web Audio chain (incl. stereo width) |
| `playlist.js` | Track queue + sessionStorage metadata |
| `sessionSnapshot.js` | Full settings export/import JSON |
| `exportAudio.js` | Processed / vocoded WAV export |
| `vocoderDiagnostic.js` | 16-ch vocoder (diagnostic) |
| `offlinePipeline.js` | Offline mirror for auto-tune & export |
| `processingPreview.js` | Control-linked visualization preview |
| `autoTuner.js` | Vocoder-in-the-loop optimize |
| `ciMetrics.js` | Vocoded-signal scoring |
| `mapProfiles.js` | Electrode map presets + JSON import |
| `presets.js` | Enhancement presets + localStorage |
| `visualizer.js` | Spectrum, channel contrast, enhancement profile, band energy |
| `demoTrack.js` | Built-in **DSP Check** engineering fixture plus **Bass Focus**, **Melody / Harmony**, and **Full Mix** music demos |
| `manifest.json` | PWA install metadata |
| `roadmapContent.js` | Product roadmap entries |
| `helpContent.js` | Instructions, FAQ, help, technical text |
| `help.js` | Modal + dropdown UI |
| `scripts/validate.mjs` | Static check — info topics, menus, module imports (`npm test`) |
| `paper.html` | Technical overview for industry evaluators |
| `profiles/example-custom.json` | Audiologist-fillable MAP template |
