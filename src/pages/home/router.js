/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-09 18:15:18
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
		path: '/home/moxie_bank_list_page',
		zhName: 'tjxyk',
		title: '添加信用卡',
		component: () => import('pages/home/moxie_bank_list_page')
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
		path: '/home/crawl_progress_page',
		zhName: 'tjjd',
		title: '添加进度',
		component: () => import('pages/home/crawl_progress_page')
	},
	{
		path: '/home/crawl_fail_page',
		zhName: 'tjjd2',
		title: '添加进度',
		component: () => import('pages/home/crawl_fail_page')
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
		path: '/home/reco_contact_page',
		zhName: 'tjlxr',
		title: '推荐联系人',
		component: () => import('pages/home/reco_contact_page')
	},
	{
		path: '/home/contact_result_page',
		zhName: 'zdlxr',
		title: '指定联系人',
		component: () => import('pages/home/contact_result_page')
	},
	{
		path: '/home/modify_contact_page',
		zhName: 'xglxr',
		title: '修改联系人',
		component: () => import('pages/home/modify_contact_page')
	},
	{
		path: '/home/add_contact_page',
		zhName: 'kzdlxr',
		title: '指定联系人',
		component: () => import('pages/home/add_contact_page')
	}
];
