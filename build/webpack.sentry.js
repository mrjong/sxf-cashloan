const plugins = require('./webpack.plugins.config.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = [
  require('./webpack.common')({
    devTool: '#source-map',
    mode: 'production',
    dropConsole: true,
    publicPath: '/',
    bundleHash: true,
    plugins: plugins.getSentryPlugins(),
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true, // set to true if you want JS source maps
                uglifyOptions: {
                    compress: true
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ],
        splitChunks: {
            minSize: 300000,
            maxSize: 800000,
            cacheGroups: {
                commons: {
                    chunks: 'all',
                    minChunks: 4,
                    name: 'commons',
                    enforce: true
                }
            }
        }
    }
  }),
];
