/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-28 11:14:47
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import activity_bg from './img/activity_bg.png';
import submit_btn1 from './img/btn_bg.png';
import rules_bg from './img/rules_bg.png';
import feature_img from './img/feature_img.png';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';

const API = {
	noviceJudge: '/novice/judge', // 判断用户是否满足领取条件接口
	noviceReceive: '/novice/receive' // 领取新手优惠券接口
};

@setBackGround('#499BFE')
@fetch.inject()
export default class guosong_page extends PureComponent {
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
			this.setState({
				isAppOpen: true
			});
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
			const { userStsCode, isAppOpen, registerChannel } = this.state;

			if (isAppOpen && Cookie.get('fin-v-card-token')) {
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
						window.postMessage(JSON.stringify(activityInf), () => {});
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

	// 跳转更多福利
	goMore = () => {
		this.props.history.push('/activity/anxin_plan_page');
	};

	render() {
		return (
			<div className={styles.new_users_page}>
				<div className={styles.topContainer}>
					<img src={activity_bg} className={styles.activityBg} />
					<div onClick={this.goTo}>
						<img src={submit_btn1} className={styles.submitBtn} />
					</div>
				</div>
				<div className={styles.moreList} onClick={this.goMore}>
					更多福利 >>
				</div>
				<div>
					<img src={feature_img} className={styles.featureStyle} />
				</div>
				{/* 活动规则 */}
				<div className={styles.rulesCont}>
					<img src={rules_bg} className={styles.rulesBg} />
					<div className={styles.rulesContent}>
						<p>1、活动开始时间：待定</p>
						<p>2、本活动仅限mpos、微信公众号渠道注册且未发生首次借款的用户参与，且仅从该活动入口参与有效；</p>
						<p>3、活动期间，提交通过的用户可获得118元免息券；</p>
						<p>4、免息券实时发放，您可前往“我的-优惠券”查看，使用规则以免息券上所载的规则为准；</p>
						<p>5、免息券有效期为5天，请您在有效期内尽快使用哦。</p>
					</div>
				</div>
			</div>
		);
	}
}
