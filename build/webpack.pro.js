const plugins = require('./webpack.plugins.config.js');

module.exports = [
  require('./webpack.common')({
    devTool: '#source-map', // 增加map文件
    mode: 'production',
    dropConsole: true,
    publicPath: '/',
    bundleHash: true,
    plugins: plugins.getProdPlugins(),
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
