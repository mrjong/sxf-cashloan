const plugins = require('./webpack.plugins.config.js');

module.exports = [
  require('./webpack.common.js')({
    devTool: '#source-map',
    mode: 'production',
    dropConsole: true,
    publicPath: '/',
    bundleHash: true,
    plugins: plugins.getRcPlugins(),
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: 'initial',
            minChunks: 3,
            name: 'commons',
            enforce: true,
          },
        },
      },
    },
  }),
];
