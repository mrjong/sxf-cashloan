/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-10-15 15:28:28
 */
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import ErrPage from 'pages/common/err_page';
import SXFLoading from 'components/SXFLoading';

const Loading = ({ error, pastDelay }) => {
	if (pastDelay) {
		return <div>{React.createElement(SXFLoading)}</div>;
	} else if (error) {
		return (
			<div>
				<ErrPage />
			</div>
		);
	}
	return null;
};
function LoadingComponent() {
	return <div>{React.createElement(SXFLoading)}</div>;
}
const LoginPage = Loadable({
	loader: () => import('pages/login/login_page'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
const OuterLoginPage = Loadable({
	loader: () => import('pages/login/outer_login_page'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
const OuterMposLoginPage = Loadable({
	loader: () => import('pages/login/outer_mpos_login_page'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
const RouterPage = Loadable({
	loader: () => import('pages/common/routerPage'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
const OuterTestLoginPage = Loadable({
	loader: () => import('pages/login/outer_test_login_page'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
const MomoOuterLoginPage = Loadable({
	loader: () => import('pages/login/momo_outer_login_page'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
const MposPushLogin = Loadable({
	loader: () => import('pages/login/mpos_push_login'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
export default class Routers extends Component {
	render() {
		return (
			<Switch>
				<Route exact path="/" component={LoginPage} />
				<Route path="/login" component={LoginPage} />
				<Route path="/outer_login" component={OuterLoginPage} />
				<Route path="/outer_mpos_login" component={OuterMposLoginPage} />
				<Route path="/:modules/:page" component={RouterPage} />
				<Route path="/outer_test_login" component={OuterTestLoginPage} />
				<Route path="/momo_outer_login" component={MomoOuterLoginPage} />
				<Route path="/mpos_push_login" component={MposPushLogin} />
			</Switch>
		);
	}
}
