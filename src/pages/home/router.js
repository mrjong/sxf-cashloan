export default [
  {
    path: '/home/home',
    title: '还到',
    footerHide: false,
    arrowHide: 'empty',
    component: () => import('pages/home/home_page'),
  },
  {
    path: '/home/message_page',
    title: '消息中心',
    component: () => import('pages/home/message_page'),
  },
  {
    path: '/home/message_detail_page',
    title: '查看详情',
    component: () => import('pages/home/message_detail_page'),
  },
  {
    path: '/home/agency',
    title: '代还确认',
    component: () => import('pages/home/agency_page'),
  },
  {
    path: '/home/essential_information',
    title: '基本信息认证',
    component: () => import('pages/home/essential_information_page'),
  },
  {
    path: '/home/real_name',
    title: '实名认证',
    component: () => import('pages/home/real_name_page'),
  },
  {
    path: '/home/confirm_agency',
    title: '确认代还信息',
    component: () => import('pages/home/confirm_agency_page'),
  },
  {
    path: '/home/moxie_bank_list_page',
    title: '银行卡选择',
    component: () => import('pages/home/moxie_bank_list_page'),
  }
];
