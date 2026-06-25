/**
 * Static validation: help topics, menu content, and ES module load check.
 * Run: npm test  (or node scripts/validate.mjs)
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { INFO_TOPICS, MENU_CONTENT } from '../helpContent.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const infoTopics = [...new Set([...html.matchAll(/data-info-topic="([^"]+)"/g)].map((m) => m[1]))];
const missingTopics = infoTopics.filter((t) => !INFO_TOPICS[t]);
const orphanTopics = Object.keys(INFO_TOPICS).filter((t) => !infoTopics.includes(t));

const menuIds = [...new Set([...html.matchAll(/data-menu-content="([^"]+)"/g)].map((m) => m[1]))];
const missingMenus = menuIds.filter((m) => !MENU_CONTENT[m]);

const jsFiles = readdirSync(root).filter((f) => f.endsWith('.js'));
const importErrors = [];
for (const file of jsFiles) {
  try {
    await import(pathToFileURL(join(root, file)).href);
  } catch (error) {
    if (!error.message.includes('document is not defined') && !error.message.includes('window is not defined')) {
      importErrors.push(`${file}: ${error.message}`);
    }
  }
}

let failed = false;

const appVersionMatch = html.match(/const APP_VERSION = '(\d+)'/);
const appVersion = appVersionMatch?.[1];
if (appVersion) {
  const appJs = readFileSync(join(root, 'app.js'), 'utf8');
  if (!appJs.includes(`?v=${appVersion}`)) {
    console.error(`APP_VERSION is ${appVersion} but app.js imports lack ?v=${appVersion} cache bust`);
    failed = true;
  }
  try {
    const buildVersion = readFileSync(join(root, 'buildVersion.js'), 'utf8');
    if (!buildVersion.includes(`'${appVersion}'`)) {
      console.error(`buildVersion.js does not match APP_VERSION ${appVersion}`);
      failed = true;
    }
  } catch {
  }
}

if (missingTopics.length) {
  console.error('Missing INFO_TOPICS:', missingTopics.join(', '));
  failed = true;
}
if (orphanTopics.length) {
  console.error('Unreachable INFO_TOPICS (defined but no ⓘ button in index.html):', orphanTopics.join(', '));
  failed = true;
}
if (missingMenus.length) {
  console.error('Missing MENU_CONTENT:', missingMenus.join(', '));
  failed = true;
}
if (importErrors.length) {
  console.error('Module import issues:', importErrors.join('; '));
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`OK — ${infoTopics.length} info topics, ${menuIds.length} menu entries, ${jsFiles.length} JS modules`);
