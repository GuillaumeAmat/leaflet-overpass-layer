
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractCSS = new ExtractTextPlugin('OverPassLayer.css');

var plugins = [
    extractCSS
];

plugins.push(
    new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        mangle: true,
        output: {
          comments: false
        },
        compress: {
          warnings: false
        }
    })
);


module.exports = {
    devtool: 'source-map',
    debug: true,
    plugins: plugins,
    context: path.join(__dirname, 'src'),
    entry: {
        OverPassLayer: './OverPassLayer'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    externals: {
        'leaflet': 'L',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: extractCSS.extract(['css'])
            },
        ]
    },
};
