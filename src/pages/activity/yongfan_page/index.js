/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-02-25 11:35:47
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
// import HomeBtnClass from 'utils/HomeBtn';
import linkConf from 'config/link.conf';

const API = {
	activeConfigThird: '/activeConfig/third' // 三陪一返活动:用户参与
};

@setBackGround('#427BF6')
@fetch.inject()
export default class yongfan_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {}, // url上的参数
			isAppOpen: false, // 是否是app webview打开
			registerChannel: '' // 注册渠道
		};
		// this['HomeBtn'] = new HomeBtnClass(this);
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.setState({
			queryData
		});
		if (queryData.fromApp) {
			this.setState({
				isAppOpen: true
			});
		} else if (Cookie.get('FIN-HD-AUTH-TOKEN')) {
			// this['HomeBtn'].fetchData();
		}
		if (queryData.regChannel) {
			this.setState({
				registerChannel: queryData.regChannel
			});
		}
	}

	componentDidMount() {
		const { isAppOpen, registerChannel, queryData } = this.state;
		if (queryData.comeFrom) {
			buriedPointEvent(activity.anXinActivityEntry, {
				entry: queryData.comeFrom,
				regChannel: registerChannel,
				pageNm: '用就返'
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
			const { isAppOpen, registerChannel, queryData } = this.state;
			buriedPointEvent(activity.anXinActivityDetailJoinClick, {
				entry: queryData.comeFrom,
				regChannel: registerChannel,
				pageNm: '用就返'
			});
			if (Cookie.get('FIN-HD-AUTH-TOKEN')) {
				this.getCoupon();
			} else if (isAppOpen && !Cookie.get('FIN-HD-AUTH-TOKEN')) {
				// 未登录 通知app登录
				const activityInf = {
					isWelfare: true,
					isLogin: false
				};
				this.props.toast.info('请先登录', 2, () => {
					setTimeout(() => {
						window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
					}, 0);
				});
			} else {
				this.props.toast.info('请登录还到app进行操作');
			}
		}
	};

	// 用户立即申请
	getCoupon = () => {
		const { isAppOpen } = this.state;
		// 01 过就送,02 低就赔,03 慢就赔,04 用就返
		this.props.$fetch.post(`${API.activeConfigThird}/04`).then((res) => {
			if (res.msgCode === 'PTM0000' || res.msgCode === 'PTM7009') {
				if (isAppOpen) {
					// 在去sq以后,才能如此跳转
					// 立即申请 通知app做相关操作
					const activityInf = {
						isWelfare: true,
						operation: 'useCoupon'
					};
					setTimeout(() => {
						window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
					}, 0);
				} else {
					// mpos或者h5中跳转对应节点
					// this['HomeBtn'].getData();
				}
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 跳转更多福利
	goMore = () => {
		const { queryData, isAppOpen, registerChannel } = this.state;
		buriedPointEvent(activity.anXinActivityDetailMoreClick, {
			entry: queryData.comeFrom,
			regChannel: registerChannel,
			pageNm: '用就返'
		});
		if (isAppOpen) {
			let activityInf = {};
			if (queryData.isGoBack) {
				activityInf = {
					isWelfare: true,
					isLogin: true
				};
			} else {
				activityInf = {
					isWelfare: true,
					operation: 'openWebview',
					landingTit: '还到',
					// landingUrl: `http://172.18.40.129:8010/activity/anxin_plan_page?comeFrom=${queryData.comeFrom}&isGoBack=true&currentPath=/activity/yongfan_page`
					landingUrl: `${linkConf.BASE_URL}/activity/anxin_plan_page?comeFrom=${queryData.comeFrom}&isGoBack=true&currentPath=/activity/yongfan_page`
				};
			}
			setTimeout(() => {
				window.ReactNativeWebView.postMessage(JSON.stringify(activityInf));
			}, 0);
		} else {
			if (queryData.isGoBack) {
				this.props.history.goBack();
			} else {
				this.props.history.push({
					pathname: '/activity/anxin_plan_page',
					search: `${qs.stringify(queryData)}&isGoBack=true&currentPath=/activity/yongfan_page`
				});
			}
		}
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
						<p>1、活动开始时间：2019年12月6日；</p>
						<p>2、本活动仅限mpos、微信公众号渠道注册未发生首次借款的用户参与，且仅从该活动入口参与有效；</p>
						<p>3、活动期间，通过活动首次借款成功的用户可获得199元免息券；</p>
						<p>4、满足获奖条件，免息券实时下发，您可前往“我的-优惠券”查看；</p>
						<p>5、免息券于借款时使用，仅抵扣首期利息，有效期365天，请您在有效期内尽快使用哦。</p>
					</div>
				</div>
			</div>
		);
	}
}
