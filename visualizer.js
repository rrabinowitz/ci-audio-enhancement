/**
 * CI visualizer: input vs enhanced spectrum, channel contrast map,
 * fixed-scale enhancement profile, and band level comparison meters.
 */

const DELTA_SCALE = 0.35;

const BAND_COLORS = {
  low: '#d29922',
  mid: '#58a6ff',
  high: '#79c0ff'
};

export class Visualizer {
  constructor(options) {
    this.channelCount = options.channelCount;
    this.bandCenters = options.bandCenters;

    this.spectrumCanvas = this._requireCanvas('spectrumCanvas');
    this.cochlearCanvas = this._requireCanvas('cochlearCanvas');
    this.deltaCanvas = this._requireCanvas('deltaCanvas');
    this.bandTraceCanvas = this._requireCanvas('bandTraceCanvas');

    this.spectrumCtx = this.spectrumCanvas.getContext('2d');
    this.cochlearCtx = this.cochlearCanvas.getContext('2d');
    this.deltaCtx = this.deltaCanvas.getContext('2d');
    this.bandTraceCtx = this.bandTraceCanvas.getContext('2d');

    this.meterSettings = {
      stability: 0.75,
      lastMeterUpdate: 0,
      meterIntervalMs: 150
    };
    this.channelProfile = {
      raw: new Float32Array(this.channelCount),
      enh: new Float32Array(this.channelCount),
      initialized: false
    };
    this.bandDisplay = {
      low: { raw: 0, enh: 0 },
      mid: { raw: 0, enh: 0 },
      high: { raw: 0, enh: 0 },
      initialized: false
    };
    this.f0Channel = 0;
  }

  setMeterSettings(partial) {
    Object.assign(this.meterSettings, partial);
  }

  _meterBlend(current, target) {
    const stability = Math.max(0, Math.min(0.95, this.meterSettings.stability));
    const alpha = Math.max(0.04, 1 - stability * 0.94);
    return current + (target - current) * alpha;
  }

  _updateMeterProfiles(rawMagnitudes, enhancedMagnitudes, rawBandEnergies, enhancedBandEnergies, timestamp) {
    if (timestamp - this.meterSettings.lastMeterUpdate < this.meterSettings.meterIntervalMs) {
      return;
    }

    this.meterSettings.lastMeterUpdate = timestamp;

    if (rawMagnitudes && enhancedMagnitudes) {
      for (let i = 0; i < this.channelCount; i++) {
        const rawVal = rawMagnitudes[i] || 0;
        const enhVal = enhancedMagnitudes[i] || 0;
        if (!this.channelProfile.initialized) {
          this.channelProfile.raw[i] = rawVal;
          this.channelProfile.enh[i] = enhVal;
        } else {
          this.channelProfile.raw[i] = this._meterBlend(this.channelProfile.raw[i], rawVal);
          this.channelProfile.enh[i] = this._meterBlend(this.channelProfile.enh[i], enhVal);
        }
      }
      this.channelProfile.initialized = true;
    }

    if (rawBandEnergies && enhancedBandEnergies) {
      ['low', 'mid', 'high'].forEach((band) => {
        const rawVal = rawBandEnergies[band] || 0;
        const enhVal = enhancedBandEnergies[band] || 0;
        const display = this.bandDisplay[band];
        if (!this.bandDisplay.initialized) {
          display.raw = rawVal;
          display.enh = enhVal;
        } else {
          display.raw = this._meterBlend(display.raw, rawVal);
          display.enh = this._meterBlend(display.enh, enhVal);
        }
      });
      this.bandDisplay.initialized = true;
    }
  }

  _setBandDisplay(rawBandEnergies, enhancedBandEnergies) {
    ['low', 'mid', 'high'].forEach((band) => {
      this.bandDisplay[band].raw = rawBandEnergies?.[band] || 0;
      this.bandDisplay[band].enh = enhancedBandEnergies?.[band] || 0;
    });
    this.bandDisplay.initialized = true;
  }

