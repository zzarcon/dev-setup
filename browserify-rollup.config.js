const rollupNodeResolve = require('rollup-plugin-node-resolve');

module.exports = {
  entry: 'rollup/index.js',
  format: 'cjs',
  plugins: [rollupNodeResolve()],
  dest: 'rollup/dist_bundle.js'
};