/*
 * @Author: sunjiankun
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2020-02-19 10:48:04
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
import { setBackGround } from 'utils/background';
import AwardShow from './components/AwardShow';
import CountDown from '../../mine/coupon_page/component/CountDown';

const API = {
	noviceJudge: '/novice/judge', // 判断用户是否满足领取条件接口
	noviceReceive: '/novice/receive' // 领取新手优惠券接口
};

@setBackGround('#F64C46')
@fetch.inject()
export default class new_users_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			userStsCode: null, // 用户状态code
			validEndTm: '', // 优惠劵有效期
			isOpen: false,
			isAppOpen: false, // 是否是app webview打开
			registerChannel: '' // 注册渠道
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
		if (queryData.regChannel) {
			this.setState({
				registerChannel: queryData.regChannel
			});
		}
	}

	componentDidMount() {
		const { isAppOpen, registerChannel } = this.state;
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.comeFrom) {
			buriedPointEvent(activity.newUserActivityEntry, {
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
			const { userStsCode, isAppOpen, registerChannel } = this.state;

			if (isAppOpen && Cookie.get('FIN-HD-AUTH-TOKEN')) {
				if (userStsCode === '00') {
					buriedPointEvent(activity.newUserActivityGetNow, {
						receiveSts: this.transferCode().buryMsg,
						regChannel: registerChannel
					});
					this.getCoupon();
				} else if (userStsCode == '04') {
					buriedPointEvent(activity.newUserActivityUseNow, {
						regChannel: registerChannel
					});
					// 已领取，去使用 通知app做相关操作
					const activityInf = {
						isWelfare: true,
						operation: 'useCoupon'
					};
					setTimeout(() => {
						window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
					}, 0);
				} else {
					buriedPointEvent(activity.newUserActivityGetNow, {
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
				showMsg = '可以领取';
				buryMsg = '可以领取';
				break;
			case '01':
				showMsg = '此次活动随行付plus用户注册还到专享';
				buryMsg = '非mpos用户';
				break;
			case '02':
				showMsg = '您是复贷用户，已不能领取新手优惠券';
				buryMsg = '您是复贷用户，已不能领取新手优惠券';
				break;
			case '03':
				showMsg = '活动期间只能获取一次';
				buryMsg = '已失效';
				break;
			case '04':
				showMsg = '已领取，去使用';
				buryMsg = '已领取，去使用';
				break;
			case '05':
				showMsg = '您是非活动时间注册还到，不符合领取条件';
				buryMsg = '您是非活动时间注册还到，不符合领取条件';
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
				if (res.data.status === '04' || res.data.status === '03') {
					this.setState({
						isOpen: true
					});
				}
				this.setState({
					userStsCode: res.data.status,
					validEndTm: res.data.validTm
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
					isOpen: true,
					userStsCode: res.data.status,
					validEndTm: res.data.validTm
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
		const submitBtnBg = userStsCode === '04' ? submit_btn2 : submit_btn1;
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
						{userStsCode === '04' ? (
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
						) : null}
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
						<p>1、活动期间，注册“还到”的新用户可获得10天新手免息券；</p>
						<p>2、免息券仅在借款时使用，可减免首期利息；</p>
						<p>3、免息券有效期4天，请您在有效期内尽快使用哦。</p>
					</div>
				</div>
			</div>
		);
	}
}
