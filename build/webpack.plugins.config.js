let webpack = require('webpack');
let CompressionPlugin = require('compression-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackZipPlugin = require('webpack-zip-plugin');
let path = require('path');
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 4 });
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let SentryPlugin = require('@sentry/webpack-plugin')

// 获取git版本
var fs = require("fs");
var gitHEAD = fs.readFileSync('.git/HEAD', 'utf-8').trim(); // ref: refs/heads/develop
var ref = gitHEAD.split(': ')[1]; // refs/heads/develop
var develop = gitHEAD.split('/')[2]; // 环境：develop
var gitVersion = ref ? fs.readFileSync('.git/' + ref, 'utf-8').trim() : ''; // git版本号，例如：6ceb0ab5059d01fd444cf4e78467cc2dd1184a66
// var gitCommitVersion = '"' + develop + '_' + gitVersion + '"' // 例如dev环境: "develop: 6ceb0ab5059d01fd444cf4e78467cc2dd1184a66"
var gitCommitVersion = develop && gitVersion ? develop + '_' + gitVersion : gitHEAD;

var sentryTestVersion = 'sentry_test_' + gitCommitVersion;
var sentryVersion = 'sentry_' + gitCommitVersion;
let plugins = [
  new HtmlWebpackPlugin({
    filename: 'index.html', //生成的html的文件名
    template: path.resolve(__dirname, '../src/index.html'), //依据的模板
        title: 'sx-webpack',
    inject: true, //注入的js文件将会被放在body标签中,当值为'head'时，将被放在head标签中
    minify: {
      //压缩配置
      removeComments: true, //删除html中的注释代码
      collapseWhitespace: true, //删除html中的空白符
      removeAttributeQuotes: true //删除html元素中属性的引号
    },
    favicon: path.resolve(__dirname, '../src/favicon.ico'),
    chunksSortMode: 'dependency' //按dependency的顺序引入
  })
  // new webpack.ProvidePlugin({ $: 'jquery', _: 'lodash' })
];

//生产插件
let getProdPlugins = function() {
  fs.unlink(path.resolve(__dirname, '../.sentryclirc'), function(err){
    if(err) {
      console.error(err);
    } else {
      console.log('删除成功');
    }
  })
  var w_data = '[auth]\r\ntoken=a917cae3fb3046818a2b513ba53deb05323fdd8508ea4939b9fe13d41e6d1c71\r\n[defaults]\r\norg=sentry\r\nproject=cashloan-h5\r\nurl=https://sentry.vbillbank.com';
  var w_data = new Buffer(w_data);

  /**
   * filename, 必选参数，文件名
   * data, 写入的数据，可以字符或一个Buffer对象
   * [options],flag,mode(权限),encoding
   * callback 读取文件后的回调函数，参数默认第一个err,第二个data 数据
   */

  fs.writeFile(path.resolve(__dirname, '../.sentryclirc'), w_data, {flag: 'a'}, function (err) {
    if(err) {
      console.error(err);
    } else {
      console.log('写入成功');
    }
  });
  plugins.push(
    new CompressionPlugin({
      //压缩gzip
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  );
  plugins.push(
    new WebpackZipPlugin({
      initialFile: './dist', //需要打包的文件夹(一般为dist)
      endPath: './', //打包到对应目录（一般为当前目录'./'）
      zipName: +new Date() + 'copy-dist.zip' //打包生成的文件名
    })
  );
  plugins.push(new OptimizeCSSPlugin()); //压缩提取出的css，并解决ExtractTextPlugin分离出的js重复问题(多个文件引入同一css文件)
  plugins.push(new webpack.HashedModuleIdsPlugin());
  console.log(process.env.npm_config_report, 'npm run build --report');
  if (process.env.npm_config_report) {
    plugins.push(
      new BundleAnalyzerPlugin({
        //  可以是`server`，`static`或`disabled`。
        //  在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
        //  在“静态”模式下，会生成带有报告的单个HTML文件。
        //  在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
        analyzerMode: 'server',
        //  将在“服务器”模式下使用的主机启动HTTP服务器。
        analyzerHost: '127.0.0.1',
        //  将在“服务器”模式下使用的端口启动HTTP服务器。
        analyzerPort: 8010,
        //  路径捆绑，将在`static`模式下生成的报告文件。
        //  相对于捆绑输出目录。
        reportFilename: 'report.html',
        //  模块大小默认显示在报告中。
        //  应该是`stat`，`parsed`或者`gzip`中的一个。
        //  有关更多信息，请参见“定义”一节。
        defaultSizes: 'parsed',
        //  在默认浏览器中自动打开报告
        openAnalyzer: true,
        //  如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
        generateStatsFile: false,
        //  如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
        //  相对于捆绑输出目录。
        statsFilename: 'stats.json',
        //  stats.toJson（）方法的选项。
        //  例如，您可以使用`source：false`选项排除统计文件中模块的来源。
        //  在这里查看更多选项：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
        statsOptions: null,
        logLevel: 'info' //日志级别。可以是'信息'，'警告'，'错误'或'沉默'。
      })
    );
  }
  plugins.push(
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/assets/lib'), to: 'assets/lib' },
      { from: path.resolve(__dirname, '../*.txt'), to: './' },
      { from: path.resolve(__dirname, '../*.html'), to: './' },
      { from: path.resolve(__dirname, '../*.apk'), to: './' },
      { from: path.resolve(__dirname, '../static'),to: 'static',ignore: ['.*'] }
    ])
  );
  // plugins.push(
  //   new SentryPlugin({
  //     include: './dist',
  //     release: sentryVersion,
  //     configFile: 'sentry.properties',
  //     urlPrefix: '~/'
  //   })
  // );
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        PROJECT_ENV: JSON.stringify('pro'),
          RELEASE_VERSION: JSON.stringify(sentryVersion),
      },
      saUrl: JSON.stringify('https://www.vbillbank.com/shence/sa?project=production')
    })
  );
  plugins.push(
    new CleanWebpackPlugin('dist', {
      root: path.resolve(__dirname, '..'),
      verbose: true,
      dry: false
    })
  );
  return plugins;
};

