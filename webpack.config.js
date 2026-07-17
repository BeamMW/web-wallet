const path = require('path');
const { IgnorePlugin } = require('webpack');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

const config = {
  target: 'web',
  cache: false,
  entry: {
    index: path.join(__dirname, './src/index.tsx'),
    offscreen: path.join(__dirname, './src/offscreen.ts'),
    contentscript: path.join(__dirname, './src/contentscript.ts'),
    inpage: path.join(__dirname, './src/inpage.ts'),
    appinit: path.join(__dirname, './src/appinit.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'process/browser': require.resolve('process/browser.js'),
    },
    fallback: {
      buffer: require.resolve('buffer'),
    },
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx?$/,
        use: ['babel-loader', '@linaria/webpack-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'svgo-loader'],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: IN_DEVELOPMENT,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new IgnorePlugin({
      resourceRegExp: /^ws$/,
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, './node_modules/beam-wasm-client/'),
          globOptions: {
            ignore: ['package.json'],
          },
        },
        {
          from: path.join(__dirname, 'src/assets'),
          to: path.join(__dirname, 'dist/assets'),
          context: 'public',
        },
        {
          from: path.join(__dirname, 'src/offscreen.html'),
          to: path.join(__dirname, 'dist'),
          context: 'public',
        },
        {
          from: path.join(__dirname, 'src/notification.html'),
          to: path.join(__dirname, 'dist'),
          context: 'public',
        },
        {
          from: path.join(__dirname, 'src/popup.html'),
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
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  externals: ['fs'],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
};
