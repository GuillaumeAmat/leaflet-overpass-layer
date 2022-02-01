const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const extractCSS = new ExtractTextPlugin('OverPassLayer.css');

const plugins = [extractCSS];

plugins.push(
  new UglifyJsPlugin({
    uglifyOptions: {
      minimize: true,
      mangle: true,
      output: {
        comments: false
      },
      compress: {
        warnings: false
      }
    }
  })
);

module.exports = {
  devtool: 'source-map',
  plugins: plugins,
  context: path.join(__dirname, 'src'),
  entry: {
    OverPassLayer: ['babel-polyfill', './OverPassLayer']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  externals: {
    leaflet: 'L'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: extractCSS.extract(['css-loader', 'postcss-loader'])
      }
    ]
  }
};