// rc插件 神策暂时连在测试环境， 同时暂时不上传sourcemap到sentry
let getRcPlugins = function () {
  plugins.push(
    new CompressionPlugin({
      //压缩gzip
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ),
    plugins.push(
      new WebpackZipPlugin({
        initialFile: './dist', //需要打包的文件夹(一般为dist)
        endPath: './', //打包到对应目录（一般为当前目录'./'）
        zipName: +new Date() + 'copy-dist.zip' //打包生成的文件名
      })
    );
  plugins.push(new OptimizeCSSPlugin()); //压缩提取出的css，并解决ExtractTextPlugin分离出的js重复问题(多个文件引入同一css文件)
  plugins.push(new webpack.HashedModuleIdsPlugin());
  plugins.push(
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/assets/lib'), to: 'assets/lib' },
      { from: path.resolve(__dirname, '../*.txt'), to: './' },
      { from: path.resolve(__dirname, '../*.html'), to: './' },
      { from: path.resolve(__dirname, '../*.apk'), to: './' },
      { from: path.resolve(__dirname, '../static'),to: 'static',ignore: ['.*'] }
    ])
  ),
    plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('rc'),
          PROJECT_ENV: JSON.stringify('rc'),
          RELEASE_VERSION: JSON.stringify('rc'),
        },
        saUrl: JSON.stringify('/shence/sa')
      })
    );
  plugins.push(
    new CleanWebpackPlugin('dist', {
      root: path.resolve(__dirname, '..'),
      verbose: true,
      dry: false
    })
  );
  return plugins;
};

//测试插件
let getTestPlugins = function () {
  fs.unlink(path.resolve(__dirname, '../.sentryclirc'), function(err){
    if(err) {
      console.error(err);
    } else {
      console.log('删除成功');
    }
  })
  var w_data = '[auth]\r\ntoken=21f25df3191d4603b118687277749924f0dfcae27ea046efbc50c28ed4d9c44f\r\n[defaults]\r\norg=suixingpay\r\nproject=cashloan-h5\r\nurl=https://sentry-test.vbillbank.com';
  var w_data = new Buffer(w_data);

  /**
   * filename, 必选参数，文件名
   * data, 写入的数据，可以字符或一个Buffer对象
   * [options],flag,mode(权限),encoding
   * callback 读取文件后的回调函数，参数默认第一个err,第二个data 数据
   */

  fs.writeFile(path.resolve(__dirname, '../.sentryclirc'), w_data, {flag: 'a'}, function (err) {
    if(err) {
      console.error(err);
    } else {
      console.log('写入成功');
    }
  });
  plugins.push(
    new CompressionPlugin({
      //压缩gzip
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ),
    plugins.push(new OptimizeCSSPlugin());
  //压缩提取出的css，并解决ExtractTextPlugin分离出的js重复问题(多个文件引入同一css文件)
  plugins.push(new webpack.HashedModuleIdsPlugin());
  plugins.push(
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/assets/lib'), to: 'assets/lib' },
      { from: path.resolve(__dirname, '../*.txt'), to: './' },
      { from: path.resolve(__dirname, '../*.html'), to: './' },
      { from: path.resolve(__dirname, '../*.apk'), to: './' },
      { from: path.resolve(__dirname, '../static'),to: 'static',ignore: ['.*'] }
    ])
  ),
  // plugins.push(
  //   new SentryPlugin({
  //     include: './dist',
  //     release: sentryTestVersion,
  //     configFile: 'sentry.properties',
  //     urlPrefix: '~/'
  //   })
  // );
    plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development'),
          PROJECT_ENV: JSON.stringify('test'),
          RELEASE_VERSION: JSON.stringify(sentryTestVersion),
        },
        saUrl: JSON.stringify('/shence/sa')
      })
    );
  // plugins.push(
  //  new CleanWebpackPlugin('dist', {
  //    root: path.resolve(__dirname, '..'),
  //    verbose: true,
  //    dry: false
  //  })
  // );
  return plugins;
};

//开发插件
let getDevPlugins = function() {
  plugins.push(
    new webpack.HotModuleReplacementPlugin() //热更新插件
  );
  plugins.push(
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/assets/lib'), to: 'assets/lib' },
      { from: path.resolve(__dirname, '../*.txt'), to: './' },
            { from: path.resolve(__dirname, '../*.html'), to: './' },
      { from: path.resolve(__dirname, '../*.apk'), to: './' },
      { from: path.resolve(__dirname, '../static'),to: 'static',ignore: ['.*'] }
    ])
  ),
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        PROJECT_ENV: JSON.stringify('dev'),
        RELEASE_VERSION: JSON.stringify('dev'),
      },
      saUrl: JSON.stringify('/shence/sa')
      // saUrl: JSON.stringify('http://10.1.1.81:8106/sa'),
    })
  );
  // plugins.push(new webpack.HotModuleReplacementPlugin());
  plugins.push(
    new HappyPack({
      id: 'happybabel',
      loaders: [ 'babel-loader' ],
      threadPool: happyThreadPool,
      cache: true,
      verbose: true
    })
  );
  return plugins;
};

//导出
module.exports = {
  getProdPlugins,
  getDevPlugins,
  getTestPlugins,
  getRcPlugins,
};
