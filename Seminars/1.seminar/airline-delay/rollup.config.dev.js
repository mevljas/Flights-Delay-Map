// See also: https://rollupjs.org/
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
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
    typescript(),
    resolve(), // so Rollup can find `mapbox-gl`
    commonjs(),
    serve('dist'),
    livereload({
      watch: ['dist', 'src'],
      exts: ['html', 'js', 'scss', 'sass', 'css']
    })
  ]
}

export default config
