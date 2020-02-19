const Excel = require('exceljs');
const DiffArrOfObj = require('diff-arrays-of-objects');

// 当前生成的埋点数据
const buryConfig = require('./shengce-bury-config.json');

// 上个版本埋点数据
let buryConfigOld = [];

// 差异
let diffObj = null;

// 获取上一个版本埋点
try {
  buryConfigOld = require('./shengce-bury-config-old.json');
} catch (error) {
  console.log('确定这是第一次生成神策埋点吗，如果不是，请提供上一个版本的神策埋点数据');
}

// 比较差异
if (buryConfigOld && buryConfigOld.length) {
  diffObj = DiffArrOfObj(buryConfigOld, buryConfig, 'key');
  console.log(diffObj.added, 'added');
  console.log(diffObj.updated, 'updated');
  console.log(diffObj.removed, 'removed');
  if (diffObj.added.length === 0 && diffObj.updated.length === 0 && diffObj.removed.length === 0) {
    console.log('本次修改没有改动点 确定吗？？？？？？');
  }
}

const workbook = new Excel.Workbook();
workbook.creator = 'fronter';
workbook.lastModifiedBy = 'fronter';
workbook.created = new Date();
workbook.modified = new Date();

let sheet = workbook.addWorksheet('神策埋点统计');

sheet.columns = [
  { header: '神策埋点Key', key: 'key', width: 60 },
  { header: '备注', key: 'remark', width: 30 },
];

sheet.addRows(buryConfig);

// 末尾添加移除的埋点
if (buryConfigOld && buryConfigOld.length) {
  diffObj.removed.forEach(item => {
    sheet.addRows([item]);
  });
}

sheet.addRows([{}]);

sheet.addRows([
  {
    key: '颜色说明',
    remark: '新增',
  },
  {
    key: '颜色说明',
    remark: '修改',
  },
  {
    key: '颜色说明',
    remark: '删除',
  },
]);

// 遍历行 修改样式
let beforeRowLength = buryConfig.length + (diffObj && diffObj.removed && diffObj.removed.length ? diffObj.removed.length : 0);
sheet.eachRow((row, rowNumber) => {
  if (rowNumber > 1) {
    row.height = 20;
    row.alignment = { vertical: 'middle', horizontal: 'left' };
    row.font = { color: { argb: 'FF5c6b77' }, size: 14 };
    if (buryConfigOld && buryConfigOld.length) {
      if (diffObj.added.some(item => item.key === row.values[1])) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff19be6b' } };
        row.font = { color: { argb: 'FFFFFFFF' }, size: 14 };
        row.border = {
          bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
          right: { style: 'thin', color: { argb: 'FFcccccc' } },
        };
      } else if (diffObj.updated.some(item => item.key === row.values[1])) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff2db7f5' } };
        row.font = { color: { argb: 'FFFFFFFF' }, size: 14 };
        row.border = {
          bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
          right: { style: 'thin', color: { argb: 'FFcccccc' } },
        };
      } else if (diffObj.removed.some(item => item.key === row.values[1])) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffed3e12' } };
        row.font = { color: { argb: 'FFFFFFFF' }, size: 14 };
        row.border = {
          bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
          right: { style: 'thin', color: { argb: 'FFcccccc' } },
        };
      }
    }
    if (rowNumber === beforeRowLength + 2) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe9e9e9' } };
    }
    // 设置颜色说明
    if (rowNumber === beforeRowLength + 3) {
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff19be6b' } };
      row.getCell(2).font = { color: { argb: 'FFFFFFFF' }, size: 14 };
    }
    if (rowNumber === beforeRowLength + 4) {
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff2db7f5' } };
      row.getCell(2).font = { color: { argb: 'FFFFFFFF' }, size: 14 };
    }
    if (rowNumber === beforeRowLength + 5) {
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffed3e12' } };
      row.getCell(2).font = { color: { argb: 'FFFFFFFF' }, size: 14 };
    }
  } else {
    // 设置表头样式
    row.height = 30;
    row.font = { color: { argb: 'FF515a6e' }, size: 16, bold: true };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe9e9e9' } };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.border = {
      bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
      right: { style: 'thin', color: { argb: 'FFcccccc' } },
    };
  }
});

workbook.xlsx.writeFile('shengce-bury/神策埋点统计.xlsx');
