/*
 * @Author: shawn
 * @LastEditTime : 2020-02-06 10:15:45
 */
import React, { PureComponent } from 'react';
import Routers from 'pages/router';
import errPage from 'pages/common/err_page';
import Header from 'components/Header';
import fetch from 'sx-fetch';
import { connect } from 'react-redux';
import Footer from 'components/Footer';
import { Toast } from 'antd-mobile';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import {
	signup_refreshClientUserInfo,
	coup_queryUsrCoupBySts,
	msg_popup_list,
	index_queryOLPShowSts
} from 'fetch/api';
import { commonClearState, setOverDueModalInfo, setHomeModalAction } from 'reduxes/actions/commonActions';
import { showRedDot, setMsgCount } from 'reduxes/actions/specialActions';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { changeHistoryState, pagesIgnore, queryUsrSCOpenId } from 'utils';
import { TFDInit } from 'utils/getTongFuDun';
import { pageView, sxfDataPv } from 'utils/analytins';
import { SXFToast } from 'utils/SXFToast';
import { Provider } from './context';
const { PROJECT_ENV } = process.env;
@fetch.inject()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		homeData: state.commonState.homeData
	}),
	{ showRedDot, commonClearState, setUserInfoAction, setOverDueModalInfo, setMsgCount, setHomeModalAction }
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
	componentWillReceiveProps(nextProps) {
		this.acRouter(nextProps);
		store.setHistoryRouter(location.pathname);
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
		// if (location.pathname === '/home/home') {
		// 	activeConfigSts({
		// 		$props: this.props,
		// 		type: 'A',
		// 		callback: () => {
		// 			this.loadComponent(Props);
		// 		}
		// 	});
		// 	return;
		// }
		this.loadComponent(Props);
	};
	loadComponent = async (props) => {
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
		// this.tabCommonFunc();
		const { match, history, location } = props;
		try {
			let route;
			// 看条件自动触发通付盾
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
	globalTask = (obj) => {
		this.setState({
			footerTipIcon: obj
		});
	};
	/**
	 * @description: 刷新用户登录信息
	 * @param {type}
	 * @return:
	 */
	signup_refreshClientUserInfo = () => {
		this.props.$fetch.post(signup_refreshClientUserInfo, null, { hideToast: true }).then((res) => {
			if (res && res.code === '000000' && res.data) {
				this.props.setUserInfoAction(res.data);
			}
		});
	};
	/**
	 * @description: 获取可用优惠券个数
	 * @param {type}
	 * @return:
	 */
	couponCount = () => {
		this.props.$fetch
			.post(
				coup_queryUsrCoupBySts,
				{
					coupSts: '00'
				},
				{ hideToast: true }
			)
			.then((res) => {
				if (res && res.data) {
					if (res.data && res.data.totalRow > 0) {
						this.props.showRedDot(res.data.totalRow);
						// TODONEW
						// this.props.navigation.setParams({
						// 	msgDot: true
						// });
					}
				} else {
					this.props.showRedDot(0);
					// this.props.navigation.setParams({
					// 	msgDot: false
					// });
				}
			})
			.catch(() => {
				this.props.showRedDot(0);
				// this.props.navigation.setParams({
				// 	msgDot: false
				// });
			});
	};

	/**
	 * @description: 合并弹窗
	 * @param {type}
	 * @return:
	 */
	getHomeModal = () => {
		Promise.all([this.queryOverdueModalInfo(), this.msg_popup_list()]).then(([a, b]) => {
			this.props.setHomeModalAction({
				DataList: [...a, ...b]
			});
		});
	};
	/**
	 * @description: 查询逾期弹窗相关信息
	 */
	queryOverdueModalInfo = () => {
		const { homeData = {} } = this.props;
		return new Promise((resolve) => {
			if (
				!homeData ||
				!homeData.indexSts ||
				(homeData && (homeData.indexSts === 'LN0009' || homeData.indexSts === 'CN0005'))
			) {
				this.props.$fetch
					.get(index_queryOLPShowSts)
					.then((result) => {
						if (result && result.code === '000000' && result.data && result.data.olpSts === '1') {
							const { olpSts, decreaseCoupExpiryDate = '', progressInfos = [] } = result.data;
							resolve([
								{
									olpSts,
									decreaseCoupExpiryDate,
									progressInfos
								}
							]);
							this.props.setOverDueModalInfo({
								olpSts,
								decreaseCoupExpiryDate,
								progressInfos
							});
						} else {
							resolve([]);
						}
					})
					.catch(() => {
						resolve([]);
					});
			} else {
				resolve([]);
			}
		});
	};

	/**
	 * @description: 弹窗列表
	 * @param {type}
	 * @return:
	 */
	//
	msg_popup_list = () =>
		new Promise((resolve) => {
			this.props.$fetch
				.get(msg_popup_list + '/0')
				.then((result) => {
					if (result && result.code === '000000' && result.data.popups && result.data.popups.length > 0) {
						resolve(result.data.popups);
					} else {
						resolve([]);
					}
				})
				.catch(() => {
					resolve([]);
				});
		});

	// 处理一下tab公用方法
	/**
	 * @description:
	 * @param {type}
	 * @return:
	 */
	tabCommonFunc = () => {
		const { userInfo = {} } = this.props;
		if (
			location.pathname === '/home/home' ||
			location.pathname === '/mine/mine_page' ||
			location.pathname === '/order/order_page'
		) {
			// this.props.commonClearState();
			if (userInfo && userInfo.tokenId) {
				// 埋点绑定
				queryUsrSCOpenId({ $props: this.props });
				this.signup_refreshClientUserInfo();
				this.couponCount();
			}
		}

		if (location.pathname === '/home/home' || location.pathname === '/order/order_page') {
			if (userInfo && userInfo.tokenId) {
				this.getHomeModal();
			}
		}

		// 消息条数调用的地方
		if (
			location.pathname === 'Home' ||
			location.pathname === 'Mine' ||
			location.pathname === 'MessageCenter'
		) {
			if (userInfo && userInfo.tokenId) {
				this.requestMsgCount();
			}
		}
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
