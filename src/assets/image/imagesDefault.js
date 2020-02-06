/*
 * @Author: shawn
 * @LastEditTime : 2020-01-13 17:26:41
 */
export default {
	/* 先按照不同功能划分 */

	// 公用图片
	common: {
		a: 'fe'
	},

	activity: {},

	gif: {
		btn_loading: require('./gif/loading.gif')
	},

	// 装饰性的图片
	adorn: {
		id_card_front: require('./adorn/id_card_front.png'),
		id_card_front_success: require('./adorn/id_card_front_success.png'),
		id_card_after: require('./adorn/id_card_after.png'),
		id_card_after_success: require('./adorn/id_card_after_success.png')
	},

	// 银行图标 单独放这
	bank: {},

	// 放置在页面顶部、底部的广告、装饰图案等长方形的图片
	banner: {},

	// 背景
	bg: {
		id_card_tip: require('./bg/id_card_tip.png'),
		navBarBg: require('./bg/navBarBg.png')
	},

	// 按钮
	btn: {},

	// 图标类
	icon: {
		trigon_right_black: require('./icon/trigon_right_black.png')
	},

	// 标志性的图片
	logo: {},

	other: {},

	//导航图片
	tabnav: {
		mine_page_card: require('./tabnav/bank_card.png'),
		mine_page_coupon: require('./tabnav/coupon.png'),
		mine_page_msg: require('./tabnav/msg.png')
	},

	/* 以下就是不同页面的图片 */

	// 首页
	home: {
		a: 'fe'
	},

	// 账单
	order: {
		a: 'fe'
	},

	// 我的
	mine: {
		a: 'fe'
	},

	// 登录页
	logoin: {
		a: 'fe'
	},

	// webview
	webpage: {
		a: 'fe'
	},

	// 错误页
	error: {
		a: 'fe'
	}
};
