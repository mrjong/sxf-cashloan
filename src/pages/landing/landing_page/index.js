/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-06 14:35:27
 */
import React, { PureComponent } from 'react';
import qs from 'qs';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
// import { buriedPointEvent } from 'utils/analytins';
// import { home } from 'utils/analytinsType';
import styles from './index.scss';
import { getH5Channel } from 'utils/common';
import Cookie from 'js-cookie';

const API = {
	LANDING_IMG_URL: '/my/getLandingPage', // 获取落地页配置数据
	userCount: '/activeConfig/count', // 用户抽奖次数查询
	userDraw: '/activeConfig/draw' // 用户抽奖
};

@fetch.inject()
export default class landing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isAppOpen: false, // 是否是app webview打开
			configData: null
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.fromApp) {
			this.setState({
				isAppOpen: true
			});
		}
		this.getLandingImgByUrl();
	}

	componentDidMount() {
		const { isAppOpen } = this.state;
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (isAppOpen) {
			if (queryData.activityToken) {
				Cookie.set('fin-v-card-token', queryData.activityToken, { expires: 365 });
			} else {
				Cookie.remove('fin-v-card-token');
			}
		}
	}

	// 根据 url 上的参数，获取图片
	getLandingImgByUrl() {
		const searchParams = qs.parse(decodeURI(window.location.search), { ignoreQueryPrefix: true });
		const landingId = searchParams.landingId || '';
		this.props.$fetch.get(`${API.LANDING_IMG_URL}/${landingId}`).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data !== null) {
				res.data.landingTitle && this.props.setTitle(res.data.landingTitle);
				res.data.configs &&
					res.data.configs.length &&
					this.setState({
						configData: res.data.configs
					});
				// if (!res.data.landingImage) {
				// 	this.props.toast.info('活动已过期!');
				// 	setTimeout(() => {
				// 		this.props.history.push('/home/home');
				// 	}, 3000);
				// 	return;
				// }
				// this.props.setTitle(res.data.landingNm);
				// buriedPointEvent(home.landingPage, {
				// 	landingPoint: res.data.landingPoint
				// });
				// store.setLandingPageImgUrl(`data:image/png;base64,${res.data.landingImage}`);
				// this.setState({
				// 	imgUrl: res.data.landingImage
				// });
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	}

	// 点击图片
	clickHandler = (item) => {
		//  /** 图片地址 */
		//  private String imageUrl;
		//  /** 图片名称 */
		//  private String imageName;
		//  /** 交互类型\n0:无\n1:页面跳转\n2:参与活动 */
		//  private String responseType;
		//  /** 活动BIZ_ID */
		//  private String activeBizId;
		//  /** 活动领取提示 */
		//  private String activeResult;
		//  /** 活动失效提示 */
		//  private String activeError;
		//  /** 活动跳转\n0:不跳转\n1:跳转 */
		//  private String activeSuccess;
		//  /** 跳转类型\n0:落地页\n1:APP页面 */
		//  private String skipType;
		//  /** 跳转地址 */
		//  private String skipUrl;
		switch (item.responseType) {
			case '0':
				break;
			case '1':
				if (item.skipType === '0') {
					window.location.href = item.skipUrl;
				} else if (item.skipType === '1') {
					// APP页面 中 0 代表跳转首页 1代码跳转优惠券列表页面
					if (item.skipUrl === '0') {
						this.judgeLogin(() => {
							setTimeout(() => {
								window.postMessage(
									JSON.stringify({
										isWelfare: true,
										isLogin: true
									}),
									() => {}
								);
							}, 0);
						});
					} else if (item.skipUrl === '1') {
						this.judgeLogin(() => {
							setTimeout(() => {
								window.postMessage(
									JSON.stringify({
										isWelfare: true,
										operation: 'checkCoupon'
									}),
									() => {}
								);
							}, 0);
						});
					}
				}
				break;
			case '2':
				// 参与活动
				this.judgeLogin(() => {
					this.getCount(item);
				});
				break;
			default:
				break;
		}
	};

	// 判断用户是否登录
	judgeLogin = (callback) => {
		const { isAppOpen } = this.state;
		// const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		// if (isMPOS() && queryData.entry && queryData.entry.indexOf('ismpos_') > -1) {
		// 	if (queryData.appId && queryData.token) {
		// 	  this.getStatus();
		// 	} else {
		// 	  this.setState({
		// 	    showLoginTip: true
		// 	  });
		// 	}
		// } else
		if (Cookie.get('fin-v-card-token')) {
			store.setToken(Cookie.get('fin-v-card-token'));
			callback && callback();
		} else {
			if (isAppOpen) {
				const activityInf = {
					isWelfare: true,
					isLogin: false
				};
				setTimeout(() => {
					window.postMessage(JSON.stringify(activityInf), () => {});
				}, 0);
			} else {
				// h5 未登录情况下
				this.props.toast.info('请登录还到app进行操作');
				// this.setState({
				// 	isShowLogin: true
				// });
			}
		}
	};

	// 大转盘活动-用户抽奖剩余次数查询
	getCount = (item) => {
		this.props.$fetch
			.post(API.userCount, { activeId: item.activeBizId }, { noLginRouter: true })
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					if (res.data.data.count && Number(res.data.data.count) > 0) {
						this.getDraw(item);
					} else {
						this.props.toast.info('您的抽奖次数已用尽');
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
	};

	// 用户抽奖
	getDraw = (item) => {
		const params = {
			activeId: item.activeBizId,
			channel: getH5Channel() // 用户渠道
		};
		this.props.$fetch.post(API.userDraw, params).then((res) => {
			if (res.msgCode === 'PTM0000') {
				const successTip = item.activeResult ? item.activeResult : '领取成功';
				const failTip = item.activeError ? item.activeError : '领取失败';
				// type 00 优惠券  01 积分  02 红包 03 实物   04 谢谢惠顾
				if (res.data && res.data.type === '04') {
					this.props.toast.info(failTip);
				} else {
					this.props.toast.info(successTip, 3, () => {
						// 成功后跳转
						if (item.activeSuccess === '1') {
							if (item.skipType === '0') {
								window.location.href = item.skipUrl;
							} else if (item.skipType === '1') {
								// APP页面 中 0 代表跳转首页 1代码跳转优惠券列表页面
								if (item.skipUrl === '0') {
									setTimeout(() => {
										window.postMessage(
											JSON.stringify({
												isWelfare: true,
												isLogin: true
											}),
											() => {}
										);
									}, 0);
								} else if (item.skipUrl === '1') {
									setTimeout(() => {
										window.postMessage(
											JSON.stringify({
												isWelfare: true,
												operation: 'checkCoupon'
											}),
											() => {}
										);
									}, 0);
								}
							}
						}
					});
				}
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	render() {
		const { configData } = this.state;
		// let frameUrl = '';
		// if (PROJECT_ENV === 'pro') {
		// 	frameUrl = 'https://lns-wap.vbillbank.com/disting/#/landing_page';
		// } else if (PROJECT_ENV === 'dev') {
		// 	frameUrl = 'https://lns-wap-test.vbillbank.com/disting/#/landing_page';
		// } else if (PROJECT_ENV === 'test') {
		// 	frameUrl = 'https://lns-wap-test.vbillbank.com/disting/#/landing_page';
		// }
		return configData
			? configData.map((item, index) => {
					return (
						<div
							onClick={() => {
								this.clickHandler(item);
							}}
							key={index}
						>
							{item.imageUrl && <img className={styles.configImg} src={item.imageUrl} />}
						</div>
					);
			  })
			: null;
	}
}
