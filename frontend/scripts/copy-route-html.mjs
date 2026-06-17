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
const technicalRoutes = ['/yookassa/returnUrl'];
const routes = [...new Set([...seoRoutes, ...technicalRoutes])];

for (const route of routes) {
  const outputPath = path.join(buildDir, route.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
}

console.log(`Copied SPA index.html to ${routes.length} route folders.`);
