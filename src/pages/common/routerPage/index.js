/*
 * @Author: shawn
 * @LastEditTime: 2019-08-30 14:16:17
 */
import React, { PureComponent } from 'react';
import Routers from 'pages/router';
import errPage from 'pages/common/err_page';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { Toast } from 'antd-mobile';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import { changeHistoryState, pagesIgnore } from 'utils';
import TFDInit from 'utils/getTongFuDun';
import { pageView } from 'utils/analytins';
import { SXFToast } from 'utils/SXFToast';
import { Provider } from './context';

let consoleshowStr = '';

export default class router_Page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			route: {},
			newTitle: '',
			showPage: false,
			releaseBugs: false,
			footerTipIcon: ''
		};
	}
	componentWillMount() {
		// 为跳转到协议添加loading
		store.setFromPage('wap');
		if (!store.getHistoryRouter()) {
			store.setHistoryRouter('first-come-in');
		}
		if (!window.ReactRouterHistory) {
			window.ReactRouterHistory = this.props.history;
		}
		this.loadComponent(this.props);
	}
	componentWillReceiveProps(nextProps) {
		this.loadComponent(nextProps);
		store.setHistoryRouter(location.pathname);
	}
	componentWillUnmount() {
		consoleshowStr = '';
	}
	loadComponent = async (props) => {
		const token = Cookie.get('fin-v-card-token');
		let tokenFromStorage = '';
		tokenFromStorage = store.getToken();
		if (!tokenFromStorage && !pagesIgnore(window.location.pathname) && !token) {
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
				changeHistoryState('22222222222');
				let component = await route.component();
				this.setState({
					showPage: true,
					route: { ...route },
					component: React.createElement(component.default, {
						globalTask: this.globalTask,
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
					showPage: true,
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
				showPage: true,
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
	globalTask = (obj) => {
		console.log(obj);
		this.setState({
			footerTipIcon: obj
		});
	};
	render() {
		const { component, route, newTitle, showPage = false } = this.state;
		const { headerHide = false, footerHide = true } = route;
		return showPage ? (
			<div className="application_view">
				<div className="application_page">
					<Provider value={{ footerTipIcon: this.state.footerTipIcon }}>
						{headerHide ? null : <Header {...this.props} headerProps={route} newTitle={newTitle} />}
						{footerHide ? null : <Footer footerProps={route} />}
						<div className="application_content">{component}</div>
					</Provider>
				</div>
			</div>
		) : null;
	}
}
