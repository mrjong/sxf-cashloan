/*
 * @Author: shawn
 * @LastEditTime : 2020-02-18 16:56:27
 */
import React, { PureComponent } from 'react';
import qs from 'qs';
import Routers from 'pages/router';
import errPage from 'pages/common/err_page';
import Header from 'components/Header';
import fetch from 'sx-fetch';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import Footer from 'components/Footer';
import { Toast } from 'antd-mobile';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import { changeHistoryState, pagesIgnore } from 'utils';
import { TFDInit } from 'utils/getTongFuDun';
import { pageView, sxfDataPv, sxfDataLogin } from 'utils/analytins';
import { SXFToast } from 'utils/SXFToast';
import { HomeModal } from '../../home/home_page/components';
import { signup_refreshClientUserInfo } from 'fetch/api.js';

const { PROJECT_ENV } = process.env;
@fetch.inject()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		homeData: state.commonState.homeData
	}),
	{
		setUserInfoAction
	}
)
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
		if (PROJECT_ENV === 'dev') {
			this.getTip();
		}
		// 为跳转到协议添加loading
		store.setFromPage('wap');
		if (!store.getHistoryRouter()) {
			store.setHistoryRouter('first-come-in');
		}
		if (!window.ReactRouterHistory) {
			window.ReactRouterHistory = this.props.history;
		}
		console.log('+++++++++++++++++++++++');
		this.acRouter(this.props);
	}

	async componentWillReceiveProps(nextProps) {
		this.acRouter(nextProps);
		store.setHistoryRouter(location.pathname);
	}

	getUserInfo(apptoken) {
		return this.props.$fetch.post(signup_refreshClientUserInfo, null, {
			'FIN-HD-AUTH-TOKEN': apptoken || '121212',
			hideToast: true
		});
	}

	getTip = () => {
		let arr = [];
		for (let index = 0; index < Routers.length; index++) {
			const element = Routers[index];
			if (!element.zhName) {
				console.error(`《${element.title}'》忘记:zhName属性'`);
			} else {
				arr.push(element.zhName);
			}
		}

		function arrayCnt(arr) {
			var newArr = [];
			for (var i = 0; i < arr.length; i++) {
				if (newArr.indexOf(arr[i]) == -1) {
					newArr.push(arr[i]);
				}
			}
			var newarr2 = new Array(newArr.length);
			for (var t = 0; t < newarr2.length; t++) {
				newarr2[t] = 0;
			}
			for (var p = 0; p < newArr.length; p++) {
				for (var j = 0; j < arr.length; j++) {
					if (newArr[p] == arr[j]) {
						newarr2[p]++;
					}
				}
			}
			for (var m = 0; m < newArr.length; m++) {
				if (newarr2[m] > 1) {
					console.error(newArr[m] + '重复的次数为：' + newarr2[m]);
				}
			}
		}
		arrayCnt(arr);
	};
	acRouter = (Props) => {
		this.loadComponent(Props);
	};
	// 神策用户绑定
	queryUsrSCOpenId = () => {
		if (!store.getQueryUsrSCOpenId()) {
			const { userInfo } = this.props;
			window.sa.login(userInfo.scOpenId);
			sxfDataLogin(userInfo.scOpenId);
			store.setQueryUsrSCOpenId(userInfo.scOpenId);
		}
	};
	loadComponent = async (props) => {
		const queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});
		// 如果是从 app 跳过来的
		if (queryData.apptoken) {
			// 第二次循环 就有userinfo 了
			// 这个判断 有必要 因为 从 app 跳 h5，后续的操作 有可能都是在 嵌在 app 中的 h5上进行的，apptoken 会一直都在应该。
			if (!props.userInfo || !props.userInfo.tokenId) {
				const newUserInfo = await this.getUserInfo(queryData.apptoken);
				this.props.setUserInfoAction(newUserInfo.data);
			}
		}

		const token = Cookie.get('FIN-HD-AUTH-TOKEN');
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
			// 看条件自动触发通付盾
			this.queryUsrSCOpenId();
			TFDInit();
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
			sxfDataPv({ pId: (route && route.zhName) || '' });
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
	render() {
		const { component, route, newTitle, showPage = false } = this.state;
		const { headerHide = false, footerHide = true } = route;
		return showPage ? (
			<div className="application_view">
				<div className="application_page">
					{headerHide ? null : <Header {...this.props} headerProps={route} newTitle={newTitle} />}
					{footerHide ? null : <Footer footerProps={route} />}
					<div className="application_content">{component}</div>
					<HomeModal fetch={this.props.$fetch} history={this.props.history} />
				</div>
			</div>
		) : null;
	}
}
