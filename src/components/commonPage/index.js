/*
 * @Author: shawn
 * @LastEditTime : 2020-02-13 12:02:17
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-19 11:34:19
 */
import React from 'react';
import Cookie from 'js-cookie';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { connect } from 'react-redux';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { commonClearState, setOverDueModalInfo, setHomeModalAction } from 'reduxes/actions/commonActions';
import { showRedDot, setMsgCount } from 'reduxes/actions/specialActions';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import {
	signup_refreshClientUserInfo,
	coup_queryUsrCoupBySts,
	index_queryOLPShowSts,
	msg_popup_list,
	msg_news_count,
	index_queryPLPShowSts
} from 'fetch/api';
export default () => (WrappedComponent) => {
	@connect(
		(state) => ({
			userInfo: state.staticState.userInfo,
			homeData: state.commonState.homeData
		}),
		{ showRedDot, commonClearState, setUserInfoAction, setOverDueModalInfo, setMsgCount, setHomeModalAction }
	)
	@fetch.inject()
	class commonPageView extends React.Component {
		componentDidMount() {
			const { userInfo = {} } = this.props;
			// console.log('+++++++++++3++++++++++');
			if (userInfo && userInfo.tokenId) {
				const now = Date.now();
				if (this.prePressTime > 0) {
					if (now - this.prePressTime > 1600) {
						this.prePressTime = now;
						this.tabCommonFunc();
					}
				} else {
					this.tabCommonFunc();
				}
			}
		}

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
				location.pathname === '/order/order_page' ||
				location.pathname === '/mine/mine_page'
			) {
				this.props.commonClearState();
				if (userInfo && userInfo.tokenId) {
					this.signup_refreshClientUserInfo();
					this.couponCount();
				}
			}

			if (location.pathname === '/home/home') {
				if (userInfo && userInfo.tokenId) {
					this.getHomeModal();
				}
			}

			if (location.pathname === '/order/order_page') {
				if (userInfo && userInfo.tokenId) {
					this.queryOverdueModalInfo(true);
				}
			}

			// 消息条数调用的地方
			if (
				location.pathname === '/home/home' ||
				location.pathname === '/mine/mine_page' ||
				location.pathname === '/home/message_page'
			) {
				if (userInfo && userInfo.tokenId) {
					this.requestMsgCount();
				}
			}
		};
		/**
		 * @description: 未读消息总数查询
		 */
		requestMsgCount() {
			this.props.$fetch
				.get(msg_news_count, null, { hideToast: true })
				.then((result) => {
					if (result && result.code === '000000' && result.data) {
						this.props.setMsgCount(result.data.count || 0);
					}
				})
				.catch(() => {});
		}

		/**
		 * @description: 刷新用户登录信息
		 * @param {type}
		 * @return:
		 */
		signup_refreshClientUserInfo = () => {
			this.props.$fetch.post(signup_refreshClientUserInfo, null, { hideToast: true }).then((res) => {
				if (res && res.code === '000000' && res.data) {
					this.props.setUserInfoAction(res.data);
					Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
					// TODO: 根据设备类型存储token
					store.setToken(res.data.tokenId);
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
						}
					} else {
						this.props.showRedDot(0);
					}
				})
				.catch(() => {
					this.props.showRedDot(0);
				});
		};
		/**
		 * @description: 合并弹窗
		 * @param {type}
		 * @return:
		 */
		getHomeModal = () => {
			Promise.all([this.index_queryPLPShowSts(), this.queryOverdueModalInfo(), this.msg_popup_list()]).then(
				([a, b, c]) => {
					this.props.setHomeModalAction({
						DataList: [...a, ...b, ...c]
						// routeName
					});
				}
			);
		};

		/**
		 * @description: 弹窗列表
		 * @param {type}
		 * @return:
		 */
		index_queryPLPShowSts = () =>
			new Promise((resolve) => {
				this.props.$fetch
					.get(index_queryPLPShowSts)
					.then((result) => {
						if (result && result.code === '000000' && result.data.plpSts === '1') {
							resolve([result.data]);
						} else {
							resolve([]);
						}
					})
					.catch(() => {
						resolve([]);
					});
			});
		/**
		 * @description: 查询逾期弹窗相关信息
		 */
		queryOverdueModalInfo = (flag) => {
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
								if (flag) {
									this.props.setHomeModalAction({
										DataList: [
											{
												olpSts,
												decreaseCoupExpiryDate,
												progressInfos
											}
										]
									});
								}
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
		render() {
			return <WrappedComponent {...this.props} />;
		}
	}
	hoistNonReactStatic(commonPageView, WrappedComponent);
	return commonPageView;
};
