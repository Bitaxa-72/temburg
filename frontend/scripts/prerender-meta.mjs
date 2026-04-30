import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const indexPath = path.join(buildDir, 'index.html');
const seoConfigPath = path.join(rootDir, 'src', 'seo', 'seoConfig.ts');
const siteUrl = 'https://termburg.ru';

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function extractObjectLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Cannot find ${marker}`);
  }

  const start = source.indexOf('{', markerIndex);
  if (start === -1) {
    throw new Error(`Cannot find object start for ${marker}`);
  }

  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Cannot find object end for ${marker}`);
}

function loadSeoConfig() {
  const source = stripComments(fs.readFileSync(seoConfigPath, 'utf8'));
  const objectLiteral = extractObjectLiteral(source, 'export const seoConfig');

  return Function(`"use strict"; return (${objectLiteral});`)();
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function routeToUrl(route) {
  return route === '/' ? `${siteUrl}/` : `${siteUrl}${route}`;
}

function routeToOutputPath(route) {
  return route === '/'
    ? indexPath
    : path.join(buildDir, route.replace(/^\//, ''), 'index.html');
}

function replaceMeta(html, route, seo) {
  const title = escapeAttribute(seo.title || 'Termburg');
  const description = escapeAttribute(seo.description || '');
  const url = escapeAttribute(routeToUrl(route));
  const image = escapeAttribute(seo.ogImage ? `${siteUrl}${seo.ogImage}` : `${siteUrl}/images/og-default.jpg`);

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<link rel="alternate" hreflang="ru" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="ru" href="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);
}

if (!fs.existsSync(indexPath)) {
  throw new Error(`Build index not found: ${indexPath}`);
}

const html = fs.readFileSync(indexPath, 'utf8');
const seoConfig = loadSeoConfig();

for (const [route, seo] of Object.entries(seoConfig)) {
  const outputPath = routeToOutputPath(route);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, replaceMeta(html, route, seo));
}

console.log(`Prerendered ${Object.keys(seoConfig).length} HTML entry files.`);
