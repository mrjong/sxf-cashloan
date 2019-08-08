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
		path: '/mine/bind_bank_card',
		zhName: 'bdyhk',
		title: '绑定银行卡',
		component: () => import('pages/mine/bind_bank_card_page')
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
	// {
	//   path: '/mine/credit_extension_page',
	//   zhName:'ldy',
	// title: '信用加分',
	//   component: () => import('pages/mine/credit_extension_page'),
	// },
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
		path: '/mine/membership_card_page',
		zhName: 'hykgm',
		title: '会员卡购买',
		// arrowHide: true,
		component: () => import('pages/mine/membership_card_page')
	},
	{
		path: '/mine/confirm_purchase_page',
		zhName: 'qrgm',
		title: '确认购买',
		component: () => import('pages/mine/confirm_purchase_page')
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
		path: '/mine/wallet_page',
		zhName: 'wdqbzh',
		title: '我的钱包账户',
		component: () => import('pages/mine/wallet_page')
	},
	{
		path: '/mine/income_page',
		zhName: 'sr',
		title: '收入',
		component: () => import('pages/mine/income_page')
	},
	{
		path: '/mine/withdraw_page',
		zhName: 'tx',
		title: '提现',
		component: () => import('pages/mine/withdraw_page')
	},
	{
		path: '/mine/withdraw_succ_page',
		zhName: 'txcg',
		title: '提现成功',
		component: () => import('pages/mine/withdraw_succ_page')
	},
	{
		path: '/mine/withdraw_fail_page',
		zhName: 'txsb',
		title: '提现失败',
		component: () => import('pages/mine/withdraw_fail_page')
	},
	{
		path: '/mine/withdrawing_page',
		zhName: 'txz',
		title: '提现中',
		component: () => import('pages/mine/withdrawing_page')
	}
];
