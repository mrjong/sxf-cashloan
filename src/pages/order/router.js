/*
 * @Author: shawn
 * @LastEditTime: 2019-09-23 11:13:16
 */
export default [
	{
		path: '/order/order_page',
		zhName: 'hk',
		title: '还款',
		arrowHide: 'empty',
		component: () => import('pages/order/order_page'),
		footerHide: false
	},
	{
		path: '/order/repayment_succ_page',
		zhName: 'hkwc',
		title: '还款完成',
		arrowHide: 'empty',
		component: () => import('pages/order/repayment_succ_page')
	},
	{
		path: '/order/order_detail_page',
		zhName: 'ddxq',
		title: '订单详情',
		component: () => import('pages/order/order_detail_page')
	},
	{
		path: '/order/overdue_progress_page',
		zhName: 'yqxyjd',
		title: '逾期信用进度',
		component: () => import('pages/order/overdue_progress_page')
	},
	{
		path: '/order/wx_pay_success_page',
		zhName: 'zfjg',
		title: '支付结果',
		component: () => import('pages/order/wx_pay_success_page')
	},
	{
		path: '/order/order_repay_page',
		zhName: 'hkxx',
		title: '还款信息',
		component: () => import('pages/order/order_repay_page')
	},
	{
		path: '/order/order_repay_result',
		zhName: 'hkjg',
		title: '还款结果',
		component: () => import('pages/order/order_repay_result')
	},
	{
		path: '/order/order_repay_confirm',
		zhName: 'hkqr',
		title: '还款确认',
		component: () => import('pages/order/order_repay_confirm')
	}
];
