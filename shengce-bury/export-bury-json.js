/*
 * @Author: shawn
 * @LastEditTime : 2020-02-04 10:59:02
 */
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const getTime = require('../risk-bury/time');

const rl = readline.createInterface({
  input: fs.createReadStream('./app/utils/analytinsType/index.js'),
});

let buryArr = [];
let tempObj = {};
let tempObjIndex = 0;

rl.on('line', line => {
  if (line) {
    const arr = line.split(' ');
    if (arr[0] === '//') {
      tempObj.remark = arr[1];
    } else {
      tempObj.key = arr[4].replace(/'|"|;/g, '');
      buryArr[tempObjIndex] = JSON.parse(JSON.stringify(tempObj));
      tempObj = {};
      tempObjIndex += 1;
    }
  }
});

rl.on('close', () => {
  fs.writeFileSync(path.join(__dirname, 'shengce-bury-config.json'), JSON.stringify(buryArr, null, 2));
  fs.writeFileSync(path.join(__dirname, `shengce-bury-config${getTime('yyyy-MM-dd-hh-mm-ss')}.json`), JSON.stringify(buryArr, null, 2));
});
