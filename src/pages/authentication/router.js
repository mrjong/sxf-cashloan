export default [
  {
    path: '/authentication/essential_information',
    title: '基本信息认证',
    headerHide: true,
    footerHide: true,
    component: () => import('pages/authentication/essential_information'),
  },
  {
    path: '/authentication/real_name',
    title: '实名认证',
    headerHide: true,
    footerHide: true,
    component: () => import('pages/authentication/real_name'),
  },
];
