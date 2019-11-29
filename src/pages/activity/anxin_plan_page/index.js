/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-29 15:52:26
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import list_img from './img/list_img.png';
import enter_btn from './img/enter_btn.png';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import { isMPOS } from 'utils/common';
import SmsAlert from '../components/SmsAlert';
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';
import { store } from 'utils/store';

@setBackGround('#499BFE')
@fetch.inject()
export default class anxin_plan_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {}, // url上的参数
			isAllowDownload: false, // 是否显示下载按钮
			showLoginTip: false, // mpos开屏进入时是否登陆弹框
			showBoundle: false // 是否展示未实名的弹框
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState({
			queryData
		});
		if (queryData.allowDownload) {
			this.setState({
				isAllowDownload: true
			});
		} else {
			this.setState({
				isAllowDownload: false
			});
		}
	}

	componentDidMount() {
		const { queryData } = this.state;
		if (queryData.comeFrom) {
			buriedPointEvent(activity.anXinActivityEntry, {
				entry: queryData.comeFrom,
				regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
				pageNm: '集合列表页'
			});
		}
		if (queryData.fromApp) {
			if (queryData.activityToken) {
				Cookie.set('fin-v-card-token', queryData.activityToken, { expires: 365 });
			} else {
				Cookie.remove('fin-v-card-token');
			}
		}
	}

	prePressTime2 = 0;
	// 点击下载按钮
	goTo = () => {
		const nowTime = Date.now();
		if (nowTime - this.prePressTime2 > 1600 || !this.prePressTime2) {
			this.prePressTime2 = nowTime;
			const { queryData } = this.state;
			buriedPointEvent(activity.anXinActivityListDownLoadClick, {
				entry: queryData.comeFrom,
				regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
				pageNm: '集合列表页'
			});
			// mpos的banner
			if (isMPOS() && queryData.entry && queryData.entry.indexOf('ismpos_') > -1) {
				if (queryData.appId && queryData.token) {
					this.getStatus();
				} else {
					this.setState({
						showLoginTip: true
					});
				}
			} else if (Cookie.get('fin-v-card-token')) {
				// h5已登陆情况下以及mpos里还到的弹框
				store.setToken(Cookie.get('fin-v-card-token'));
				this.downloadApp();
			} else {
				if (queryData.fromApp) {
					const activityInf = {
						isWelfare: true,
						isLogin: false
					};
					setTimeout(() => {
						window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
					}, 0);
				} else {
					// 除了app以外的其他未登录的情况
					this.props.history.replace({
						pathname: '/login',
						search:
							'?wxTestFrom=anxin_plan_page&jumpUrl=' +
							encodeURIComponent(`/activity/anxin_plan_page?${qs.stringify(queryData)}`)
					});
				}
			}
		}
	};

	// 下载APP参加活动
	downloadApp = () => {
		const { queryData } = this.state;
		if (queryData.isWxOpen) {
			// 微信公共号菜单栏跳转特殊的下载落地页
			this.props.history.push('/others/wx_activity_download_page');
		} else {
			this.props.history.push('/others/mpos_testA_download_page');
		}
	};

	// 进入活动详情落地页
	enterDetail = (path) => {
		const { queryData } = this.state;
		buriedPointEvent(activity.anXinActivityListGoClick, {
			entry: queryData.comeFrom,
			regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
			pageNm: '集合列表页'
		});
		this.props.history.push({
			pathname: path,
			search: qs.stringify(queryData)
		});
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

	render() {
		const { isAllowDownload, queryData, showLoginTip, showBoundle } = this.state;
		return (
			<div className={styles.new_users_page}>
				{isMPOS() && queryData.entry && queryData.entry.indexOf('ismpos_') > -1 && (
					<SmsAlert
						onRef={this.onRef}
						goSubmitCb={{
							PTM0000: () => {
								this.downloadApp();
							},
							URM0008: () => {},
							others: (res) => {
								// this.props.toast.info('暂无领取资格');
								this.props.toast.info(res.msgInfo);
							}
						}}
						goLoginCb={{
							PTM0000: () => {
								this.downloadApp();
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
								this.downloadApp();
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
								this.downloadApp();
							},
							others: () => {
								// this.props.toast.info('暂无领取资格');
							}
						}}
					/>
				)}
				<div className={styles.topContainer}>
					<img src={activity_bg} className={styles.activityBg} />
					<div
						className={
							isAllowDownload
								? styles.listImgContainer
								: [styles.listImgContainer, styles.listImgContainer2].join(' ')
						}
					>
						<img src={list_img} className={styles.listImg} />
						{!isAllowDownload && (
							<img
								src={enter_btn}
								onClick={() => {
									this.enterDetail('/activity/guosong_page');
								}}
								className={styles.enterBtn}
							/>
						)}
						{!isAllowDownload && (
							<img
								src={enter_btn}
								onClick={() => {
									this.enterDetail('/activity/dibu_page');
								}}
								className={[styles.enterBtn, styles.enterBtn2].join(' ')}
							/>
						)}
						{!isAllowDownload && (
							<img
								src={enter_btn}
								onClick={() => {
									this.enterDetail('/activity/manpei_page');
								}}
								className={[styles.enterBtn, styles.enterBtn3].join(' ')}
							/>
						)}
						{!isAllowDownload && (
							<img
								src={enter_btn}
								onClick={() => {
									this.enterDetail('/activity/yongfan_page');
								}}
								className={[styles.enterBtn, styles.enterBtn4].join(' ')}
							/>
						)}
					</div>
				</div>
				{isAllowDownload && (
					<div className={styles.downloadContainer}>
						<div onClick={this.goTo} className={styles.downloadBtn}>
							下载APP参加活动
						</div>
					</div>
				)}
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
