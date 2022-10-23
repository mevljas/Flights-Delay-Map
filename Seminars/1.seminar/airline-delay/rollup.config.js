// See also: https://rollupjs.org/
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const banner = `/**
 * This is a p5.js sketch made with p5js-template-petr-plus.
 *
 * @license MIT
 */
`

const config = {
  input: 'tsc-out/main.js',
  output: {
    file: 'dist/script.js',
    format: 'iife',
    banner,
    globals: {p5: 'p5'},
    interop: 'default'
  },
  external: ['p5'],
  entry: 'tsc-out/main.js',
  dest: 'dist/script.js',
  plugins: [serve('dist'), livereload('dist')]
}

export default config
