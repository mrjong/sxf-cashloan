const express = require('express');
const fs = require('fs');
const router = express.Router();
// const fetch = require('node-fetch');
const sourceMap = require('source-map');
const path = require('path');
const resolve = file => path.resolve(__dirname, file);

router.post('/errorReport', function (req, res) {
  let error = req.body
  let url = error.scriptURI
  if (url.indexOf('bundle') === -1) {
    let fileUrl = url.slice(url.indexOf('chunk')) + '.map'
    console.log(resolve('../../dist/'+fileUrl))
    let smc = new sourceMap.SourceMapConsumer(fs.readFileSync(resolve('../../dist/' + fileUrl), 'utf-8'));

    // console.log(fs.readFileSync(resolve('../../dist/'+fileUrl)))
    smc.then(function (result) {
      // 解析原始报错数据
      let ret = result.originalPositionFor({
        line: error.lineNo, // 压缩后的行号
        column: error.columnNo // 压缩后的列号
      });
      let info = {
        errorMessage: error.errorMessage, // 报错信息
        source: ret.source, // 报错文件路径
        line: ret.line, // 报错文件行号
        column: ret.column, // 报错文件列号
        stack: error.stack // 报错堆栈
      }
      res.json(info)
      console.log('结果', info);
    })
  }
})
module.exports = router