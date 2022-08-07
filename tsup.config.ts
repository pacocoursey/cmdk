import { defineConfig } from 'tsup'

export default defineConfig({
  sourcemap: false,
  minify: true,
  dts: true,
  splitting: true,
  format: ['esm', 'cjs'],
  loader: {
    '.js': 'jsx',
  },
})
