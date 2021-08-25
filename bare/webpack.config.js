const path = require('path');
const { IgnorePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    index: path.join(__dirname, './index.js'),
  },
  output: {
    path: path.join(__dirname, './../dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new IgnorePlugin({
      resourceRegExp: /^ws$/,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, './index.html'),
          to: path.join(__dirname, './../dist'),
          context: 'public',
        },
        {
          from: path.join(
            __dirname,
            './../node_modules/beam-wasm-client-master/',
          ),
          globOptions: {
            ignore: ['package.json'],
          },
        },
        {
          from: path.join(__dirname, 'manifest.json'),
          to: path.join(__dirname, './../dist/manifest.json'),
          context: 'public',
        },
      ],
    }),
  ],
  externals: ['fs'],
};
