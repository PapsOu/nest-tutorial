const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [{
      test: /.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()] // For custom paths
  },
  plugins: [new webpack.HotModuleReplacementPlugin()], // For HMR
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
  },
  node: {
    __dirname: true
  }
};
