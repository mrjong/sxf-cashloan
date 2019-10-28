/*
 * @Author: shawn
 * @LastEditTime: 2019-10-28 15:14:41
 */
export default [
	{
		path: '/protocol/privacy_agreement_page',
		title: '用户隐私权政策',
		zhName: 'sxfyhyszc',
		component: () => import('pages/protocol/privacy_agreement_page')
	},
	{
		path: '/protocol/register_agreement_page',
		title: '随行付金融用户注册协议',
		zhName: 'sxfjryhzcxy',
		component: () => import('pages/protocol/register_agreement_page')
	},
	{
		path: '/protocol/loan_contract_page',
		title: '借款合同',
		zhName: 'jkht',
		component: () => import('pages/protocol/loan_contract_page')
	},
	{
		path: '/protocol/delegation_withhold_page',
		title: '委托扣款协议',
		zhName: 'wtkkxy',
		component: () => import('pages/protocol/delegation_withhold_page')
	},
	{
		path: '/protocol/financial_service_page',
		title: '随行付金融服务协议',
		zhName: 'sxfjrfwxy',
		component: () => import('pages/protocol/financial_service_page')
	},
	{
		path: '/protocol/financial_service_page_sxpay',
		title: '随行付金融服务协议',
		zhName: 'xyfjrfwxy',
		component: () => import('pages/protocol/financial_service_page_sxpay')
	},
	{
		path: '/protocol/shortcut_bind_card_page',
		title: '随行付快捷绑卡支付协议',
		zhName: 'sxfkjbkzfxy',
		component: () => import('pages/protocol/shortcut_bind_card_page')
	},
	{
		path: '/protocol/club_vip_service_page',
		title: '随行付VIP俱乐部会员服务协议',
		zhName: 'sxfvipjlbhyfwxy',
		component: () => import('pages/protocol/club_vip_service_page')
	},
	{
		path: '/protocol/pdf_page',
		title: '',
		zhName: 'pdf',
		component: () => import('pages/protocol/pdf_page')
	},
	{
		path: '/protocol/personal_auth_page',
		title: '个人信息授权书',
		zhName: 'grxxsqs',
		component: () => import('pages/protocol/personal_auth_page')
	},
	{
		path: '/protocol/personal_credit_page',
		zhName: 'xyfxgzs',
		title: '信用风险告知书',
		component: () => import('pages/protocol/personal_credit_page')
	},
	{
		path: '/protocol/credit_query_page',
		zhName: 'grxyxxcxsqs',
		title: '个人信用信息查询授权书',
		component: () => import('pages/protocol/credit_query_page')
	},
	{
		path: '/protocol/overdue_effect_page',
		zhName: 'grxyyqyxgzs',
		title: '个人信用逾期影响告知书',
		component: () => import('pages/protocol/overdue_effect_page')
	}
];
