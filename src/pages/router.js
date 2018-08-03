import AuthRoute from 'pages/home/router'; // 首页
import MineRoute from 'pages/mine/router'; // 个人中心
import OrderRoute from 'pages/order/router'; // 账单
import Common from 'pages/common/router'; // 魔蝎中转页
import Protocol from 'pages/protocol/router';// 协议
import Login from 'pages/login/router';// 协议
export default [
  ...AuthRoute,
  ...MineRoute,
  ...OrderRoute,
  ...Login,
  ...Common,
  ...Protocol
];
