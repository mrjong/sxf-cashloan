export default [
  {
    path: '/mine/mine_page',
    title: '个人中心',
    arrowHide: true,
    component: () => import('pages/mine/mine_page'),
    footerHide: false,
  },
  {
    path: '/mine/bind_credit_page',
    title: '绑定信用卡',
    component: () => import('pages/mine/bind_credit_page'),
  },
  {
    path: '/mine/credit_extension_page',
    title: '风控授信项',
    component: () => import('pages/mine/credit_extension_page'),
  },
  // {
  //   path: '/mine/credit_extension_page',
  //   title: '选择银行卡',
  //   component: () => import('pages/mine/credit_extension_page'),
  // },
];
