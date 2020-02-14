/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 17:39:08
 */
export default [
	{
		path: '/mine/mine_page',
		zhName: 'grzx',
		title: '个人中心',
		arrowHide: 'empty',
		component: () => import('pages/mine/mine_page'),
		footerHide: false
	},
	{
		path: '/mine/bind_credit_page',
		zhName: 'qrkxx',
		title: '确认卡信息',
		component: () => import('pages/mine/bind_credit_page')
	},
	{
		path: '/mine/bind_save_page',
		zhName: 'bdcxk',
		title: '绑定储蓄卡',
		component: () => import('pages/mine/bind_save_page')
	},
	{
		path: '/mine/select_credit_page',
		zhName: 'xzxyk',
		title: '选择信用卡',
		component: () => import('pages/mine/select_credit_page')
	},
	{
		path: '/mine/select_save_page',
		zhName: 'xzcxk',
		title: '选择储蓄卡',
		component: () => import('pages/mine/select_save_page')
	},

	{
		path: '/mine/support_credit_page',
		zhName: 'xykzcyhklx',
		title: '信用卡支持银行类型',
		component: () => import('pages/mine/support_credit_page')
	},
	{
		path: '/mine/support_save_page',
		zhName: 'cukzcyhlx',
		title: '储蓄卡支持银行类型',
		component: () => import('pages/mine/support_save_page')
	},
	{
		path: '/mine/credit_list_page',
		zhName: 'xk',
		title: '选卡',
		component: () => import('pages/mine/credit_list_page')
	},
	{
		path: '/mine/fqa_page',
		zhName: 'cjwt',
		title: '常见问题',
		component: () => import('pages/mine/fqa_page')
	},
	{
		path: '/mine/coupon_page',
		zhName: 'yhq',
		title: '优惠劵',
		component: () => import('pages/mine/coupon_page')
	},
	{
		path: '/mine/qiyu_page',
		zhName: 'zxkf',
		title: '在线客服',
		component: () => import('pages/mine/qiyu_page')
	},
	{
		path: '/mine/help_center_page',
		zhName: 'bzzx',
		title: '帮助中心',
		component: () => import('pages/mine/help_center_page')
	},
	{
		path: '/mine/question_category_page',
		title: '',
		zhName: 'wtfl',
		component: () => import('pages/mine/question_category_page')
	},
	{
		path: '/mine/feedback_page',
		title: '意见分类',
		zhName: 'yjfl',
		component: () => import('pages/mine/feedback_page')
	},
	{
		path: '/mine/feedback_save_page',
		title: '意见反馈',
		zhName: 'yjfk',
		component: () => import('pages/mine/feedback_save_page')
	}
];
