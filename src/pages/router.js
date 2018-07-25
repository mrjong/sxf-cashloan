import AuthRoute from 'pages/home/router'; // 首页
import MineRoute from 'pages/mine/router'; // 首页
import LoginRoute from 'pages/login/router'; // 首页
import Example from 'example/router'; // 例子

export default [...AuthRoute, ...LoginRoute, ...MineRoute, ...Example];
