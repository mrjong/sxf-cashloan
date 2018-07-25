export default [
  {
    path: '/example/home',
    title: '例子',
    headerHide: true,
    footerHide: false,
    component: () => import('example/index'),
  },
  {
    path: '/example/button/',
    title: '按钮组件',
    headerHide: true,
    footerHide: false,
    component: () => import('example/button/index'),
  },
  {
    path: '/example/panel/',
    title: '面板组件',
    headerHide: true,
    footerHide: false,
    component: () => import('example/panel'),
  },
];
