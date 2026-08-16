import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const indexPath = path.join(buildDir, 'index.html');
const seoConfigPath = path.join(rootDir, 'src', 'seo', 'seoConfig.ts');

if (!fs.existsSync(indexPath)) {
  throw new Error(`Build index not found: ${indexPath}`);
}

if (!fs.existsSync(seoConfigPath)) {
  throw new Error(`Route config not found: ${seoConfigPath}`);
}

const html = fs.readFileSync(indexPath, 'utf8');
const seoConfigSource = fs.readFileSync(seoConfigPath, 'utf8');
const seoRoutes = [...seoConfigSource.matchAll(/^\s*'((?:\/[^']*)?)'\s*:/gm)]
  .map((match) => match[1])
  .filter((route) => route && route !== '/');
const technicalRoutes = ['/tablet-sales', '/service-manager', '/yookassa/returnUrl', '/soglasie-na-obrabotku-personalnyh-dannyh'];
const routes = [...new Set([...seoRoutes, ...technicalRoutes])];

function tabletLegacyHtml(source) {
  return source
    .replace(/\s*<script type="module"[\s\S]*?<\/script>/g, '')
    .replace(/\s*<script nomodule>[\s\S]*?<\/script>/g, '')
    .replace(/<script nomodule crossorigin id="vite-legacy-polyfill"/g, '<script crossorigin id="vite-legacy-polyfill"')
    .replace(/<script nomodule crossorigin id="vite-legacy-entry"/g, '<script crossorigin id="vite-legacy-entry"');
}

for (const route of routes) {
  const outputPath = path.join(buildDir, route.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, route === '/tablet-sales' ? tabletLegacyHtml(html) : html);
}

console.log(`Copied SPA index.html to ${routes.length} route folders.`);
