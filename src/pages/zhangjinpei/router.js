export default [
  {
    path: '/zhang',
    title: '组件测试',
    headerHide: true,
    footerHide: false,
    component: () => import('pages/zhangjinpei'),
  },
  {
    path: '/zhangsan',
    title: '有底部',
    headerHide: true,
    footerHide: false,
    component: () => import('pages/zhangjinpei'),
  },
  {
    path: '/lisi',
    title: '没有底部',
    headerHide: true,
    footerHide: true,
    component: () => import('pages/zhangjinpei'),
  },
];
