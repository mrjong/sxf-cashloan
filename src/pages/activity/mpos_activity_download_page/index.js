/*
 * @Author: shawn
 * @LastEditTime: 2019-12-04 10:55:14
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { getDeviceType, queryUsrSCOpenId } from 'utils';
import { activity } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
import top_bg from './img/top_bg.png';
import block_bg from './img/block_bg.png';
import title_bg from './img/title_bg.png';
import list_bg from './img/list_bg.png';
import { isMPOS } from 'utils/common';
import SmsAlert from '../components/SmsAlert';
import Alert_mpos from 'pages/mpos/mpos_no_realname_alert_page';
import qs from 'qs';
import Cookie from 'js-cookie';
import { store } from 'utils/store';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};
@setBackGround('#fff')
@fetch.inject()
export default class mpos_activity_download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showLoginTip: false, // mpos开屏进入时是否登陆弹框
			showBoundle: false // 是否展示未实名的弹框
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState({
			queryData
		});
	}

	componentDidMount() {
		const { queryData } = this.state;
		if (queryData.comeFrom) {
			buriedPointEvent(activity.anXinActivityEntry, {
				entry: queryData.comeFrom,
				regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
				pageNm: 'mpos活动落地页'
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

	getDownloadUrl = () => {
		this.props.$fetch
			.get(API.DOWNLOADURL, {
				type: '03'
			})
			.then(
				(res) => {
					if (res.msgCode === 'PTM0000') {
						window.location.href = res.data;
					} else {
						res.msgInfo && this.props.toast.info(res.msgInfo);
					}
				},
				(error) => {
					error.msgInfo && this.props.toast.info(error.msgInfo);
				}
			);
	};

	// 点击下载按钮
	goTo = () => {
		const { queryData } = this.state;
		buriedPointEvent(activity.anXinActivityListDownLoadClick, {
			entry: queryData.comeFrom,
			regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
			pageNm: 'mpos活动落地页',
			device_type: getDeviceType() === 'IOS' ? 'IOS' : 'ANDROID'
		});
		// mpos的banner
		if (isMPOS() && queryData.comeFrom && queryData.comeFrom.indexOf('ismpos_') > -1) {
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
			queryUsrSCOpenId({
				$props: this.props
			}).then(() => {
				this.downloadApp();
			});
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
						'?wxTestFrom=/activity/mpos_activity_download_page&jumpUrl=' +
						encodeURIComponent(`/activity/mpos_activity_download_page?${qs.stringify(queryData)}`)
				});
			}
		}
	};

	// 下载app
	downloadApp = () => {
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			this.props.$fetch.get(API.DOWNLOADURL, {}).then(
				(res) => {
					if (res.msgCode === 'PTM0000') {
						this.props.toast.info('安全下载中');
						window.location.href = res.data;
					} else {
						res.msgInfo && this.props.toast.info(res.msgInfo);
					}
				},
				(error) => {
					error.msgInfo && this.props.toast.info(error.msgInfo);
				}
			);
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

	closeTip = () => {
		this.setState({
			showLoginTip: false
		});
	};

	render() {
		const { queryData, showLoginTip, showBoundle } = this.state;
		return (
			<div className={styles.mpos_download_page}>
				{isMPOS() && queryData.comeFrom && queryData.comeFrom.indexOf('ismpos_') > -1 && (
					<SmsAlert
						onRef={this.onRef}
						goSubmitCb={{
							PTM0000: () => {
								queryUsrSCOpenId({
									$props: this.props
								}).then(() => {
									this.downloadApp();
								});
							},
							URM0008: () => {},
							others: (res) => {
								// this.props.toast.info('暂无领取资格');
								this.props.toast.info(res.msgInfo);
							}
						}}
						goLoginCb={{
							PTM0000: () => {
								queryUsrSCOpenId({
									$props: this.props
								}).then(() => {
									this.downloadApp();
								});
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
								queryUsrSCOpenId({
									$props: this.props
								}).then(() => {
									this.downloadApp();
								});
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
								queryUsrSCOpenId({
									$props: this.props
								}).then(() => {
									this.downloadApp();
								});
							},
							others: () => {
								// this.props.toast.info('暂无领取资格');
							}
						}}
					/>
				)}
				<div className={styles.img_wrap}>
					<img src={top_bg} alt="" className={styles.topBg} />
					<div className={styles.content_wrap}>
						<img src={block_bg} alt="" className={styles.blockBg} />
						<img src={title_bg} alt="" className={styles.titleBg} />
						<img src={list_bg} alt="" className={styles.listBg} />
					</div>
				</div>
				<div onClick={this.goTo} className={styles.submitBtn}>
					下载APP立即参与
				</div>
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
