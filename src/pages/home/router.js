export default [
	{
		path: '/home/home',
		title: '还卡',
		footerHide: false,
		arrowHide: 'empty',
		component: () => import('pages/home/home_page')
	},
	// {
	//   path: '/home/home',
	//   title: '还卡',
	//   footerHide: false,
	//   arrowHide: 'empty',
	//   component: () => import('pages/home/home_new_page'),
	// },
	{
		path: '/home/message_page',
		title: '消息中心',
		component: () => import('pages/home/message_page')
	},
	{
		path: '/home/message_detail_page',
		title: '查看详情',
		component: () => import('pages/home/message_detail_page')
	},
	{
		path: '/home/agency',
		title: '代偿确认',
		component: () => import('pages/home/agency_page')
	},
	{
		path: '/home/essential_information',
		title: '完善信息',
		component: () => import('pages/home/essential_information_page')
	},
	{
		path: '/home/real_name',
		title: '实名认证',
		component: () => import('pages/home/real_name_page')
	},
	{
		path: '/home/confirm_agency',
		title: '确认代偿信息',
		component: () => import('pages/home/confirm_agency_page')
	},
	{
		path: '/home/moxie_bank_list_page',
		title: '添加信用卡',
		component: () => import('pages/home/moxie_bank_list_page')
	},
	{
		path: '/home/loan_repay_confirm_page',
		title: '申请借钱还卡',
		component: () => import('pages/home/loan_repay_confirm_page')
	},
	{
		path: '/home/credit_apply_succ_page',
		title: '提交申请成功',
		component: () => import('pages/home/credit_apply_succ_page')
	},
	{
		path: '/home/loan_apply_succ_page',
		title: '申请成功',
		component: () => import('pages/home/loan_apply_succ_page')
	},
	{
		path: '/home/loan_fenqi',
		title: '借款信息确认',
		component: () => import('pages/home/loan_fenqi_page')
	},
	{
		path: '/home/deposit_tip',
		title: '提现提醒',
		component: () => import('pages/home/deposit_tip_page')
	},
	{
		path: '/home/crawl_progress_page',
		title: '添加进度',
		component: () => import('pages/home/crawl_progress_page')
	},
	{
		path: '/home/crawl_fail_page',
		title: '添加进度',
		component: () => import('pages/home/crawl_fail_page')
	},
	{
		path: '/home/remit_ing_page',
		title: '快速打款中',
		component: () => import('pages/home/remit_ing_page')
	}
];
