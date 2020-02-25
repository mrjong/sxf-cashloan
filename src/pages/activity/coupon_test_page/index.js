/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-02-25 11:34:45
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import activity_bg from './img/activityBg.png';
import submit_btn1 from './img/btn_bg.png';
import submit_btn2 from './img/btn_bg2.png';
import wallet_img1 from './img/wallet_img1.png';
// import wallet_img2 from './img/wallet_img2.png';
import wallet_img3 from './img/wallet_img3.png';
import shadow_img from './img/shadow_img.png';
import rules_bg from './img/rules_bg.png';
import coin_img from './img/coin_ico.png';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import AwardShow from './components/AwardShow';
import CountDown from '../../mine/coupon_page/component/CountDown';
// import HomeBtnClass from 'utils/HomeBtn';
import { getTimeStr } from 'utils/CommonUtil/commonFunc';

const API = {
	couponJudge: '/couponTest/judge' // 判断用户是否满足领取条件接口
};

@setBackGround('#EEDFCA')
@fetch.inject()
export default class coupon_test_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			userStsCode: null, // 用户状态code
			validEndTm: '', // 优惠劵有效期
			couponNm: '', // 优惠劵名称
			isAppOpen: false, // 是否是app webview打开
			registerChannel: '', // 注册渠道
			isPlus: false
		};
		// this['HomeBtn'] = new HomeBtnClass(this);
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.fromApp) {
			this.setState(
				{
					isPlus: queryData.isPlus,
					isAppOpen: true
				},
				() => {
					this.checkUserStatus();
				}
			);
		} else if (Cookie.get('FIN-HD-AUTH-TOKEN')) {
			this.checkUserStatus();
		}
		if (queryData.regChannel) {
			this.setState({
				registerChannel: queryData.regChannel
			});
		}
		// this['HomeBtn'].fetchData();
	}

	componentDidMount() {
		const { isAppOpen, registerChannel } = this.state;
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.comeFrom) {
			buriedPointEvent(activity.couponTestActivityEntry, {
				entry: queryData.comeFrom,
				regChannel: registerChannel
			});
		}
		if (isAppOpen) {
			if (queryData.activityToken) {
				Cookie.set('FIN-HD-AUTH-TOKEN', queryData.activityToken, { expires: 365 });
			} else {
				Cookie.remove('FIN-HD-AUTH-TOKEN');
			}
		}
	}

	prePressTime2 = 0;
	// 点击领取按钮
	goTo = () => {
		const nowTime = Date.now();
		if (nowTime - this.prePressTime2 > 1600 || !this.prePressTime2) {
			this.prePressTime2 = nowTime;
			const { userStsCode, isAppOpen, registerChannel, isPlus } = this.state;

			if (Cookie.get('FIN-HD-AUTH-TOKEN')) {
				if (userStsCode === '01') {
					// 未发放优惠券 返回首页
					const activityInf = {
						isWelfare: true,
						isLogin: true
					};
					if (isAppOpen) {
						setTimeout(() => {
							if (isPlus) {
								window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
							} else {
								window.postMessage(JSON.stringify(activityInf), () => {});
							}
						}, 0);
					} else {
						// mpos或者h5中跳转首页
						this.props.history.push('/home/home');
					}
				} else if (userStsCode == '00') {
					buriedPointEvent(activity.couponTestActivityUseNow, {
						receiveSts: this.transferCode().buryMsg,
						regChannel: registerChannel
					});
					// 已领取，去使用 通知app做相关操作
					const activityInf = {
						isWelfare: true,
						operation: 'useCoupon'
					};
					if (isAppOpen) {
						setTimeout(() => {
							if (isPlus) {
								window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
							} else {
								window.postMessage(JSON.stringify(activityInf), () => {});
							}
						}, 0);
					} else {
						// mpos或者h5中跳转对应节点
						// this.props.history.push({
						// 	pathname: '/order/order_detail_page',
						// 	search: '?entryFrom=home'
						// });
						// this['HomeBtn'].getData();
					}
				} else {
					buriedPointEvent(activity.couponTestActivityUseNow, {
						receiveSts: this.transferCode().buryMsg,
						regChannel: registerChannel
					});
					this.props.toast.info(this.transferCode().showMsg);
				}
			} else {
				this.props.toast.info('请登录还到app进行操作');
			}
		}
	};

	// 转义后台返回的code
	transferCode = () => {
		const { userStsCode } = this.state;
		let showMsg = '';
		let buryMsg = '';
		switch (userStsCode) {
			case '00':
				showMsg = '已领取，去使用';
				buryMsg = '已领取，去使用';
				break;
			case '01':
				showMsg = '未发放优惠券';
				buryMsg = '未发放优惠券';
				break;
			case '02':
				showMsg = '已领取优惠券失效，请耐心等待下次机会';
				buryMsg = '已失效';
				break;
			case '03':
				showMsg = '优惠券已使用，请耐心等待下次机会';
				buryMsg = '已使用';
				break;
			default:
				break;
		}
		return {
			showMsg,
			buryMsg
		};
	};

	// 查询用户领取的状态
	checkUserStatus = () => {
		this.props.$fetch.post(API.couponJudge).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data) {
				this.setState({
					userStsCode: res.data.status,
					validEndTm: res.data.validTm,
					couponNm: res.data.name
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	render() {
		const { userStsCode, validEndTm, couponNm } = this.state;
		const submitBtnBg = userStsCode === '01' ? submit_btn2 : submit_btn1;
		return (
			<div className={styles.coupon_test_page}>
				<div className={styles.topContent}>
					<img src={activity_bg} className={styles.activityBg} />
					<div className={styles.shadowContent} />
				</div>
				<div className={styles.mainContent}>
					{/* 奖品列表 */}
					<div className={styles.awardListCont}>
						<AwardShow className={styles.awardList} />
					</div>
					<div className={styles.mainBox}>
						<div className={styles.wallet}>
							<img src={wallet_img1} className={styles.img1} />
							{userStsCode === '01' ? (
								<div className={[styles.couponBox, styles.slideImg].join(' ')}>
									<p className={styles.titText}>非常遗憾</p>
									<p className={styles.failText}>
										您未获取本次优惠名额，
										<br />
										按时履约还款即有机会获取优惠
									</p>
								</div>
							) : (
								<div className={[styles.couponBox, styles.slideImg].join(' ')}>
									<p className={styles.titText}>领取成功</p>
									<p className={styles.couponNm}>
										<span>{couponNm[0]}</span>
										{couponNm.slice(1)}
									</p>
									<div className={styles.tagBox}>还款用户专享</div>
									{/* 只有已领取未使用的状态下才展示有效期 */}
									{userStsCode === '00' ? (
										<div className={styles.validDate}>
											有效期还剩：
											{validEndTm && (
												<CountDown
													endTime={getTimeStr(validEndTm)}
													timeOver={() => {
														let now = +new Date();
														let thisTime = +new Date(getTimeStr(validEndTm));
														if (now > thisTime) {
															return;
														}
														this.checkUserStatus();
													}}
													type="day"
													className={styles.validDateTxt}
												/>
											)}
										</div>
									) : null}
								</div>
							)}
							<img src={wallet_img3} className={styles.img3} />
						</div>
						{/* 特殊阴影 */}
						<img src={shadow_img} className={styles.shadowImg} />
						{/* 金币 */}
						<img src={coin_img} className={styles.coinImg} />
					</div>
					{/* 按钮 */}
					<div onClick={this.goTo}>
						<img src={submitBtnBg} className={styles.submitBtn} />
					</div>
					{/* 活动规则 */}
					<div className={styles.rulesCont}>
						<img src={rules_bg} className={styles.rulesBg} />
						<div className={styles.rulesContent}>
							活动期间，还到老用户最高可获得服务费6折优惠券，有效期为3天，提前还款即享更多福利
						</div>
					</div>
				</div>
			</div>
		);
	}
}
