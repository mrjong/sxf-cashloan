export default [
  {
    path: '/mine/mine_page',
    title: '个人中心',
    arrowHide: 'empty',
    component: () => import('pages/mine/mine_page'),
    footerHide: false,
  },
  {
    path: '/mine/bind_bank_card',
    title: '绑定银行卡',
    component: () => import('pages/mine/bind_bank_card'),
  },
  {
    path: '/mine/bind_credit_page',
    title: '绑定信用卡',
    component: () => import('pages/mine/bind_credit_page'),
  },
  {
    path: '/mine/bind_save_page',
    title: '绑定储蓄卡',
    component: () => import('pages/mine/bind_save_page'),
  },
  {
    path: '/mine/credit_extension_page',
    title: '风控授信项',
    component: () => import('pages/mine/credit_extension_page'),
  },
  {
    path: '/mine/select_credit_page',
    title: '选择信用卡',
    component: () => import('pages/mine/select_credit_page'),
  },
  {
    path: '/mine/select_save_page',
    title: '选择储蓄卡',
    component: () => import('pages/mine/select_save_page'),
  },
  {
    path: '/mine/membership_card_page',
    title: '会员卡购买',
    // arrowHide: true,
    component: () => import('pages/mine/membership_card_page'),
  },
  {
    path: '/mine/confirm_purchase_page',
    title: '确认购买',
    component: () => import('pages/mine/confirm_purchase_page'),
  },
  {
    path: '/mine/support_credit_page',
    title: '信用卡支持银行类型',
    component: () => import('pages/mine/support_credit_page'),
  },
  {
    path: '/mine/support_save_page',
    title: '储蓄卡支持银行类型',
    component: () => import('pages/mine/support_save_page'),
  },
  {
    path: '/mine/fqa_page',
    title: '常见问题',
    component: () => import('pages/mine/fqa_page'),
  },
];
