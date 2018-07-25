import AuthRoute from 'pages/home/router'; // 首页
import MineRoute from 'pages/mine/router'; // 个人中心
import OrderRoute from 'pages/order/router'; // 账单
import LoginRoute from 'pages/login/router'; // 首页
import Example from 'example/router'; // 例子

import AuthenticationRoute from 'pages/authentication/router'; // 授信项
import MembershipCardRoute from 'pages/membership_card/router'


export default [...AuthRoute, ...LoginRoute,...AuthenticationRoute,...MineRoute,...MembershipCardRoute, ...OrderRoute, ...Example];
