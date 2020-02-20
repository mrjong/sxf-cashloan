/*
 * @Author: shawn
 * @LastEditTime : 2020-02-19 16:24:57
 */
const fs = require('fs');
const path = require('path');
const filePath = path.resolve('src/pages');
const getTime = require('./time');
let riskBuryConfigData = [];

// 遍历文件，生成埋点数据
fileDisplay(filePath);

// 导出分控埋点数据 json 文件
fs.writeFileSync(
	path.join(__dirname, `risk-bury-config${getTime('yyyy-MM-dd-hh-mm-ss')}.json`),
	JSON.stringify(riskBuryConfigData, null, 2)
);
fs.writeFileSync(path.join(__dirname, 'risk-bury-config.json'), JSON.stringify(riskBuryConfigData, null, 2));

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath) {
	//根据文件路径读取文件，返回文件列表
	const files = fs.readdirSync(filePath);
	files.forEach((filename) => {
		// 获取当前文件的绝对路径
		const localdir = path.join(filePath, filename);
		// 据文件路径获取文件信息，返回一个fs.Stats对象
		let fileType = fs.statSync(localdir);

		// 如果是文件夹
		if (fileType.isDirectory()) {
			fileDisplay(localdir);
		}
		// 如果是文件
		if (fileType.isFile()) {
			// 如果文件名是 riskBuryConfig.js
			if (filename === 'riskBuryConfig.js') {
				const { common, ...otherModule } = require(localdir);

				const bury = Object.keys(otherModule).map((key) => otherModule[key]);

				let riskBuryConfigDataItem = {
					...common,
					bury
				};
				riskBuryConfigData.push(riskBuryConfigDataItem);
			}
		}
	});
}
