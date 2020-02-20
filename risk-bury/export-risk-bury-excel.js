const Excel = require('exceljs');
const DiffArrOfObj = require('diff-arrays-of-objects');

// 当前生成的埋点数据
const riskBuryConfig = require('./risk-bury-config.json');

// 上个版本埋点数据
let riskBuryConfigOld = [];

// 差异
let diffObj = null;

// 获取上一个版本埋点
try {
	riskBuryConfigOld = require('./risk-bury-config-old.json');
} catch (error) {
	console.log('确定这是第一次生成风控埋点吗，如果不是，请提供上一个版本的风控埋点数据');
}

// 事件类型说明
const acidRemarkObj = {
	focus: '获得焦点时间',
	blur: '失去焦点上报输入时长，输入内容，失去焦点次数',
	delete: '删除按钮点击次数',
	paste: '粘贴',
	value: '值',
	click: '点击'
};

// 拉平数据
const riskBuryConfigFlattening = flatten(riskBuryConfig);
const riskBuryConfigOldFlattening = flatten(riskBuryConfigOld);

// 比较差异
if (riskBuryConfigOld && riskBuryConfigOld.length) {
	diffObj = DiffArrOfObj(riskBuryConfigOldFlattening, riskBuryConfigFlattening, 'uuid');
	if (diffObj.added.length === 0 && diffObj.updated.length === 0 && diffObj.removed.length === 0) {
		console.log('本次修改没有改动点 确定吗？？？？？？');
	}
}

const workbook = new Excel.Workbook();
workbook.creator = 'fronter';
workbook.lastModifiedBy = 'fronter';
workbook.created = new Date();
workbook.modified = new Date();

let sheet = workbook.addWorksheet('风控埋点统计');

sheet.columns = [
	{ header: '事件所在页面及位置', key: 'title', width: 30 },
	{ header: '页面编码', key: 'pId', width: 15 },
	{ header: '埋点事件', key: 'bury', width: 25 },
	{ header: '事件名称', key: 'remark', width: 25 },
	{ header: 'acid', key: 'acid', width: 10 },
	{ header: 'acid 说明', key: 'acidRemark', width: 55 },
	{ header: '唯一索引值', key: 'uuid', width: 60 }
];

sheet.getColumn(7).hidden = true;

sheet.addRows(riskBuryConfigFlattening);

// 末尾添加移除的埋点
if (riskBuryConfigOld && riskBuryConfigOld.length) {
	diffObj.removed.forEach((item) => {
		sheet.addRows([item]);
	});
}

sheet.addRows([{}]);

sheet.addRows([
	{
		title: '颜色说明',
		pId: '新增',
		bury: '修改',
		remark: '删除'
	}
]);

// 遍历行 修改样式
let beforeRowLength =
	riskBuryConfigFlattening.length +
	(diffObj && diffObj.removed && diffObj.removed.length ? diffObj.removed.length : 0);
sheet.eachRow((row, rowNumber) => {
	if (rowNumber > 1) {
		row.height = 20;
		row.alignment = { vertical: 'middle', horizontal: 'center' };
		row.font = { color: { argb: 'FF5c6b77' }, size: 14 };
		row.getCell(6).alignment = { vertical: 'middle', horizontal: 'left' };
		row.getCell(7).alignment = { vertical: 'middle', horizontal: 'left' };
		if (riskBuryConfigOld && riskBuryConfigOld.length) {
			if (diffObj.added.some((item) => item.uuid === row.values[7])) {
				row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff19be6b' } };
				row.font = { color: { argb: 'FFFFFFFF' }, size: 14 };
				row.border = {
					bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
					right: { style: 'thin', color: { argb: 'FFcccccc' } }
				};
			} else if (diffObj.updated.some((item) => item.uuid === row.values[7])) {
				row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff2db7f5' } };
				row.font = { color: { argb: 'FFFFFFFF' }, size: 14 };
				row.border = {
					bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
					right: { style: 'thin', color: { argb: 'FFcccccc' } }
				};
			} else if (diffObj.removed.some((item) => item.uuid === row.values[7])) {
				row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffed3e12' } };
				row.font = { color: { argb: 'FFFFFFFF' }, size: 14 };
				row.border = {
					bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
					right: { style: 'thin', color: { argb: 'FFcccccc' } }
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

			row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ff2db7f5' } };
			row.getCell(3).font = { color: { argb: 'FFFFFFFF' }, size: 14 };

			row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffed3e12' } };
			row.getCell(4).font = { color: { argb: 'FFFFFFFF' }, size: 14 };
		}
	} else {
		// 设置表头样式
		row.height = 30;
		row.font = { color: { argb: 'FF515a6e' }, size: 16, bold: true };
		row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe9e9e9' } };
		row.alignment = { vertical: 'middle', horizontal: 'center' };
		row.border = {
			bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
			right: { style: 'thin', color: { argb: 'FFcccccc' } }
		};
	}
});

// A 65
// 合并单元格
for (let i = 1; i < sheet.columns.length + 1; i++) {
	let currentCol = sheet.getColumn(i);
	let currentColChart = String.fromCharCode(65 + i - 1);
	let lastValue = '';
	let lastIndex = '';
	let repetNum = 0;
	if (i === 5 || i === 6) {
		break;
	}
	currentCol.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
		if (rowNumber > 1) {
			if (!lastValue) {
				lastValue = cell.value;
				lastIndex = `${currentColChart}${rowNumber}`;
				repetNum = 0;
			} else if (lastValue === cell.value) {
				repetNum++;
			} else {
				if (repetNum) {
					sheet.mergeCells(`${lastIndex}:${currentColChart}${rowNumber - 1}`);
				}
				lastValue = cell.value;
				lastIndex = `${currentColChart}${rowNumber}`;
				repetNum = 0;
			}
		}
	});
}

workbook.xlsx.writeFile('risk-bury/风控埋点统计.xlsx');

// 将数据拉平
function flatten(data) {
	let flattenData = [];

	data.forEach((page) => {
		if (page.bury && page.bury.length) {
			page.bury.forEach((item) => {
				if (item.actContain && item.actContain.length) {
					item.actContain.forEach((event) => {
						flattenData.push({
							title: page.title,
							pId: page.pId,
							uuid: `${page.pId}--${item.key}--${event}`,
							bury: item.key,
							remark: item.remark,
							acid: event,
							acidRemark: acidRemarkObj[event]
						});
					});
				} else {
					flattenData.push({
						title: page.title,
						pId: page.pId,
						uuid: `${page.pId}--${item.key}`,
						bury: item.key,
						remark: item.remark,
						acid: 'click',
						acidRemark: acidRemarkObj.click
					});
				}
			});
		} else {
			flattenData.push({
				title: page.title,
				pId: page.pId,
				uuid: `${page.pId}`
			});
		}
	});
	return flattenData;
}
