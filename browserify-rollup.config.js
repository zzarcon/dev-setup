const rollupNodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

module.exports = {
  entry: 'rollup/index.js',
  format: 'cjs',
  plugins: [
    rollupNodeResolve({ jsnext: true, main: true }),
    commonjs()
  ],
  dest: 'rollup/dist_bundle.js'
};