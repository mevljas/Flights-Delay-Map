// See also: https://rollupjs.org/

const config = {
  input: 'tsc-out/main.js',
  output: {
    file: 'dist/script.js',
    format: 'iife',
    globals: {p5: 'p5', bootstrap: 'bootstrap', mapboxgl: 'mapboxgl'},
    interop: 'default'
  },
  external: ['p5', 'bootstrap', 'mapboxgl']
}

export default config
