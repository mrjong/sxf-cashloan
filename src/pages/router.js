import AuthRoute from 'pages/home/router'; // 首页
import LoginRoute from 'pages/login/router'; // 首页
import AuthenticationRoute from 'pages/authentication/router'; // 授信项

export default [...AuthRoute, ...LoginRoute,...AuthenticationRoute];
