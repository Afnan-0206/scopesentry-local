import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@scopesentry/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});
