/*
 * @Author: shawn
 * @LastEditTime : 2020-02-07 10:45:04
 */
import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { commonPage } from 'components';
import { buriedPointEvent } from 'utils/analytins';
import { isWXOpen, logoutAppHandler } from 'utils';
import styles from './index.scss';
import { isMPOS } from 'utils/common';
import { setBackGround } from 'utils/background';
import { helpCenter } from 'utils/analytinsType';
import images from 'assets/image';

const API = {
	LOGOUT: '/signup/logout', // 用户退出登陆
	USERSTATUS: '/signup/getUsrSts', // 用户状态获取
	couponRedDot: '/index/couponRedDot', // 优惠券红点
	couponCount: '/index/couponCount' // 优惠券红点
};

let token = '';
let tokenFromStorage = '';

@fetch.inject()
@commonPage()
@setBackGround('#f0f3f9')
export default class mine_page extends PureComponent {
	constructor(props) {
		super(props);
		// 获取token
		token = Cookie.get('FIN-HD-AUTH-TOKEN');
		tokenFromStorage = store.getToken();
		this.state = {
			realNmFlg: false, // 用户是否实名
			mblNoHid: '',
			CouponCount: 0,
			memberInf: {
				// 会员卡信息
				status: '',
				color: ''
			}
		};
	}
	componentWillMount() {
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
		// 清除订单缓存
		store.removeBackData();
		console.log('---------', tokenFromStorage, token);
		if (tokenFromStorage && token) {
			// 判断session里是否存了用户信息，没有调用接口，有的话直接从session里取
			if (Cookie.get('authFlag')) {
				this.setState({
					mblNoHid: store.getUserPhone(),
					realNmFlg: Cookie.get('authFlag') === '1' ? true : false
				});
			} else {
				this.getUsrInfo();
			}
			this.couponCount();
		}
	}
	couponRedDot = () => {
		this.props.$fetch.get(API.couponRedDot).then((result) => {
			if (result && result.data) {
				this.props.globalTask(result.data);
			}
		});
	};
	couponCount = () => {
		this.props.$fetch.get(API.couponCount).then((result) => {
			if (result && result.data) {
				this.setState({
					CouponCount: (result.data && result.data.couponCount) || 0
				});
			} else {
				this.setState({
					CouponCount: 0
				});
			}
		});
	};
	// 获取用户信息
	getUsrInfo = () => {
		console.log('+++');
		this.props.$fetch.get(API.USERSTATUS).then(
			(res) => {
				if (res.msgCode !== 'PTM0000') {
					res.msgInfo && this.props.toast.info(res.msgInfo);
					return;
				}
				store.setUserPhone(res.mblNoHid);
				// store.setAuthFlag(res.realNmFlg);
				let inOnwMinute = new Date(new Date().getTime() + 1 * 15 * 1000);
				Cookie.set('authFlag', res.realNmFlg, {
					expires: inOnwMinute
				});
				store.setUserInfo(res);
				this.setState({ mblNoHid: res.mblNoHid, realNmFlg: res.realNmFlg === '1' ? true : false });
				//TODO ...
			},
			(err) => {
				err.msgInfo && this.props.toast.info(err.msgInfo);
			}
		);
	};

	logoutHandler = () => {
		logoutAppHandler();
	};

	goPage = () => {
		if (tokenFromStorage && token) {
			this.props.history.push('/mpos/mpos_ioscontrol_page?entryType=mine');
		} else {
			this.props.history.push('/login');
		}
	};

