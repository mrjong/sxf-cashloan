/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-10-22 17:16:18
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import activity_bg from './img/activityBg.png';
import submit_btn1 from './img/btn_bg.png';
import submit_btn2 from './img/btn_bg2.png';
import wallet_img1 from './img/wallet_img1.png';
import wallet_img2 from './img/wallet_img2.png';
import wallet_img3 from './img/wallet_img3.png';
import shadow_img from './img/shadow_img.png';
import rules_bg from './img/rules_bg.png';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
// import { setBackGround } from 'utils/background';
import AwardShow from './components/AwardShow';
import CountDown from '../../mine/coupon_page/component/CountDown';

const API = {
	noviceJudge: '/novice/judge', // 判断用户是否满足领取条件接口
	noviceReceive: '/novice/receive' // 领取新手优惠券接口
};

// @setBackGround('#F64C46')
@fetch.inject()
export default class new_users_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			userStsCode: null, // 用户状态code
			validEndTm: '20191022180346', // 优惠劵有效期
			isOpen: false,
			isAppOpen: false // 是否是app webview打开
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.fromApp) {
			this.setState(
				{
					isAppOpen: true
				},
				() => {
					this.checkUserStatus();
				}
			);
		}
	}

	componentDidMount() {
		const { isAppOpen } = this.state;
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.comeFrom) {
			buriedPointEvent(activity.newUserActivityEntry, {
				entry: queryData.comeFrom
			});
		}
		if (isAppOpen) {
			if (queryData.activityToken) {
				Cookie.set('fin-v-card-token', queryData.activityToken, { expires: 365 });
			} else {
				Cookie.remove('fin-v-card-token');
			}
		}
	}

	prePressTime2 = 0;
	// 点击领取按钮
	goTo = () => {
		const nowTime = Date.now();
		if (nowTime - this.prePressTime2 > 1600 || !this.prePressTime2) {
			this.prePressTime2 = nowTime;
			const { userStsCode, isAppOpen } = this.state;

			if (isAppOpen && Cookie.get('fin-v-card-token')) {
				if (userStsCode) {
					this.setState({
						isOpen: true
					});
					buriedPointEvent(activity.newUserActivityGetNow, {
						receiveSts: this.transferCode().buryMsg
					});
					this.getCoupon();
				} else if (userStsCode) {
					buriedPointEvent(activity.newUserActivityUseNow);
					// 已领取，去使用 通知app做相关操作
					const activityInf = {
						isWelfare: true,
						operation: 'useCoupon'
					};
					setTimeout(() => {
						window.postMessage(JSON.stringify(activityInf), () => {});
					}, 0);
				} else {
					buriedPointEvent(activity.newUserActivityGetNow, {
						receiveSts: this.transferCode().buryMsg
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
				showMsg = '可以领取';
				buryMsg = '可以领取';
				break;
			case '01':
				showMsg = '此次活动随行付plus用户注册还到专享';
				buryMsg = '非mpos用户';
				break;
			case '02':
				showMsg = '已超过参与时间';
				buryMsg = '已超过参与时间';
				break;
			case '03':
				showMsg = '已领取，去使用';
				buryMsg = '已领取，去使用';
				break;
			case '04':
				showMsg = '活动期间只能获取一次';
				buryMsg = '已失效';
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
		this.props.$fetch.post(API.noviceJudge).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data) {
				if (res.data) {
					this.setState({
						isOpen: true
					});
				}
				this.setState({
					userStsCode: res.data,
					validEndTm: res.data
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 用户领取优惠劵
	getCoupon = () => {
		this.props.$fetch.post(API.noviceReceive).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data) {
				this.setState({
					userStsCode: res.data
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 处理后台返回的时间
	getTime = (time) => {
		if (!time) {
			return '';
		}
		const y = time.substring(0, 4);
		const m = time.substring(4, 6);
		const d = time.substring(6, 8);
		const h = time.substring(8, 10);
		const m1 = time.substring(10, 12);
		const s = time.substring(12, 14);
		return `${y}/${m}/${d} ${h}:${m1}:${s}`;
	};

	render() {
		const { isOpen, userStsCode, validEndTm } = this.state;
		const submitBtnBg = userStsCode ? submit_btn2 : submit_btn1;
		return (
			<div className={styles.new_users_page}>
				<div>
					<img src={activity_bg} className={styles.activityBg} />
				</div>
				<div className={styles.contentBox}>
					<div className={styles.wallet}>
						<img src={wallet_img1} className={styles.img1} />
						<img
							src={wallet_img2}
							className={isOpen ? [styles.img2, styles.slideImg].join(' ') : styles.img2}
						/>
						<img src={wallet_img3} className={styles.img3} />
						{/* 只有已领取未使用的状态下才展示有效期 */}
						{/* {userStsCode ? ( */}
						<div className={styles.validDate}>
							有效期还剩{' '}
							{validEndTm && (
								<CountDown
									endTime={this.getTime(validEndTm)}
									timeOver={() => {
										let now = +new Date();
										let thisTime = +new Date(this.getTime(validEndTm));
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
						{/* ) : null} */}
					</div>
					{/* 特殊阴影 */}
					<img src={shadow_img} className={styles.shadowImg} />
				</div>
				<div onClick={this.goTo}>
					<img src={submitBtnBg} className={styles.submitBtn} />
				</div>
				{/* 奖品列表 */}
				<div className={styles.awardListCont}>
					<AwardShow className={styles.awardList} />
				</div>
				{/* 活动规则 */}
				<div className={styles.rulesCont}>
					<img src={rules_bg} className={styles.rulesBg} />
					<div className={styles.rulesContent}>
						<p>1.活动期间，新注册用户可获得10天新手免息券，有效期4天；</p>
						<p>2.同一ID在活动期间仅限领取一次;</p>
						<p>3.免息券过期失效视为放弃，不可重复领取；</p>
						<p>4.仅在借款时使用，可减免首期利息。</p>
					</div>
				</div>
			</div>
		);
	}
}
