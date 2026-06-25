/**
 * CI electrode map profiles (MAP-inspired, not clinical exports).
 * Center frequencies are log-spaced 250–8000 Hz unless noted.
 * Sources: default ACE-style maps, MED-EL anatomy-based fitting literature,
 * UCSF FPCT reallocation studies (Dryad doi:10.5061/dryad.jh9w0vtm2).
 */

export const CHANNEL_COUNT = 16;
export const MIN_HZ = 250;
export const MAX_HZ = 8000;

export function logSpacedCenters(count, minHz = MIN_HZ, maxHz = MAX_HZ) {
  const centers = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    centers.push(minHz * Math.pow(maxHz / minHz, t));
  }
  return centers;
}

function buildElectrodes(centers, statuses, weights) {
  return centers.map((centerHz, index) => ({
    index: index + 1,
    centerHz: Math.round(centerHz),
    status: statuses[index] || 'active',
    weight: weights[index] !== undefined ? weights[index] : 1
  }));
}

export const MAP_PROFILES = {
  'default-log-16': {
    id: 'default-log-16',
    name: 'Default (log 16-channel)',
    description: 'Generic log-spaced 16-channel map. All electrodes active. Baseline reference.',
    source: 'Standard CI vocoder band layout',
    electrodes: buildElectrodes(
      logSpacedCenters(16),
      Array(16).fill('active'),
      Array(16).fill(1)
    )
  },

  'cochlear-ace-typical': {
    id: 'cochlear-ace-typical',
    name: 'Cochlear ACE (typical)',
    description: 'Approximate ACE strategy spacing with slightly compressed lows (common factory default).',
    source: 'Cochlear Nucleus ACE literature / Greenwood-derived spacing',
    electrodes: buildElectrodes(
      [281, 347, 429, 531, 657, 813, 1006, 1245, 1540, 1905, 2356, 2914, 3604, 4458, 5515, 6822],
      Array(16).fill('active'),
      Array(16).fill(1)
    )
  },

  'medel-anatomy-typical': {
    id: 'medel-anatomy-typical',
    name: 'MED-EL anatomy-based (typical)',
    description: 'Typical anatomy-based fitting target: apical channels skewed slightly lower, dense mid-speech region.',
    source: 'MED-EL ABF / OTOPLAN literature (blog.medel.pro, PMC12904220)',
    electrodes: buildElectrodes(
      [240, 310, 390, 490, 620, 780, 980, 1230, 1550, 1950, 2450, 3080, 3870, 4870, 6120, 7700],
      Array(16).fill('active'),
      [1.1, 1.1, 1.05, 1.0, 1.0, 1.15, 1.2, 1.2, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75]
    )
  },

  'shallow-insertion': {
    id: 'shallow-insertion',
    name: 'Shallow insertion (compressed lows)',
    description: 'Simulates shallow array: bass channels weak/dead, speech band overcrowded — common music complaint.',
    source: 'MED-EL shallow FLEX insertion literature',
    electrodes: buildElectrodes(
      logSpacedCenters(16),
      ['dead', 'dead', 'weak', 'weak', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'weak', 'active', 'active', 'active'],
      [0, 0, 0.35, 0.45, 1.1, 1.15, 1.2, 1.2, 1.15, 1.1, 1.05, 1.0, 0.7, 0.95, 1.0, 0.9]
    )
  },

  'research-fpct-shifted': {
    id: 'research-fpct-shifted',
    name: 'Research FPCT (shifted mids)',
    description: 'Inspired by UCSF flat-panel CT reallocation studies — mid-frequency place-pitch correction emphasis.',
    source: 'Dryad doi:10.5061/dryad.jh9w0vtm2 (FPCT frequency reallocation)',
    electrodes: buildElectrodes(
      [260, 330, 410, 520, 680, 880, 1120, 1420, 1780, 2200, 2680, 3220, 3850, 4580, 5450, 6500],
      Array(16).fill('active'),
      [0.9, 0.95, 1.0, 1.05, 1.1, 1.2, 1.25, 1.25, 1.2, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85]
    )
  },

  'dead-region-mid': {
    id: 'dead-region-mid',
    name: 'Dead region (mid electrodes)',
    description: 'Example map with deactivated mid-array contacts — redistribution should push energy to neighbors.',
    source: 'Clinical deactivation example (PMC12904220 reports contacts 10–12 deactivated)',
    electrodes: buildElectrodes(
      logSpacedCenters(16),
      ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'dead', 'dead', 'dead', 'active', 'active', 'active', 'active'],
      [1, 1, 1, 1, 1, 1, 1, 1, 1.1, 0, 0, 0, 1.1, 1, 1, 1]
    )
  }
};

export function redistributeDeadRegionWeights(electrodes) {
  const result = electrodes.map((e) => ({
    ...e,
    effectiveWeight: e.status === 'dead' ? 0 : e.weight * (e.status === 'weak' ? 0.55 : 1)
  }));

  const deadIndices = result.map((e, i) => (e.status === 'dead' ? i : -1)).filter((i) => i >= 0);

  deadIndices.forEach((deadIndex) => {
    const lostWeight = electrodes[deadIndex].weight;
    const neighbors = [];
    if (deadIndex > 0 && result[deadIndex - 1].status !== 'dead') {
      neighbors.push(deadIndex - 1);
    }
    if (deadIndex < result.length - 1 && result[deadIndex + 1].status !== 'dead') {
      neighbors.push(deadIndex + 1);
    }
    if (neighbors.length === 0) {
      return;
    }
    const share = lostWeight / neighbors.length;
    neighbors.forEach((neighborIndex) => {
      result[neighborIndex].effectiveWeight += share * 0.85;
    });
  });

  return result;
}

export function validateMapProfile(data) {
  if (!data || !Array.isArray(data.electrodes)) {
    throw new Error('Profile must include an electrodes array');
  }
  if (data.electrodes.length !== CHANNEL_COUNT) {
    throw new Error(`Profile must have exactly ${CHANNEL_COUNT} electrodes`);
  }
  const electrodes = data.electrodes.map((electrode, index) => {
    const centerHz = Number(electrode.centerHz);
    const weight = Number(electrode.weight !== undefined ? electrode.weight : 1);
    const status = electrode.status || 'active';
    if (!Number.isFinite(centerHz) || centerHz <= 0) {
      throw new Error(`Invalid centerHz on electrode ${index + 1}`);
    }
    if (!Number.isFinite(weight) || weight < 0) {
      throw new Error(`Invalid weight on electrode ${index + 1}`);
    }
    if (!['active', 'weak', 'dead'].includes(status)) {
      throw new Error(`Invalid status on electrode ${index + 1}`);
    }
    return {
      index: index + 1,
      centerHz,
      status,
      weight
    };
  });

  return {
    id: data.id || 'custom-import',
    name: data.name || 'Custom import',
    description: data.description || 'User-imported electrode map',
    source: data.source || 'Custom JSON',
    electrodes
  };
}

export function parseMapProfileJson(jsonText) {
  const data = JSON.parse(jsonText);
  return validateMapProfile(data);
}

export function exportMapProfileJson(profile) {
  return JSON.stringify(profile, null, 2);
}

export function getProfileList() {
  return Object.values(MAP_PROFILES);
}

export function getProfileById(id) {
  if (MAP_PROFILES[id]) {
    return JSON.parse(JSON.stringify(MAP_PROFILES[id]));
  }
  return null;
}
