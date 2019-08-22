import React, { PureComponent } from 'react';
import qs from 'qs';
import { store } from 'utils/store';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import use_btn from './img/use_btn.png';
import rule_bg from './img/rule_bg.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { headerIgnore } from 'utils';
import fetch from 'sx-fetch';
import SmsAlert from '../components/SmsAlert';
import Cookie from 'js-cookie';
import { isMPOS } from 'utils/common';
import LoginAlert from './components/LoginAlert';
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';

const API = {
	joinActivity: '/activeConfig/join' // 参加活动 里面会判断用户有没有资格
};

@fetch.inject()
export default class wuyuekh_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isShowLogin: false, // 公众号显示登陆弹框
			showLoginTip: false, // mpos开屏进入时是否登陆弹框
			showBoundle: false, // 是否展示未实名的弹框
			isAppOpen: false // 是否是app webview打开
		};
	}

	componentWillMount() {
		const that = this;
		document.addEventListener('message', that.checkAppOpen);
	}

	componentDidMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.entry) {
			buriedPointEvent(activity.mianxi822Entry, {
				entry: queryData.entry
			});
		}
	}

	componentWillUnmount() {
		const that = this;
		document.removeEventListener('message', that.checkAppOpen);
	}

	goTo = () => {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		buriedPointEvent(activity.mianxi822UseBtn);

		if (isMPOS() && queryData.entry && queryData.entry.indexOf('ismpos_') > -1) {
			if (queryData.appId && queryData.token) {
				this.getStatus();
			} else {
				this.setState({
					showLoginTip: true
				});
			}
		} else if (Cookie.get('fin-v-card-token')) {
			store.setToken(Cookie.get('fin-v-card-token'));
			this.goHomePage();
		} else {
			this.setState({
				isShowLogin: true
			});
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
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.props.$fetch.get(API.joinActivity).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				store.setBonusActivity(true);
				this.jumpToHome();

				// this.props.toast.info('参与成功', 2, () => {
				// 	this.props.history.push('/home/home');
				// });
			} else if (res && (res.msgCode === 'MX0002' || res.msgCode === 'MX0003')) {
				// DRAW_NOT_MATCH("MX0001", "暂不可领取，请尝试领取另一张"),
				// DRAW_NOT_ALLOWED("MX0002", "暂无领取资格"),
				// HAVE_DRAW("MX0003", "您已领取过,快去借款吧")
				// ACTIVITY_OUT_TIME("PTM7007","活动已过期")
				this.props.toast.info(res.msgInfo, 2, () => {
					this.jumpToHome();
				});
			} else if (res && (res.msgCode === 'PTM0100' || res.msgCode === 'PTM1000')) {
				this.props.toast.info(res.msgInfo, 2, () => {
					Cookie.remove('fin-v-card-token');
					sessionStorage.clear();
					localStorage.clear();
					this.goTo();
				});
			} else {
				this.props.toast.info(res.msgInfo, 2, () => {
					this.jumpToHome();
				});
				// if (
				// 	queryData &&
				// 	queryData.entry &&
				// 	queryData.entry.indexOf('ismpos_') > -1 &&
				// 	(res && res.msgCode !== 'MX0001')
				// ) {
				// 	this.props.toast.info(res.msgInfo, 2, () => {
				// 		this.jumpToHome();
				// 	});
				// }
				// else {
				// 	this.props.toast.info(res.msgInfo);
				// }
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

	jumpToHome = () => {
		this.props.history.push('/home/home');
	};

	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};

	// 检查是否是app webview打开
	checkAppOpen = (e) => {
		const passData = JSON.parse(e.data);
		this.setState({
			isAppOpen: passData && passData.isAppOpen
		});
	};

	render() {
		const { isShowLogin, showLoginTip, showBoundle } = this.state;
		return (
			<div
				className={headerIgnore() ? styles.wuyuekh_page : `${styles.wuyuekh_page2} ${styles.wuyuekh_page}`}
			>
				<SmsAlert
					onRef={this.onRef}
					goSubmitCb={{
						PTM0000: (res, getType) => {
							this.goHomePage();
						},
						URM0008: (res, getType) => {},
						others: (res, getType) => {
							// this.props.toast.info('暂无领取资格');
							this.props.toast.info(res.msgInfo);
						}
					}}
					goLoginCb={{
						PTM0000: (res, getType) => {
							this.goHomePage();
						},
						URM0008: (res, getType) => {},
						others: (res, getType) => {
							// this.props.toast.info('暂无领取资格');
							this.props.toast.info(res.msgInfo);
						}
					}}
					validateMposCb={{
						PTM9000: (res, getType) => {
							this.props.history.replace('/mpos/mpos_ioscontrol_page');
						},
						others: (res, getType) => {
							this.setState({
								showBoundle: true
							});
						}
					}}
					chkAuthCb={{
						authFlag0: (res, getType) => {},
						authFlag1: (res, getType) => {
							this.goHomePage();
						},
						authFlag2: (res, getType) => {
							// this.props.toast.info('暂无领取资格');
						},
						others: (res, getType) => {
							// this.props.toast.info('暂无领取资格');
						}
					}}
					doAuthCb={{
						authSts00: (res, getType) => {
							this.goHomePage();
						},
						others: (res, getType) => {
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
						<p>1.活动时间：2019年8月28日开始 （活动时间视具体情况，随时调整）;</p>
						<p>2.活动期间，用户通过活动页面参与，可获得100元免息券1张，有效期7天;</p>
						<p>3.同一ID在活动期间限领取一次;</p>
						<p>4.100元红包在借款时使用，仅减免首期产生的利息，超过或不足100元部分按实际首期利息抵扣。</p>
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
