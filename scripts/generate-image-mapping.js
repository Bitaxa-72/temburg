#!/usr/bin/env node
/**
 * Generate image mapping file for WordPress import
 *
 * This script scans the images directory and generates a mapping file
 * that can be used for bulk import into WordPress.
 *
 * Output formats:
 * - JSON: For programmatic import
 * - CSV: For manual review
 * - WP-CLI: For direct import commands
 *
 * Usage:
 *   node generate-image-mapping.js [--format json|csv|wpcli]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const IMAGES_DIR = path.resolve(__dirname, '../frontend/public/images');
const OUTPUT_DIR = path.resolve(__dirname, '../scripts/output');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

// Categories based on directory structure
const CATEGORIES = {
  saunas: 'Saunas & Steam Rooms',
  services: 'Services & Treatments',
  complex: 'Complex & Facilities',
  termliny: 'Termliny Characters',
  certificates: 'Certificates',
  promo: 'Promotions',
  menu: 'Menu Items',
  icons: 'Icons',
};

/**
 * Recursively scan directory for images
 */
function scanDirectory(dir, basePath = '') {
  const results = [];

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return results;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = basePath ? `${basePath}/${item}` : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...scanDirectory(fullPath, relativePath));
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        results.push({
          path: relativePath,
          filename: item,
          extension: ext,
          size: stat.size,
          category: getCategory(relativePath),
          title: generateTitle(item),
        });
      }
    }
  }

  return results;
}

/**
 * Determine category from path
 */
function getCategory(relativePath) {
  const firstDir = relativePath.split('/')[0];
  return CATEGORIES[firstDir] || 'Uncategorized';
}

/**
 * Generate title from filename
 */
function generateTitle(filename) {
  // Remove extension
  let title = path.parse(filename).name;

  // Replace hyphens and underscores with spaces
  title = title.replace(/[-_]/g, ' ');

  // Remove common prefixes like "generated", version numbers
  title = title.replace(/^generated\s*/i, '');
  title = title.replace(/\s*v?\d+$/i, '');

  // Capitalize words
  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return title.trim() || filename;
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Generate JSON output
 */
function generateJSON(images) {
  return JSON.stringify(
    images.map(img => ({
      termburg_path: img.path,
      title: img.title,
      category: img.category,
      filename: img.filename,
    })),
    null,
    2
  );
}

/**
 * Generate CSV output
 */
function generateCSV(images) {
  const headers = ['Path', 'Title', 'Category', 'Size', 'Extension'];
  const rows = images.map(img => [
    img.path,
    `"${img.title}"`,
    img.category,
    formatSize(img.size),
    img.extension,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generate WP-CLI commands
 */
function generateWPCLI(images) {
  const commands = images.map(img => {
    const filePath = `$IMAGES_PATH/${img.path}`;
    return [
      `# ${img.title} (${img.category})`,
      `attachment_id=$(wp media import "${filePath}" --title="${img.title}" --porcelain)`,
      `wp post meta add $attachment_id termburg_path "${img.path}"`,
      '',
    ].join('\n');
  });

  return [
    '#!/bin/bash',
    '# Auto-generated WP-CLI commands for image import',
    '# Run this on the WordPress server',
    '',
    'IMAGES_PATH="/var/www/termburg.ceosivaev.ru/react/public/images"',
    'cd /var/www/termburg.ceosivaev.ru/wordpress',
    '',
    ...commands,
  ].join('\n');
}

/**
 * Main function
 */
function main() {
  const format = process.argv[2]?.replace('--format=', '') || 'json';

  console.log(`Scanning images directory: ${IMAGES_DIR}`);
  const images = scanDirectory(IMAGES_DIR);
  console.log(`Found ${images.length} images`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate statistics
  const stats = {
    total: images.length,
    byCategory: {},
    byExtension: {},
    totalSize: 0,
  };

  images.forEach(img => {
    stats.byCategory[img.category] = (stats.byCategory[img.category] || 0) + 1;
    stats.byExtension[img.extension] = (stats.byExtension[img.extension] || 0) + 1;
    stats.totalSize += img.size;
  });

  console.log('\nStatistics:');
  console.log(`  Total images: ${stats.total}`);
  console.log(`  Total size: ${formatSize(stats.totalSize)}`);
  console.log('\n  By category:');
  Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`    ${cat}: ${count}`));
  console.log('\n  By extension:');
  Object.entries(stats.byExtension)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => console.log(`    ${ext}: ${count}`));

  // Generate output files
  let outputFile;
  let content;

  switch (format.toLowerCase()) {
    case 'csv':
      outputFile = path.join(OUTPUT_DIR, 'image-mapping.csv');
      content = generateCSV(images);
      break;
    case 'wpcli':
      outputFile = path.join(OUTPUT_DIR, 'import-images.sh');
      content = generateWPCLI(images);
      break;
    case 'json':
    default:
      outputFile = path.join(OUTPUT_DIR, 'image-mapping.json');
      content = generateJSON(images);
      break;
  }

  fs.writeFileSync(outputFile, content);
  console.log(`\nOutput saved to: ${outputFile}`);

  // Always generate JSON for reference
  if (format !== 'json') {
    const jsonFile = path.join(OUTPUT_DIR, 'image-mapping.json');
    fs.writeFileSync(jsonFile, generateJSON(images));
    console.log(`JSON reference saved to: ${jsonFile}`);
  }
}

main();
