/**
 * Preset comparison table for enhancement parameters.
 */

const PARAM_ROWS = [
  { key: 'harmonicDrive', label: 'Harmonic drive', format: (v) => Number(v).toFixed(2) },
  { key: 'compThreshold', label: 'Compression threshold', format: (v) => `${Number(v).toFixed(0)} dB` },
  { key: 'clarityLift', label: 'Clarity lift', format: (v) => `${Number(v).toFixed(1)} dB` },
  { key: 'transposeMix', label: 'Transpose mix', format: (v) => `${Math.round(Number(v) * 100)}%` }
];

export function buildPresetDiffHtml(presetA, presetB) {
  const rows = PARAM_ROWS.map(({ key, label, format }) => {
    const a = presetA[key];
    const b = presetB[key];
    const delta = b - a;
    const deltaText =
      key === 'compThreshold'
        ? `${delta > 0 ? '+' : ''}${delta.toFixed(0)} dB`
        : key === 'clarityLift'
          ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} dB`
          : key === 'transposeMix'
            ? `${delta > 0 ? '+' : ''}${Math.round(delta * 100)} pts`
            : `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`;
    return `<tr><td>${label}</td><td>${format(a)}</td><td>${format(b)}</td><td>${deltaText}</td></tr>`;
  }).join('');

  return `
    <p>Comparison of built-in or saved preset values (four enhancement sliders). Stereo width and MAP are unchanged.</p>
    <table class="preset-diff-table">
      <thead><tr><th>Parameter</th><th>${presetA.name}</th><th>${presetB.name}</th><th>Δ (B − A)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
