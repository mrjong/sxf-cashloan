export default [
  {
    path: '/order/order_page',
    title: '还款',
    arrowHide: 'empty',
    component: () => import('pages/order/order_page'),
    footerHide: false,
  },
  {
    path: '/order/repayment_succ_page',
    title: '还款完成',
    arrowHide: 'empty',
    component: () => import('pages/order/repayment_succ_page'),
  },
  {
    path: '/order/order_detail_page',
    title: '订单详情',
    component: () => import('pages/order/order_detail_page'),
  },
  {
    path: '/order/overdue_progress_page',
    title: '逾期信用进度',
    component: () => import('pages/order/overdue_progress_page'),
  },
];
