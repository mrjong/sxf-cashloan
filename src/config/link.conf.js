/*
 * @Author: shawn
 * @LastEditTime: 2019-09-02 15:33:56
 */
/**
 * 外链url配置
 */

const { PROJECT_ENV } = process.env;

const envMap = {
	dev: {
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 开发环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-test.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	},
	test: {
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 测试环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-test.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	},
	pro: {
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	},
	rc: {
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap-rc.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-rc.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/ls/page/home.html?c1=1000022&c2=1000023', //外部代超页
		APPSTORE_URL: 'https://itunes.apple.com/cn/app/id1439290777?mt=8'
	}
};

export default envMap[PROJECT_ENV];
