import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import ErrPage from 'pages/common/err_page';
import SXFLoading from 'components/SXFLoading';

const Loading = ({ error, pastDelay }) => {
	if (pastDelay) {
		return <div>{React.createElement(SXFLoading)}</div>;
	} else if (error) {
		return <div><ErrPage></ErrPage></div>;
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
const RouterPage = Loadable({
	loader: () => import('pages/common/routerPage'),
	loading: Loading,
	LoadingComponent,
	delay: 300
});
export default class Routers extends Component {
	render() {
		return (
			<Switch>
                <Route exact path="/" component={LoginPage} />
				<Route  path="/login" component={LoginPage} />
				<Route path="/:modules/:page" component={RouterPage} />
			</Switch>
		);
	}
}
