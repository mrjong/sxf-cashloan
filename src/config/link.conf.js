/*
 * @Author: shawn
 * @LastEditTime: 2020-02-27 19:09:33
 */
/**
 * 外链url配置
 */

const { PROJECT_ENV } = process.env;

const envMap = {
	dev: {
		MD_URL: 'https://fbds-test.vbillbank.com',
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 开发环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/front', // pdf预览的接口url
		BASE_URL: 'https://lns-api-test.vbillbank.com',
		MARKET_URL: 'https://fuf-test.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	},
	test: {
		MD_URL: 'https://fbds-test.vbillbank.com',
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 测试环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/front', // pdf预览的接口url
		BASE_URL: 'https://lns-api-test.vbillbank.com',
		MARKET_URL: 'https://fuf-test.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	},
	pro: {
		MD_URL: 'https://fbds.vbillbank.com',
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap.vbillbank.com/front', // pdf预览的接口url
		BASE_URL: 'https://lns-api.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	},
	rc: {
		MD_URL: 'https://fbds-test.vbillbank.com',
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap-rc.vbillbank.com/front', // pdf预览的接口url
		BASE_URL: 'https://lns-api-rc.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	}
};

export default envMap[PROJECT_ENV];
