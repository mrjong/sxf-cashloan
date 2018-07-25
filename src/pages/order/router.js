export default [
    {
      path: '/order/order_page',
      title: '账单',
      arrowHide: true,
      component: () => import('pages/order/order_page'),
      footerHide: false,
    },
    {
      path: '/order/repayment_succ_page',
      title: '还款完成',
      arrowHide: true,
      component: () => import('pages/order/repayment_succ_page'),
      footerHide: false,
    },
  ];
