/**
 * 外链url配置
 */

const { PROJECT_ENV } = process.env;

const envMap = {
	dev: {
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 开发环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-test.vbillbank.com',
		// MARKET_URL: 'https://fuf-test.vbillbank.com/static/loanSupermarket/page/home.html' //外部代超页
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/loanSupermarket/page/home.html' //外部代超页
	},
	test: {
		DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 测试环境 MPOS_APP与MPOS_CM渠道不同
		PDF_URL: 'https://lns-wap-test.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-test.vbillbank.com',
		// MARKET_URL: 'https://fuf-test.vbillbank.com/static/loanSupermarket/page/home.html' //外部代超页
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/loanSupermarket/page/home.html' //外部代超页
	},
	pro: {
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap.vbillbank.com',
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/loanSupermarket/page/home.html' //外部代超页
	},
	rc: {
		DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 生产地址
		PDF_URL: 'https://lns-wap-rc.vbillbank.com/wap', // pdf预览的接口url
		BASE_URL: 'https://lns-wap-rc.vbillbank.com',
		// MARKET_URL: 'https://fuf-test.vbillbank.com/static/loanSupermarket/page/home.html' //外部代超页
		MARKET_URL: 'https://fuf-front.vbillbank.com/static/loanSupermarket/page/home.html' //外部代超页
	}
};

export default envMap[PROJECT_ENV];
