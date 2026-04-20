#!/usr/bin/env node

/**
 * Скрипт для парсинга новостей из Telegram-канала t.me/termburg.
 * Использует публичную страницу канала (не требует API-ключей).
 *
 * Размещение на сервере: /opt/termburg-news/fetch-news.js
 * Cron: 0 *​/2 * * * node /opt/termburg-news/fetch-news.js
 * Вывод: /var/www/termburg.ceosivaev.ru/api/news.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CHANNEL = 'termburg';
const OUTPUT_DIR = '/var/www/termburg.ceosivaev.ru/api';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'news.json');
const MAX_POSTS = 50;

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractPosts(html) {
  const posts = [];
  // Match each message widget
  const msgRegex = /<div class="tgme_widget_message_wrap[^"]*"[\s\S]*?<div class="tgme_widget_message js-widget_message"[^>]*data-post="([^"]*)"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;

  // Simpler approach: split by message blocks
  const blocks = html.split('tgme_widget_message_wrap');

  for (const block of blocks) {
    if (!block.includes('data-post=')) continue;

    // Post ID / link
    const postMatch = block.match(/data-post="([^"]*)"/);
    if (!postMatch) continue;
    const postId = postMatch[1];
    const link = `https://t.me/${postId}`;

    // Text content
    let text = '';
    const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (textMatch) {
      text = textMatch[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
    }

    if (!text) continue;

    // Date
    let date = '';
    const dateMatch = block.match(/<time[^>]*datetime="([^"]*)"/);
    if (dateMatch) {
      date = dateMatch[1].split('T')[0]; // YYYY-MM-DD
    }

    // Image
    let image = '';
    const imgMatch = block.match(/tgme_widget_message_photo_wrap[^>]*style="background-image:url\('([^']*)'\)"/);
    if (imgMatch) {
      image = imgMatch[1];
    }
    if (!image) {
      const imgTag = block.match(/<img[^>]*class="[^"]*tgme_widget_message_photo[^"]*"[^>]*src="([^"]*)"/);
      if (imgTag) image = imgTag[1];
    }

    posts.push({
      id: postId,
      text,
      date,
      image: image || undefined,
      link,
    });
  }

  return posts;
}

async function main() {
  console.log(`[${new Date().toISOString()}] Fetching news from t.me/s/${CHANNEL}...`);

  try {
    const html = await fetch(`https://t.me/s/${CHANNEL}`);
    const posts = extractPosts(html);

    if (posts.length === 0) {
      console.log('No posts found. Skipping update.');
      return;
    }

    // Sort by date descending, limit
    posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const result = posts.slice(0, MAX_POSTS);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Saved ${result.length} posts to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
