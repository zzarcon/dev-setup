// import babel from 'rollup-plugin-babel';
const rollupNodeResolve = require('rollup-plugin-node-resolve');

export default {
  entry: 'rollup/index.js',
  format: 'cjs',
  plugins: [rollupNodeResolve()],
  dest: 'rollup/dist_bundle.js'
};