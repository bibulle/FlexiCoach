/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    // Même alias que `paths` dans tsconfig.base.json (imports à l'exécution)
    alias: [
      {
        find: /^@flexicoach\/shared$/,
        replacement: fileURLToPath(
          new URL('../../libs/shared/src/index.ts', import.meta.url),
        ),
      },
    ],
  },
  optimizeDeps: {
    exclude: ['@angular/core', '@angular/common', '@angular/platform-browser'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['tree'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts'],
    },
  },
});
