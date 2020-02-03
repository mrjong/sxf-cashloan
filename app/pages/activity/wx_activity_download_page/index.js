/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-04 10:47:05
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import list_img from './img/list_img.png';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { getDeviceType, queryUsrSCOpenId } from 'utils';
import linkConf from 'config/link.conf';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};
@setBackGround('#499BFE')
@fetch.inject()
export default class wx_activity_download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {}, // url上的参数
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
		if (queryData.entry) {
			buriedPointEvent(activity.anXinActivityEntry, {
				entry: queryData.entry,
				regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
				pageNm: '微信子菜单活动落地页'
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
				entry: queryData.entry,
				regChannel: queryData && queryData.regChannel ? queryData.regChannel : '',
				pageNm: '微信子菜单活动落地页',
				device_type: getDeviceType() === 'IOS' ? 'IOS' : 'ANDROID'
			});
			if (Cookie.get('fin-v-card-token')) {
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
					this.props.toast.info('请先登录', 2, () => {
						this.props.history.replace({
							pathname: '/login',
							search:
								'?wxTestFrom=/activity/wx_activity_download_page&jumpUrl=' +
								encodeURIComponent(`/activity/wx_activity_download_page?${qs.stringify(queryData)}`)
						});
					});
				}
			}
		}
	};

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

	// 下载APP参加活动
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

	render() {
		return (
			<div className={styles.new_users_page}>
				<div className={styles.topContainer}>
					<img src={activity_bg} className={styles.activityBg} />
					<div className={styles.listImgContainer}>
						<img src={list_img} className={styles.listImg} />
					</div>
				</div>
				<div className={styles.downloadContainer}>
					<div onClick={this.goTo} className={styles.downloadBtn}>
						下载APP参加活动
					</div>
				</div>
			</div>
		);
	}
}