  _requireCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) {
      throw new Error(`Missing visualization canvas: #${id}`);
    }
    return canvas;
  }

  draw(liveMagnitudes, fullSpectrum, options = {}) {
    const isPlaying = options.isPlaying;
    const enhanced = isPlaying ? liveMagnitudes : options.previewMagnitudes;
    const raw = options.rawMagnitudes;

    const timestamp = options.timestamp ?? performance.now();

    this.drawSpectrum(raw, enhanced, isPlaying);
    this.drawCochlearMap(enhanced, options.peakChannel, isPlaying);

    if (isPlaying && raw && enhanced) {
      this._updateMeterProfiles(
        raw,
        enhanced,
        options.rawBandEnergies,
        options.bandEnergies,
        timestamp
      );
      const displayRaw = this.channelProfile.initialized ? this.channelProfile.raw : raw;
      const displayEnh = this.channelProfile.initialized ? this.channelProfile.enh : enhanced;
      this.drawEnhancementDelta(displayRaw, displayEnh, isPlaying);
    } else {
      this.drawEnhancementDelta(raw, enhanced, isPlaying);
    }

    this.drawBandLevelComparison(
      options.rawBandEnergies,
      options.bandEnergies,
      options.previewRawBandEnergies,
      options.previewBandEnergies,
      isPlaying
    );
  }

  _displayLevel(value) {
    return Math.pow(Math.max(0, value || 0), 0.55);
  }

  _percentDelta(raw, enhanced) {
    const deltas = new Float32Array(this.channelCount);
    for (let i = 0; i < this.channelCount; i++) {
      const base = Math.max(raw[i] || 0, 0.025);
      deltas[i] = ((enhanced[i] || 0) - base) / base;
    }
    return deltas;
  }

  drawSpectrum(rawMagnitudes, enhancedMagnitudes, isPlaying) {
    const width = this.spectrumCanvas.width;
    const height = this.spectrumCanvas.height;
    const gap = 3;
    const barWidth = width / this.channelCount;
    const plotH = height - 22;

    this.spectrumCtx.fillStyle = '#0d1117';
    this.spectrumCtx.fillRect(0, 0, width, height);

    if (!rawMagnitudes && !enhancedMagnitudes) {
      return;
    }

    for (let i = 0; i < this.channelCount; i++) {
      const x = i * barWidth + gap / 2;
      const w = barWidth - gap;

      if (rawMagnitudes) {
        const rawH = this._displayLevel(rawMagnitudes[i]) * plotH;
        this.spectrumCtx.fillStyle = isPlaying ? 'rgba(139, 148, 158, 0.55)' : 'rgba(139, 148, 158, 0.35)';
        this.spectrumCtx.fillRect(x, height - 4 - rawH, w, rawH);
        this.spectrumCtx.strokeStyle = isPlaying ? 'rgba(201, 209, 217, 0.7)' : 'rgba(139, 148, 158, 0.6)';
        this.spectrumCtx.lineWidth = 1;
        this.spectrumCtx.strokeRect(x + 0.5, height - 4 - rawH + 0.5, w - 1, Math.max(1, rawH - 1));
      }

      if (enhancedMagnitudes) {
        const enhH = this._displayLevel(enhancedMagnitudes[i]) * plotH;
        const inset = w * 0.14;
        const innerW = w - inset * 2;
        const innerX = x + inset;
        const fill = isPlaying ? 'rgba(88, 166, 255, 0.95)' : 'rgba(210, 153, 34, 0.85)';
        const stroke = isPlaying ? '#79c0ff' : '#e3b341';
        this.spectrumCtx.fillStyle = fill;
        this.spectrumCtx.fillRect(innerX, height - 4 - enhH, innerW, enhH);
        this.spectrumCtx.strokeStyle = stroke;
        this.spectrumCtx.strokeRect(innerX + 0.5, height - 4 - enhH + 0.5, innerW - 1, Math.max(1, enhH - 1));
      }
    }

    this.spectrumCtx.fillStyle = '#8b949e';
    this.spectrumCtx.font = '10px -apple-system, sans-serif';
    this.spectrumCtx.textAlign = 'left';
    if (isPlaying) {
      this.spectrumCtx.fillText('Gray = input · Blue = enhanced (narrow bars)', 8, 12);
    } else {
      this.spectrumCtx.fillText('Gray = bypass preview · Gold = enhanced preview', 8, 12);
    }
  }

  drawCochlearMap(enhancedMagnitudes, peakChannel, isPlaying) {
    const width = this.cochlearCanvas.width;
    const height = this.cochlearCanvas.height;
    const pad = 8;
    const barW = (width - pad * 2) / this.channelCount;
    const midY = height / 2;
    const maxHalf = (height - pad * 2) / 2;

    this.cochlearCtx.fillStyle = '#0d1117';
    this.cochlearCtx.fillRect(0, 0, width, height);

    if (!enhancedMagnitudes) {
      return;
    }

    let sum = 0;
    for (let i = 0; i < this.channelCount; i++) {
      sum += enhancedMagnitudes[i] || 0;
    }
    const mean = sum / this.channelCount;

    const deviations = new Float32Array(this.channelCount);
    let maxDev = 0.001;
    for (let i = 0; i < this.channelCount; i++) {
      deviations[i] = (enhancedMagnitudes[i] || 0) - mean;
      maxDev = Math.max(maxDev, Math.abs(deviations[i]));
    }

    this.cochlearCtx.strokeStyle = '#30363d';
    this.cochlearCtx.beginPath();
    this.cochlearCtx.moveTo(pad, midY);
    this.cochlearCtx.lineTo(width - pad, midY);
    this.cochlearCtx.stroke();

    for (let i = 0; i < this.channelCount; i++) {
      const dev = deviations[i];
      const norm = dev / maxDev;
      const barH = Math.abs(norm) * maxHalf;
      const x = pad + i * barW + 1;
      const w = barW - 2;
      const isPeak = isPlaying && peakChannel === i + 1;

      if (norm >= 0) {
        this.cochlearCtx.fillStyle = isPeak ? '#3fb950' : `rgba(88, 166, 255, ${0.45 + Math.abs(norm) * 0.55})`;
        this.cochlearCtx.fillRect(x, midY - barH, w, barH);
      } else {
        this.cochlearCtx.fillStyle = `rgba(210, 153, 34, ${0.35 + Math.abs(norm) * 0.5})`;
        this.cochlearCtx.fillRect(x, midY, w, barH);
      }

      if (isPeak) {
        this.cochlearCtx.strokeStyle = '#3fb950';
        this.cochlearCtx.lineWidth = 2;
        this.cochlearCtx.strokeRect(x, midY - maxHalf, w, maxHalf * 2);
      }

      this.cochlearCtx.fillStyle = '#484f58';
      this.cochlearCtx.font = '8px monospace';
      this.cochlearCtx.textAlign = 'center';
      this.cochlearCtx.fillText(String(i + 1), x + w / 2, height - 2);
    }

    this.cochlearCtx.fillStyle = '#8b949e';
    this.cochlearCtx.font = '9px -apple-system, sans-serif';
    this.cochlearCtx.textAlign = 'left';
    this.cochlearCtx.fillText('Above avg = blue · Below avg = gold · Green = peak', pad, pad + 8);
  }

  drawEnhancementDelta(rawMagnitudes, enhancedMagnitudes, isPlaying) {
    const width = this.deltaCanvas.width;
    const height = this.deltaCanvas.height;
    const gap = 3;
    const barWidth = width / this.channelCount;
    const midY = height / 2;
    const maxHalf = (height - 20) / 2;

    this.deltaCtx.fillStyle = '#0d1117';
    this.deltaCtx.fillRect(0, 0, width, height);

    if (!rawMagnitudes || !enhancedMagnitudes) {
      this.deltaCtx.fillStyle = '#8b949e';
      this.deltaCtx.font = '11px -apple-system, sans-serif';
      this.deltaCtx.textAlign = 'center';
      this.deltaCtx.fillText('Percent change vs input appears during playback', width / 2, midY);
      return;
    }

    const pct = this._percentDelta(rawMagnitudes, enhancedMagnitudes);
    let topIdx = 0;
    let topVal = 0;

    for (let i = 0; i < this.channelCount; i++) {
      const value = pct[i];
      if (Math.abs(value) > Math.abs(topVal)) {
        topVal = value;
        topIdx = i;
      }
    }

    this.deltaCtx.strokeStyle = '#30363d';
    this.deltaCtx.beginPath();
    this.deltaCtx.moveTo(0, midY);
    this.deltaCtx.lineTo(width, midY);
    this.deltaCtx.stroke();

    for (let i = 0; i < this.channelCount; i++) {
      const value = pct[i];
      const norm = value / DELTA_SCALE;
      const barH = Math.max(Math.min(Math.abs(norm), 1) * maxHalf * 0.92, Math.abs(value) > 0.01 ? 3 : 0);
      const x = i * barWidth + gap / 2;
      const w = barWidth - gap;

      if (value >= 0) {
        this.deltaCtx.fillStyle = isPlaying ? '#3fb950' : 'rgba(63, 185, 80, 0.55)';
        this.deltaCtx.fillRect(x, midY - barH, w, barH);
      } else if (value < 0) {
        this.deltaCtx.fillStyle = isPlaying ? '#f85149' : 'rgba(248, 81, 73, 0.5)';
        this.deltaCtx.fillRect(x, midY, w, barH);
      }
    }

    if (Math.abs(topVal) > 0.02) {
      const labelX = topIdx * barWidth + barWidth / 2;
      const labelY = topVal >= 0 ? midY - maxHalf * 0.92 - 4 : midY + maxHalf * 0.92 + 12;
      this.deltaCtx.fillStyle = isPlaying ? '#e6edf3' : '#8b949e';
      this.deltaCtx.font = 'bold 9px -apple-system, sans-serif';
      this.deltaCtx.textAlign = 'center';
      this.deltaCtx.fillText(`${topVal >= 0 ? '+' : ''}${Math.round(topVal * 100)}%`, labelX, labelY);
    }

    this.deltaCtx.fillStyle = '#8b949e';
    this.deltaCtx.font = '9px -apple-system, sans-serif';
    this.deltaCtx.textAlign = 'left';
    const scaleLabel = `Fixed ±${Math.round(DELTA_SCALE * 100)}% scale`;
    this.deltaCtx.fillText(
      isPlaying
        ? `Enhancement profile (time-averaged) · Green = louder · Red = quieter · ${scaleLabel}`
        : `Settings preview · ${scaleLabel}`,
      8,
      12
    );
  }

  _drawLevelBar(ctx, x, y, width, height, value, fill, stroke) {
    const barW = Math.max(2, width * Math.max(0, Math.min(1, value || 0)));
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, barW, height);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, Math.max(1, barW - 1), Math.max(1, height - 1));
  }

  drawBandLevelComparison(rawBandEnergies, enhancedBandEnergies, previewRaw, previewEnhanced, isPlaying) {
    const width = this.bandTraceCanvas.width;
    const height = this.bandTraceCanvas.height;
    const padL = 92;
    const padR = 84;
    const padT = 10;
    const padB = 14;
    const plotW = width - padL - padR;
    const rowH = (height - padT - padB) / 3;
    const barH = 16;
    const barGap = 5;

    if (isPlaying && rawBandEnergies && enhancedBandEnergies) {
      if (!this.bandDisplay.initialized) {
        this._setBandDisplay(rawBandEnergies, enhancedBandEnergies);
      }
    } else if (previewRaw && previewEnhanced) {
      this._setBandDisplay(previewRaw, previewEnhanced);
    }

    this.bandTraceCtx.fillStyle = '#0d1117';
    this.bandTraceCtx.fillRect(0, 0, width, height);

    const bandLabels = {
      low: 'Low <250 Hz',
      mid: 'Mid 250–4k',
      high: 'High >4k'
    };

    ['low', 'mid', 'high'].forEach((band, index) => {
      const rowTop = padT + index * rowH;
      const centerY = rowTop + rowH / 2;
      const rawVal = this.bandDisplay[band].raw;
      const enhVal = this.bandDisplay[band].enh;
      const color = BAND_COLORS[band];
      const inputY = centerY - barH - barGap / 2;
      const enhY = centerY + barGap / 2;

      this.bandTraceCtx.fillStyle = '#8b949e';
      this.bandTraceCtx.font = '10px -apple-system, sans-serif';
      this.bandTraceCtx.textAlign = 'right';
      this.bandTraceCtx.fillText(bandLabels[band], padL - 10, centerY + 4);

      this.bandTraceCtx.fillStyle = '#6e7681';
      this.bandTraceCtx.font = '9px -apple-system, sans-serif';
      this.bandTraceCtx.textAlign = 'left';
      this.bandTraceCtx.fillText('Input', padL, inputY - 3);
      this.bandTraceCtx.fillText('Enhanced', padL, enhY - 3);

      this._drawLevelBar(
        this.bandTraceCtx,
        padL,
        inputY,
        plotW,
        barH,
        rawVal,
        isPlaying ? 'rgba(139, 148, 158, 0.75)' : 'rgba(139, 148, 158, 0.45)',
        isPlaying ? '#c9d1d9' : '#8b949e'
      );
      this._drawLevelBar(
        this.bandTraceCtx,
        padL,
        enhY,
        plotW,
        barH,
        enhVal,
        isPlaying ? color : 'rgba(210, 153, 34, 0.85)',
        isPlaying ? '#79c0ff' : '#e3b341'
      );

      const base = Math.max(rawVal, 0.04);
      const liftPct = ((enhVal - rawVal) / base) * 100;
      const liftText = `${liftPct >= 0 ? '+' : ''}${Math.round(liftPct)}%`;
      this.bandTraceCtx.fillStyle = liftPct >= 0 ? '#3fb950' : '#f85149';
      this.bandTraceCtx.font = 'bold 12px -apple-system, sans-serif';
      this.bandTraceCtx.textAlign = 'right';
      this.bandTraceCtx.fillText(liftText, width - 10, centerY + 5);
    });

    this.bandTraceCtx.fillStyle = '#8b949e';
    this.bandTraceCtx.font = '9px -apple-system, sans-serif';
    this.bandTraceCtx.textAlign = 'left';
    this.bandTraceCtx.fillText(
      isPlaying
        ? 'Band energy comparison (time-averaged) — overall lift from compression/EQ, not a scrolling timeline'
        : 'Band energy preview for current settings',
      8,
      height - 4
    );
  }

  setF0Channel(index) {
    this.f0Channel = index;
  }

  resetMeterProfiles() {
    this.channelProfile.raw.fill(0);
    this.channelProfile.enh.fill(0);
    this.channelProfile.initialized = false;
    this.bandDisplay.low.raw = 0;
    this.bandDisplay.low.enh = 0;
    this.bandDisplay.mid.raw = 0;
    this.bandDisplay.mid.enh = 0;
    this.bandDisplay.high.raw = 0;
    this.bandDisplay.high.enh = 0;
    this.bandDisplay.initialized = false;
    this.meterSettings.lastMeterUpdate = 0;
  }
}

export function countSaturatedChannels(fullSpectrum, threshold = 230) {
  if (!fullSpectrum) {
    return 0;
  }
  let count = 0;
  for (let i = 0; i < fullSpectrum.length; i++) {
    if (fullSpectrum[i] >= threshold) {
      count++;
    }
  }
  return count;
}

export function updateCompVu(element, reductionDb, labelElement, dbfsText = '') {
  if (!element) {
    return;
  }

  const reduction = Math.max(0, reductionDb || 0);
  const percent = Math.min(100, (reduction / 30) * 100);
  element.style.background = `linear-gradient(to right, #d29922 ${percent}%, #21262d ${percent}%)`;

  if (labelElement) {
    const grText = reduction > 0.1 ? `${reduction.toFixed(1)} dB GR` : 'idle';
    labelElement.textContent = dbfsText ? `${grText} · ${dbfsText}` : grText;
  }
}
