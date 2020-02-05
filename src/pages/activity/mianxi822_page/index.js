import React, { PureComponent } from 'react';
import qs from 'qs';
import { store } from 'utils/store';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import use_btn from './img/use_btn.png';
import rule_bg from './img/rule_bg.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import SmsAlert from '../components/SmsAlert';
import Cookie from 'js-cookie';
import { isMPOS } from 'utils/common';
import LoginAlert from './components/LoginAlert';
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';

const API = {
	joinActivity: 'activeConfig/hundred/draw' // 参加活动 里面会判断用户有没有资格
};

@fetch.inject()
export default class mianxi822_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isShowLogin: false, // 公众号显示登陆弹框
			showLoginTip: false, // mpos开屏进入时是否登陆弹框
			showBoundle: false, // 是否展示未实名的弹框
			isAppOpen: false, // 是否是app webview打开
			isPlus: false
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.fromApp) {
			this.setState({
				isPlus: queryData.isPlus,
				isAppOpen: true
			});
		}
	}

	componentDidMount() {
		const { isAppOpen } = this.state;
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.entry) {
			buriedPointEvent(activity.mianxi822Entry, {
				entry: queryData.entry,
				medium: isAppOpen ? 'APP' : 'H5'
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

	componentWillUnmount() {}

	prePressTime2 = 0;
	goTo = () => {
		const nowTime = Date.now();
		if (nowTime - this.prePressTime2 > 1600 || !this.prePressTime2) {
			this.prePressTime2 = nowTime;
			const { isAppOpen, isPlus } = this.state;
			const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
			buriedPointEvent(activity.mianxi822UseBtn, {
				entry: queryData.entry,
				medium: isAppOpen ? 'APP' : 'H5'
			});

			if (isMPOS() && queryData.entry && queryData.entry.indexOf('ismpos_') > -1) {
				if (queryData.appId && queryData.token) {
					this.getStatus();
				} else {
					this.setState({
						showLoginTip: true
					});
				}
			} else if (Cookie.get('FIN-HD-AUTH-TOKEN')) {
				store.setToken(Cookie.get('FIN-HD-AUTH-TOKEN'));
				this.goHomePage();
			} else {
				if (isAppOpen) {
					const activityInf = {
						activityNm: '100元免息红包限时领',
						isLogin: false
					};
					setTimeout(() => {
						if (isPlus) {
							window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
						} else {
							window.postMessage(JSON.stringify(activityInf), () => {});
						}
					}, 0);
				} else {
					this.setState({
						isShowLogin: true
					});
				}
			}
		}
	};

	getStatus = () => {
		this.child.validateMposRelSts({
			smsProps_disabled: true,
			loginProps_disabled: true,
			loginProps_needLogin: true,
			otherProps_type: 'home'
		});
	};

	onRef = (ref) => {
		this.child = ref;
	};

	goHomePage = () => {
		// 接口返回，详见 http://172.16.154.77/web/#/3?page_id=616
		this.props.$fetch.get(API.joinActivity).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				if (res.data && res.data.sts === '00') {
					store.setBonusActivity(true);
					this.jumpToHome(true);
				} else if (res.data && res.data.sts === '04') {
					this.props.toast.info('不符合领取条件', 2, () => {
						this.jumpToHome();
					});
				} else {
					this.jumpToHome();
				}
			} else if (res && (res.msgCode === 'PTM0100' || res.msgCode === 'PTM1000')) {
				this.props.toast.info(res.msgInfo, 2, () => {
					Cookie.remove('FIN-HD-AUTH-TOKEN');
					sessionStorage.clear();
					localStorage.clear();
					this.goTo();
				});
			} else {
				this.props.toast.info(res.msgInfo, 2, () => {
					this.jumpToHome();
				});
			}
		});
	};

	closeTip = () => {
		this.setState({
			showLoginTip: false
		});
	};

	closeLoginModal = () => {
		this.setState({
			isShowLogin: false
		});
	};

	jumpToHome = (isSuccess) => {
		const { isAppOpen, isPlus } = this.state;
		const activityInf = {
			activityNm: '100元免息红包限时领',
			isLogin: true,
			joinSucc: isSuccess ? true : false
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
			this.props.history.push('/home/home');
		}
	};

	prePressTime = 0;

	// 跳转协议
	go = (url) => {
		const nowTime = Date.now();
		if (nowTime - this.prePressTime > 1600 || !this.prePressTime) {
			this.prePressTime = nowTime;
			const { isAppOpen, isPlus } = this.state;
			const activityInf = {
				activityNm: '100元免息红包限时领',
				protocolNm: url
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
				this.props.history.push(`/protocol/${url}`);
			}
		}
	};

	render() {
		const { isShowLogin, showLoginTip, showBoundle } = this.state;
		return (
			<div className={styles.wuyuekh_page}>
				<SmsAlert
					onRef={this.onRef}
					goSubmitCb={{
						PTM0000: () => {
							this.goHomePage();
						},
						URM0008: () => {},
						others: (res) => {
							// this.props.toast.info('暂无领取资格');
							this.props.toast.info(res.msgInfo);
						}
					}}
					goLoginCb={{
						PTM0000: () => {
							this.goHomePage();
						},
						URM0008: () => {},
						others: (res) => {
							// this.props.toast.info('暂无领取资格');
							this.props.toast.info(res.msgInfo);
						}
					}}
					validateMposCb={{
						PTM9000: () => {
							this.props.history.replace('/mpos/mpos_ioscontrol_page');
						},
						others: () => {
							this.setState({
								showBoundle: true
							});
						}
					}}
					chkAuthCb={{
						authFlag0: () => {},
						authFlag1: () => {
							this.goHomePage();
						},
						authFlag2: () => {
							// this.props.toast.info('暂无领取资格');
						},
						others: () => {
							// this.props.toast.info('暂无领取资格');
						}
					}}
					doAuthCb={{
						authSts00: () => {
							this.goHomePage();
						},
						others: () => {
							// this.props.toast.info('暂无领取资格');
						}
					}}
					modalBtnBuryPoint={this.confirmHandler}
				/>
				<div className={styles.topContainer}>
					<img src={activity_bg} className={styles.activity_bg} />
					<img src={use_btn} className={styles.useBtn} onClick={this.goTo} />
					<div className={styles.protocolBox}>
						领取即同意
						<span
							onClick={() => {
								this.go('register_agreement_page');
							}}
						>
							《随行付金融用户注册协议》
						</span>
						<span
							onClick={() => {
								this.go('privacy_agreement_page');
							}}
						>
							《随行付用户隐私协议政策》
						</span>
					</div>
				</div>
				<div className={styles.ruleBox}>
					<img src={rule_bg} className={styles.ruleBg} />
					<div className={styles.ruleContBox}>
						<p>1.活动时间：2019年8月28日开始；</p>
						<p>
							2.活动期间，用户通过活动页面参与，可获得100元免息红包1个，有效期7天，未还清及有额度未借款用户暂无参与资格;
						</p>
						<p>3.同一ID在活动期间限领取一次;</p>
						<p>4.100元免息红包在借款时使用，仅减免首期产生的利息，超过或不足100元部分按实际首期利息抵扣。</p>
					</div>
				</div>
				{isShowLogin && <LoginAlert smsSuccess={this.goHomePage} closeModal={this.closeLoginModal} />}
				{showLoginTip && (
					<div className={styles.modal}>
						<div className={styles.mask} />
						<div className={[styles.modalWrapper, styles.tipWrapper].join(' ')}>
							<div className={styles.tipText}>
								<span>小主～</span>
								<br />
								<span>活动火热进行中，快前往「还到」参与！</span>
							</div>
							<div className={styles.closeBtnStyle} onClick={this.closeTip} />
						</div>
					</div>
				)}
				{showBoundle ? <Alert_mpos /> : null}
			</div>
		);
	}
}