	// 常见问题跳转
	jumpToFqa = () => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		// this.props.history.push('/mine/fqa_page');
		this.props.history.push('/mine/help_center_page');
	};

	handleGoToPage = (url) => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		this.props.history.push({ pathname: url });
	};

	handleGoToSelectCardPage = () => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		const { realNmFlg } = this.state;
		if (!realNmFlg) {
			this.props.toast.info('请先进行实名认证', 2, () => {
				this.props.history.push('/home/real_name?type=noRealName');
			});
		} else {
			this.props.history.push({ pathname: '/mine/select_save_page' });
		}
	};

	handleGoToCouponPage = () => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}

		const { mblNoHid, realNmFlg } = this.state;
		if (!realNmFlg) {
			this.props.toast.info('请先进行实名认证', 2, () => {
				this.props.history.push({ pathname: '/home/real_name', search: '?type=noRealName' });
			});
		} else if (mblNoHid && Cookie.get('VIPFlag') !== '2') {
			this.props.history.push({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
		}
	};

	handleGoToRealNamePage = () => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		this.props.history.push({ pathname: '/home/real_name', search: '?type=noRealName' });
	};

	handleGoToFeedbackPage = () => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		buriedPointEvent(helpCenter.feedback);
		this.props.history.push({ pathname: '/mine/feedback_page' });
	};

	render() {
		const { mblNoHid } = this.state;
		return (
			<div className={styles.myPages}>
				<div className={styles.bannerTop}>
					<div className={styles.bannerHaader}>
						<div className={styles.bannerHaaderTitleWrap}>
							<p className={styles.bannerHaaderTitle}>
								Hi,
								{mblNoHid || '欢迎使用还到'}
							</p>
							<p className={styles.bannerHaaderTitleSub}>随行付金融旗下信贷服务</p>
						</div>
						<div className={styles.bannerHaaderBtn} onClick={this.goPage}>
							{tokenFromStorage && token ? '关注得免息' : '登录'}
						</div>
					</div>
					<div className={styles.entranceList}>
						<div
							className={[styles.entranceListItem, styles.entranceListItem1].join(' ')}
							onClick={() => {
								this.handleGoToSelectCardPage();
							}}
						>
							<div className={styles.entranceListItemIconWrap}>
								<img className={styles.entranceListItemIcon} src={images.tabnav.mine_page_card} alt="" />
								<span className={styles.entranceListItemMsg}>1</span>
							</div>
							<p className={styles.entranceListItemName}>储蓄卡管理</p>
						</div>
						<div
							className={[styles.entranceListItem, styles.entranceListItem2].join(' ')}
							onClick={() => {
								this.handleGoToCouponPage();
							}}
						>
							<div className={styles.entranceListItemIconWrap}>
								<img className={styles.entranceListItemIcon} src={images.tabnav.mine_page_coupon} alt="" />
								<span className={styles.entranceListItemMsg}>1</span>
							</div>
							<p className={styles.entranceListItemName}>优惠券</p>
						</div>
						<div
							className={[styles.entranceListItem, styles.entranceListItem3].join(' ')}
							onClick={() => {
								this.handleGoToPage('/home/message_page');
							}}
						>
							<div className={styles.entranceListItemIconWrap}>
								<img className={styles.entranceListItemIcon} src={images.tabnav.mine_page_msg} alt="" />
								<span className={styles.entranceListItemMsg}>99+</span>
							</div>
							<p className={styles.entranceListItemName}>消息</p>
						</div>
					</div>
				</div>
				<div className={styles.pageContent}>
					<div className={styles.optionListWrap}>
						<div
							className={styles.optionListItem}
							onClick={() => {
								this.handleGoToRealNamePage();
							}}
						>
							<span className={styles.optionListItemName}>实名认证</span>
							<div className={styles.optionListItemAddition}>
								<span className={styles.optionListItemAdditionText}>待完善信息</span>
								<span className={styles.optionListItemAdditionArrow} />
							</div>
						</div>
					</div>
					<div className={styles.optionListWrap}>
						<div
							className={styles.optionListItem}
							onClick={() => {
								this.handleGoToRealNamePage();
							}}
						>
							<span className={styles.optionListItemName}>修改密码</span>
							<div className={styles.optionListItemAddition}>
								<span className={styles.optionListItemAdditionArrow} />
							</div>
						</div>
						<div
							className={styles.optionListItem}
							onClick={() => {
								this.handleGoToFeedbackPage();
							}}
						>
							<span className={styles.optionListItemName}>意见反馈</span>
							<div className={styles.optionListItemAddition}>
								<span className={styles.optionListItemAdditionArrow} />
							</div>
						</div>
						<div
							className={styles.optionListItem}
							onClick={() => {
								this.handleGoToPage('/mine/help_center_page');
							}}
						>
							<span className={styles.optionListItemName}>帮助中心</span>
							<div className={styles.optionListItemAddition}>
								<span className={styles.optionListItemAdditionArrow} />
							</div>
						</div>
					</div>

					{tokenFromStorage && token && !isMPOS() && (
						<div onClick={this.logoutHandler} className={styles.logout}>
							退出登录
						</div>
					)}
					<p className={styles.bottomSlogen}>随行付金融旗下信贷服务</p>
				</div>
			</div>
		);
	}
}
