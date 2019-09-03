/*
 * @Author: shawn
 * @LastEditTime: 2019-09-03 15:19:42
 */
/**
 * 外链url配置
 */

const { PROJECT_ENV } = process.env;

const envMap = {
	dev: {
		MD_URL: 'https://fbds-test.vbillbank.com',
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 开发环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-test.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023' //外部代超页
	},
	test: {
		MD_URL: 'https://fbds-test.vbillbank.com',
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 测试环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-test.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023' //外部代超页
	},
	pro: {
		MD_URL: 'https://fbds-test.vbillbank.com',
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023' //外部代超页
	},
	rc: {
		MD_URL: 'https://fbds-test.vbillbank.com',
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap-rc.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-rc.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023' //外部代超页
	}
};

export default envMap[PROJECT_ENV];
