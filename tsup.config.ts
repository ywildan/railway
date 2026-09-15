import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.tsx'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  banner: { js: '#!/usr/bin/env node' },
  external: ['react', 'ink'],
});
