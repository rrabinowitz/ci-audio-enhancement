/**
 * Export / import full application session as JSON (no audio blobs).
 */

const SNAPSHOT_VERSION = 1;

export function buildSessionSnapshot(state) {
  return {
    version: SNAPSHOT_VERSION,
    exportedAt: new Date().toISOString(),
    mapProfile: state.mapProfile,
    enhancement: state.enhancement,
    masterGainDb: state.masterGainDb,
    presetId: state.presetId,
    contentMode: state.contentMode,
    vocoder: state.vocoder,
    stereoWidth: state.stereoWidth,
    vizSettings: state.vizSettings,
    loopEnabled: state.loopEnabled
  };
}

export function parseSessionSnapshot(text) {
  const data = JSON.parse(text);
  if (!data || data.version !== SNAPSHOT_VERSION) {
    throw new Error('Unsupported session snapshot version');
  }
  if (!data.enhancement) {
    throw new Error('Invalid session snapshot: missing enhancement settings');
  }
  return data;
}

export function downloadSessionJson(snapshot, filename = 'ci-enhancement-session.json') {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
