import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (
              [
                'png',
                'svg',
                'ico',
                'jpg',
                'jpeg',
                'gif',
                'webmanifest',
              ].includes(ext)
            ) {
              return `assets/[name][extname]`;
            }
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['three'],
    exclude: ['three-viewport-gizmo'],
  },
  resolve: {
    dedupe: ['three'],
  },
});
