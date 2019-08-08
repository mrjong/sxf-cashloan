export default [
	{
		path: '/mpos/mpos_middle_page',
		zhName: 'mposzz',
		title: '',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/mpos/mpos_middle_page')
	},
	{
		path: '/mpos/mpos_service_authorization_page',
		zhName: 'mpossq',
		title: '随行付金融',
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/mpos/mpos_service_authorization_page')
	},
	{
		path: '/mpos/mpos_get_sms_page',
		zhName: 'dxyz',
		title: '短信验证',
		component: () => import('pages/mpos/mpos_get_sms_page')
	},
	{
		path: '/mpos/mpos_ioscontrol_page',
		zhName: 'gzwxcmxlb',
		title: '关注微信抽免息礼包', // mpos用户导流公众号落地页
		arrowHide: 'empty',
		headerHide: true,
		component: () => import('pages/mpos/mpos_ioscontrol_page')
	}
];
