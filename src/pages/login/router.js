export default [
  {
    path: '/login',
    title: '登录',
    arrowHide: true,
    component: () => import('pages/login/login_page'),
  },
  {
    path: '/outer_login',
    title: '登录',
    arrowHide: true,
    component: () => import('pages/login/outer_login_page'),
  }
];
