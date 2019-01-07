export default [
	{
		path: '/activity/dazhuanpan_page',
		title: '大转盘',
		arrowHide: true,
		component: () => import('pages/activity/dazhuanpan_page')
    },
    {
		path: '/activity/wxshare_page',
        title: '微信分享',
        arrowHide: 'empty',
        headerHide: true,
		component: () => import('pages/activity/wxshare_page')
	}
];
