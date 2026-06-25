/**
 * Enhancement parameter presets — built-in profiles + localStorage persistence.
 */

const STORAGE_KEY = 'ci-enhancement-user-presets';

export const BUILTIN_PRESETS = {
  default: {
    id: 'default',
    name: 'Default (balanced)',
    builtin: true,
    harmonicDrive: 0.65,
    compThreshold: -42,
    clarityLift: 8,
    transposeMix: 0.4
  },
  speech: {
    id: 'speech',
    name: 'Speech intelligibility',
    builtin: true,
    harmonicDrive: 0.35,
    compThreshold: -36,
    clarityLift: 14,
    transposeMix: 0.15
  },
  music: {
    id: 'music',
    name: 'Music enjoyment',
    builtin: true,
    harmonicDrive: 0.8,
    compThreshold: -46,
    clarityLift: 5,
    transposeMix: 0.55
  },
  classical: {
    id: 'classical',
    name: 'Classical / acoustic',
    builtin: true,
    harmonicDrive: 0.45,
    compThreshold: -48,
    clarityLift: 6,
    transposeMix: 0.35
  },
  rock: {
    id: 'rock',
    name: 'Rock / pop',
    builtin: true,
    harmonicDrive: 0.85,
    compThreshold: -40,
    clarityLift: 7,
    transposeMix: 0.45
  },
  jazz: {
    id: 'jazz',
    name: 'Jazz / dynamic',
    builtin: true,
    harmonicDrive: 0.55,
    compThreshold: -50,
    clarityLift: 9,
    transposeMix: 0.5
  }
};

export function getBuiltinPresetList() {
  return Object.values(BUILTIN_PRESETS);
}

export function getPresetById(id, userPresets = {}) {
  if (BUILTIN_PRESETS[id]) {
    return { ...BUILTIN_PRESETS[id] };
  }
  if (userPresets[id]) {
    return { ...userPresets[id] };
  }
  return null;
}

export function loadUserPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveUserPresets(userPresets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets));
}

export function captureCurrentParams(params, name) {
  const id = `custom-${Date.now()}`;
  return {
    id,
    name,
    builtin: false,
    harmonicDrive: params.harmonicDrive,
    compThreshold: params.compThreshold,
    clarityLift: params.clarityLift,
    transposeMix: params.transposeMix ?? 0.4,
    savedAt: new Date().toISOString()
  };
}

export function exportPresetJson(preset) {
  return JSON.stringify(preset, null, 2);
}

export function parsePresetJson(text) {
  const data = JSON.parse(text);
  if (!data.name || data.harmonicDrive === undefined) {
    throw new Error('Invalid preset JSON: need name and enhancement parameters');
  }
  return {
    id: data.id || `imported-${Date.now()}`,
    name: data.name,
    builtin: false,
    harmonicDrive: Number(data.harmonicDrive),
    compThreshold: Number(data.compThreshold),
    clarityLift: Number(data.clarityLift),
    transposeMix: Number(data.transposeMix ?? 0.4),
    importedAt: new Date().toISOString()
  };
}
