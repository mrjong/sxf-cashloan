import React, { PureComponent } from 'react';
import Routers from 'pages/router';
import qs from 'qs';
import errPage from 'pages/common/err_page';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { Toast } from 'antd-mobile';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import { changeHistoryState, isBugBrowser, pagesIgnore, vconsole } from 'utils';
import TFDInit from 'utils/getTongFuDun';
import { pageView } from 'utils/analytins';
let consoleshowStr = '';
import { SXFToast } from 'utils/SXFLoading';

export default class router_Page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			route: {},
			newTitle: '',
			showPage: false,
			releaseBugs: false
		};
	}
	componentWillReceiveProps(nextProps) {
		this.loadComponent(nextProps);
		store.setHistoryRouter(location.pathname);
	}
	componentWillMount() {
		// 出现打印插件
		vconsole();
        // 为跳转到协议添加loading
        sessionStorage.setItem('fromPage','wap')
		if (!store.getHistoryRouter()) {
			store.setHistoryRouter('first-come-in');
		}
		if (!window.ReactRouterHistory) {
			window.ReactRouterHistory = this.props.history;
		}
		this.loadComponent(this.props);
	}
	componentDidMount() {
		const query = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (query.consoleshow) {
			vconsole('0', query.consoleshow);
		}
	}
	componentWillUnmount() {
		consoleshowStr = '';
	}
	loadComponent = async (props) => {
		const token = Cookie.get('fin-v-card-token');
		let tokenFromStorage = '';
		if (isBugBrowser()) {
			tokenFromStorage = store.getToken();
		} else {
			tokenFromStorage = store.getTokenSession();
		}
		if (!tokenFromStorage && !pagesIgnore(window.location.pathname) && !token) {
			// sessionStorage.clear();
			// localStorage.clear();
			Toast.info('请先登录');
			setTimeout(() => {
				window.ReactRouterHistory.push('/login');
			}, 3000);
			return;
		}
		const { match, history, location } = props;

		try {
			let route;
			if (!pagesIgnore(window.location.pathname)) {
				// 通付盾 获取设备指纹
				TFDInit();
			}
			for (let i = 0; i < Routers.length; i++) {
				if (match.url === Routers[i].path) {
					this.setState({
						newTitle: Routers[i].title
					});
					route = Routers[i];
				}
			}
			if (route) {
				changeHistoryState();
				let component = await route.component();
				this.setState({
					showPage: true,
					route: { ...route },
					component: React.createElement(component.default, {
						match,
						history,
						params: location.state,
						toast: Toast,
						SXFToast,
						setTitle: (title) => {
							this.setState({
								newTitle: title
							});
						}
					})
				});
			} else {
				this.setState({
                    newTitle: '重新加载',
                    showPage:true,
					component: React.createElement(errPage, {
						match,
                        history,
						params: {
							pageType: '404'
						}
					})
				});
			}
			pageView();
		} catch (error) {
			console.log(error);
			this.setState({
                newTitle: '重新加载',
                showPage:true,
				component: React.createElement(errPage, {
					match,
					history,
					params: {
						pageType: '404'
					}
				})
			});
		}
	};
	consoleshow = (e) => {
		if (sessionStorage.getItem('consoleshow')) {
			return;
		}
		const leftInstance = e.screenX;
		const screenWidth = window.innerWidth;
		if (leftInstance < screenWidth / 2) {
			consoleshowStr += '0';
			// console.log('靠左边');
		} else {
			consoleshowStr += '1';
			// console.log('靠右边');
		}
		if (consoleshowStr.indexOf('00001111') > -1) {
			consoleshowStr = '';
		} else {
			vconsole(consoleshowStr);
		}
		// console.log(consoleshowStr);
	};
	render() {
		const { component, route, newTitle, showPage = false } = this.state;
		const { headerHide = false, footerHide = true } = route;
		return showPage ? (
			<div className="application_view" onClick={this.consoleshow}>
				<div className="application_page">
					{headerHide ? null : <Header {...this.props} headerProps={route} newTitle={newTitle} />}
					{footerHide ? null : <Footer footerProps={route} />}
					<div className="application_content">
						{component}</div>
				</div>
			</div>
		) : null;
	}
}
