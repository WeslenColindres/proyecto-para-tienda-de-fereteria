import { defineConfig } from 'tsup';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  entry: {
    main: 'electron/main/index.ts',
    preload: 'electron/preload/index.ts'
  },
  outDir: 'dist-electron',
  format: ['cjs'],
  outExtension() {
    return {
      js: '.cjs'
    };
  },
  target: 'node18',
  splitting: false,
  sourcemap: isDev,
  clean: true,
  minify: !isDev,
  platform: 'node',
  external: ['electron'],
  tsconfig: './tsconfig.electron.json',
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'development'
  }
});
