import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import type { Plugin } from 'vite';

function imageFallbackPlugin(): Plugin {
  return {
    name: 'image-fallback-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/images/')) {
          const localPath = path.join(__dirname, 'public', req.url);
          if (!fs.existsSync(localPath)) {
            const target = `https://termburg.ceosivaev.ru${req.url}`;
            import('https').then((https) => {
              https.get(target, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (proxyRes) => {
                if (proxyRes.statusCode === 200) {
                  res.writeHead(200, {
                    'content-type': proxyRes.headers['content-type'] || 'image/jpeg',
                    'cache-control': 'public, max-age=86400',
                  });
                  proxyRes.pipe(res);
                } else {
                  next();
                }
              }).on('error', () => next());
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), imageFallbackPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }

          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('lucide-react')) return 'vendor-icons';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/wp-content': {
        target: 'https://termburg.ru',
        changeOrigin: true,
        secure: true,
      },
      '/wp-json': {
        target: 'https://termburg.ru',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
