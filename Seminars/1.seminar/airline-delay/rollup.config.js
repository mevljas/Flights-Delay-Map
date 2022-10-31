// See also: https://rollupjs.org/
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const config = {
  input: 'tsc-out/main.js',
  output: {
    file: 'dist/script.js',
    format: 'iife',
    globals: {p5: 'p5', bootstrap: 'bootstrap', mapboxgl: 'mapboxgl'},
    interop: 'default'
  },
  external: ['p5', 'bootstrap', 'mapboxgl'],
  plugins: [
    resolve(), // so Rollup can find `mapbox-gl`
    commonjs()
  ]
}

export default config
