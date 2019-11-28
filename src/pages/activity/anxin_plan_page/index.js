/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-28 10:06:08
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
import HomeBtnClass from 'utils/HomeBtn';

const API = {
	noviceReceive: '/novice/receive' // 领取新手优惠券接口
};

@setBackGround('#499BFE')
@fetch.inject()
export default class yongfan_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isAppOpen: false, // 是否是app webview打开
			registerChannel: '' // 注册渠道
		};
		this['HomeBtn'] = new HomeBtnClass(this);
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.fromApp) {
			this.setState({
				isAppOpen: true
			});
		} else {
			// this['HomeBtn'].fetchData();
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
			const { isAppOpen, registerChannel } = this.state;
			buriedPointEvent(activity.newUserActivityGetNow, {
				receiveSts: this.transferCode().buryMsg,
				regChannel: registerChannel
			});
			if (Cookie.get('fin-v-card-token')) {
				this.getCoupon();
			} else if (isAppOpen && !Cookie.get('fin-v-card-token')) {
				// 未登录 通知app登录
				const activityInf = {
					isWelfare: true
				};
				setTimeout(() => {
					window.postMessage(JSON.stringify(activityInf));
				}, 0);
			} else {
				this.props.toast.info('请登录还到app进行操作');
			}
		}
	};

	// 用户立即申请
	getCoupon = () => {
		const { isAppOpen } = this.state;
		this.props.$fetch.post(API.noviceReceive).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data) {
				if (isAppOpen) {
					// 在去sq以后,才能如此跳转
					// 立即申请 通知app做相关操作
					const activityInf = {
						isWelfare: true,
						operation: 'useCoupon'
					};
					setTimeout(() => {
						window.postMessage(JSON.stringify(activityInf));
					}, 0);
				} else {
					// mpos或者h5中跳转对应节点
					this['HomeBtn'].getData();
				}
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 下载APP参加活动
	downloadApp = () => {
		// this.props.history.push('');
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
					<div onClick={this.downloadApp} className={styles.downloadBtn}>
						下载APP参加活动
					</div>
				</div>
			</div>
		);
	}
}
