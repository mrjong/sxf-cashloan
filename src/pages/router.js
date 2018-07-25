import AuthRoute from 'pages/home/router'; // 首页
import MineRoute from 'pages/mine/router'; // 首页
import LoginRoute from 'pages/login/router'; // 首页
import Zhangjinpei from 'pages/zhangjinpei/router'; // 首页
import AuthenticationRoute from 'pages/authentication/router'; // 授信项
import MembershipCardRoute from 'pages/membership_card/router'


export default [...AuthRoute, ...LoginRoute,...AuthenticationRoute,...Zhangjinpei, ...MineRoute,...MembershipCardRoute];
