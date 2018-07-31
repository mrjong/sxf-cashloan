const antdTheme = require('../antd-theme.json');
const path = require('path');

module.exports = function (options) {
  return {
    mode: options.mode,
    devtool: options.devTool, // 配置生成Source Maps，选择合适的选项
    entry: ['babel-polyfill', path.join(__dirname, '../src/app.js')],
    resolve: {
      extensions: ['.js', '.jsx', '.png', '.scss'],
    },
    output: {
      filename: options.bundleHash ? 'bundle-[hash].js' : 'bundle.js',
      path: path.join(__dirname, '../dist'),
      chunkFilename: 'chunk-[id]-[hash].js',
      publicPath: options.publicPath,
    },
    module: {
      // 在配置文件里添加JSON loader
      rules: [
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
        {
          test: /\.(jsx|js)?$/,
          loader: options.bundleHash ? 'babel-loader' : 'happypack/loader?id=happybabel',
          exclude: /(node_modules)/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'postcss-loader'],
        },
        {
          test: /\.(scss)$/,
          exclude: /(node_modules)/,
          loader: [
            'style-loader', // creates style nodes from JS strings,
            'css-loader?modules&localIdentName=[name]-[local][hash]',
            'postcss-loader',
            'sass-loader', // compiles Sass to CSS
          ],
        },
        {
          test: /\.less?$/,
          use: [
            'style-loader', // creates style nodes from JS strings,
            'postcss-loader',
            // "less-loader", // compiles Sass to CSS
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
                modifyVars: antdTheme,
              },
            },
          ],
        },
        {
          test: /\.html$/,
          loader: 'html-loader',
        },
        {
          test: /\.md$/,
          loader: ['html-loader', 'markdown-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'img/[name]-[hash:8].[ext]',
          },
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'media/[name].[hash:7].[ext]',
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'fonts/[name].[hash:7].[ext]',
          },
        },
      ],
    },

    plugins: options.plugins,
    devServer: {
      hot: true,
      host: '0.0.0.0',
      port: 8010,
      publicPath: '/',
      clientLogLevel: 'none',
      contentBase: path.resolve(__dirname, '../src'),
      historyApiFallback: true,
      stats: {
        cached: false,
        exclude: [/node_modules[\\/]react(-router)?[\\/]/, /node_modules[\\/]items-store[\\/]/],
      },
      disableHostCheck: true,
      proxy: {
        '/wap': {
          target: 'http://172.16.154.47:8080/wap', //目标接口域名
          pathRewrite: { '^/wap': '' }, //重写接口
          changeOrigin: true, //是否跨域
          // demo=>  'http://localhost:8080/api' ===> 'http://www.abc.com/api'
        },
        //  '/fqa': {
        //   target: 'http://172.18.40.173:8080/disting', //目标接口域名
        //   changeOrigin: true, //是否跨域
        //   // demo=>  'http://localhost:8080/api' ===> 'http://www.abc.com/api'
        // }
      },
    },
    optimization: options.optimization,
    resolve: {
      extensions: ['.js', '.md', '.txt'],
      alias: {
        pages: path.resolve(__dirname, '../src/pages'),
        components: path.resolve(__dirname, '../src/components'),
        utils: path.resolve(__dirname, '../src/utils'),
        routers: path.resolve(__dirname, '../src/routers'),
        assets: path.resolve(__dirname, '../src/assets'),
        example: path.resolve(__dirname, '../src/example'),
      },
    },
  };
};
