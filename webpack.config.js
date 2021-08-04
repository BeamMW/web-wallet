const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    index: path.join(__dirname, './src/index.tsx'),
    background: path.join(__dirname, './src/background.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'src/wasm'),
          to: path.join(__dirname, 'dist/'),
          context: 'public',
        },
        {
          from: path.join(__dirname, 'src/assets'),
          to: path.join(__dirname, 'dist/assets'),
          context: 'public',
        },
        {
          from: path.join(__dirname, 'src/index.html'),
          to: path.join(__dirname, 'dist'),
          context: 'public',
        },
        {
          from: path.join(__dirname, 'src/manifest.json'),
          to: path.join(__dirname, 'dist/manifest.json'),
          context: 'public',
        },
      ],
    }),
  ],
  externals: ['fs'],
};
