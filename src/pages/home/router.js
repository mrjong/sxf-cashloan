/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-03-24 18:07:14
 */
export default [
	{
		path: '/home/home',
		zhName: 'jqhxyk',
		title: '借钱还信用卡',
		footerHide: false,
		arrowHide: 'empty',
		component: () => import('pages/home/home_page')
	},
	// {
	//   path: '/home/home',
	//    zhName:'hk',
	// title: '还卡',
	//   footerHide: false,
	//   arrowHide: 'empty',
	//   component: () => import('pages/home/home_new_page'),
	// },
	{
		path: '/home/message_page',
		zhName: 'xxzx',
		title: '消息中心',
		component: () => import('pages/home/message_page')
	},
	{
		path: '/home/message_detail_page',
		zhName: 'ckxq',
		title: '查看详情',
		component: () => import('pages/home/message_detail_page')
	},
	{
		path: '/home/essential_information',
		zhName: 'wsxx',
		title: '完善信息',
		component: () => import('pages/home/essential_information_page')
	},
	{
		path: '/home/real_name',
		zhName: 'smrz',
		title: '实名认证',
		component: () => import('pages/home/real_name_page')
	},
	{
		path: '/home/confirm_agency',
		zhName: 'qyjk',
		title: '签约借款',
		component: () => import('pages/home/confirm_agency_page')
	},
	{
		path: '/home/loan_repay_confirm_page',
		zhName: 'sqjqhk',
		title: '申请借钱还卡',
		component: () => import('pages/home/loan_repay_confirm_page')
	},
	{
		path: '/home/credit_apply_succ_page',
		zhName: 'kspgz',
		title: '快速评估中',
		component: () => import('pages/home/credit_apply_succ_page')
	},
	{
		path: '/home/loan_apply_succ_page',
		zhName: 'ksdkz',
		title: '快速打款中',
		component: () => import('pages/home/loan_apply_succ_page')
	},
	{
		path: '/home/loan_fenqi',
		zhName: 'jkxxqr',
		title: '借款信息确认',
		component: () => import('pages/home/loan_fenqi_page')
	},
	{
		path: '/home/deposit_tip',
		zhName: 'txtx',
		title: '提现提醒',
		component: () => import('pages/home/deposit_tip_page')
	},
	{
		path: '/home/loan_person_succ_page',
		zhName: 'ddrgsh',
		title: '等待人工审核',
		component: () => import('pages/home/loan_person_succ_page')
	},
	{
		path: '/home/payment_notes',
		zhName: 'jkxz',
		title: '借款须知',
		component: () => import('pages/home/payment_notes')
	},
	{
		path: '/home/loan_robot_succ_page',
		zhName: 'ddjqrsh',
		title: '等待人工审核',
		component: () => import('pages/home/loan_robot_succ_page')
	},
	{
		path: '/home/addInfo',
		zhName: 'wsbcxx',
		title: '完善补充信息',
		component: () => import('pages/home/addInfo')
	},
	// {
	// 	path: '/home/reco_contact_page',
	// 	zhName: 'tjlxr',
	// 	title: '补充联系人',
	// 	component: () => import('pages/home/reco_contact_page')
	// },
	// {
	// 	path: '/home/contact_result_page',
	// 	zhName: 'zdlxr',
	// 	title: '确认联系人',
	// 	component: () => import('pages/home/contact_result_page')
	// },
	// {
	// 	path: '/home/modify_contact_page',
	// 	zhName: 'xglxr',
	// 	title: '修改联系人',
	// 	component: () => import('pages/home/modify_contact_page')
	// },
	{
		path: '/home/add_contact_page',
		zhName: 'zdlxr',
		title: '确认联系人',
		component: () => import('pages/home/add_contact_page')
	},
	{
		path: '/home/pre_loan',
		zhName: 'ysxqyjk',
		title: '签约借款',
		component: () => import('pages/home/pre_loan_page')
	},
	{
		path: '/home/pre_add_contact_page',
		zhName: 'ysxbclxr',
		title: '补充联系人',
		component: () => import('pages/home/pre_add_contact_page')
	},
	{
		path: '/home/insurance_introduce_page',
		zhName: 'fxbzjh',
		title: '什么是风险保障计划',
		component: () => import('pages/home/insurance_introduce_page')
	},
	{
		path: '/home/insurance_result_page',
		zhName: 'fxpgjg',
		title: '风险评估结果',
		component: () => import('pages/home/insurance_result_page')
	}
];
