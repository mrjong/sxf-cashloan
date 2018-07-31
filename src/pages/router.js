import AuthRoute from 'pages/home/router'; // 首页
import MineRoute from 'pages/mine/router'; // 个人中心
import OrderRoute from 'pages/order/router'; // 账单
import Example from 'example/router'; // 例子
import Common from 'pages/common/router'; // 魔蝎中转页

export default [
  ...AuthRoute,
  ...MineRoute,
  ...OrderRoute,
  ...Example,
  ...Common,
];
