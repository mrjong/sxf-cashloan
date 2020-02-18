/*
 * @Author: shawn
 * @LastEditTime : 2020-02-18 16:10:52
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
		console.log(this.props, nextProps, '000000');
		this.acRouter(nextProps);
		store.setHistoryRouter(location.pathname);

		const queryData = qs.parse(this.props.history.location.search, {
			ignoreQueryPrefix: true
		});

		if (queryData.tokenId) {
			if (this.props.userInfo && this.props.userInfo.tokenId) {
				// if (queryData.tokenId !== this.props.userInfo.tokenId) {
				// 	const newUserInfo = await this.getUserInfo(true);
				// 	console.log('00');
				// 	this.props.setUserInfoAction(newUserInfo);
				// }

				const isUserInfoEqual = this.compare(this.props.userInfo, nextProps.userInfo);
				console.log(isUserInfoEqual, 'isUserInfoEqual');

				if (!isUserInfoEqual) {
					const newUserInfo = await this.getUserInfo(true);
					console.log('11');
					this.props.setUserInfoAction(newUserInfo);
				}
			} else {
				const newUserInfo = await this.getUserInfo(true);
				console.log('22');
				this.props.setUserInfoAction(newUserInfo);
			}
		}
	}

	getUserInfo(flag) {
		return new Promise((resolve, reject) => {
			if (flag) {
				setTimeout(() => {
					console.log('flag true');
					resolve({
						faceFlag: '1',
						idCheckFlag: '2',
						idNoHid: '411522********3630',
						nameHid: '**佩',
						qyGroupId: '397748875',
						qyOpenId: '79f44d9f982f418093721351d7aee23d',
						qyRobotId: '3411295',
						qyTemplateId: '10317938',
						regChannel: 'OTHER',
						scOpenId: 'ee10d77d5ec248b3bf34ba4606d74872',
						telNoHid: '182****04621111',
						tokenId: '9d672c458de8f665de0242ce06747d85'
					});
				}, 1000);
			} else {
				setTimeout(() => {
					console.log('flag false');
					reject();
				}, 1000);
			}
		});
	}

	compare(origin, target) {
		if (typeof target !== 'object') {
			//target不是对象/数组
			return origin === target; //直接返回全等的比较结果
		}

		if (typeof origin !== 'object') {
			//origin不是对象/数组
			return false; //直接返回false
		}
		for (let key of Object.keys(target)) {
			//遍历target的所有自身属性的key
			if (!this.compare(origin[key], target[key])) {
				//递归比较key对应的value，
				//value不等，则两对象不等，结束循环，退出函数，返回false
				return false;
			}
		}
		//遍历结束，所有value都深度比较相等，则两对象相等
		return true;
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
