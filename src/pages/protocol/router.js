/*
 * @Author: shawn
 * @LastEditTime : 2020-01-11 10:43:43
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
		path: '/protocol/pdf_page',
		title: '',
		zhName: 'pdf',
		component: () => import('pages/protocol/pdf_page')
	}
];
