import puppeteer from 'puppeteer';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'overview.html');
const pdfPath = path.join(root, 'CI-Audio-Enhancement-Overview.pdf');

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
await page.pdf({
  path: pdfPath,
  format: 'Letter',
  printBackground: true,
  preferCSSPageSize: true,
  margin: {
    top: '0.42in',
    right: '0.48in',
    bottom: '0.42in',
    left: '0.48in'
  }
});
await browser.close();
console.log(`Wrote ${pdfPath}`);
