export default [
	{
		path: '/mpos/mpos_middle_page',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/mpos/mpos_middle_page')
	},
	{
		path: '/mpos/mpos_service_authorization_page',
		title: '随行付金融',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/mpos/mpos_service_authorization_page')
	},
	{
		path: '/mpos/mpos_get_sms_page',
		title: '短信验证',
		component: () => import('pages/mpos/mpos_get_sms_page')
	},
	{
		path: '/mpos/mpos_ioscontrol_page',
		title: '关注微信抽免息礼包', // mpos用户导流公众号落地页
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/mpos/mpos_ioscontrol_page')
	}
];
