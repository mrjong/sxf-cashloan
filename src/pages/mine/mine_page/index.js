/*
 * @Author: shawn
 * @LastEditTime : 2020-02-10 18:34:11
 */
import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { connect } from 'react-redux';
import { commonPage, FooterBar } from 'components';
import { buriedPointEvent } from 'utils/analytins';
import { isWXOpen } from 'utils';
import { logoutAppHandler } from 'utils/CommonUtil/commonFunc';
import styles from './index.scss';
import { isMPOS } from 'utils/common';
import { setBackGround } from 'utils/background';
import { helpCenter } from 'utils/analytinsType';
import images from 'assets/image';
import { setBackRouter } from 'reduxes/actions/commonActions';
import { showRedDot } from 'reduxes/actions/specialActions';

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
@connect(
	(state) => ({
		showRedDotNum: state.specialState.showRedDot,
		userInfo: state.staticState.userInfo,
		msgCount: state.specialState.msgCount
	}),
	{
		showRedDot,
		setBackRouter
	}
)
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
	}
	couponRedDot = () => {
		this.props.$fetch.get(API.couponRedDot).then((result) => {
			if (result && result.data) {
				this.props.globalTask(result.data);
			}
		});
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
		const { userInfo } = this.props;
		const { idCheckFlag = '' } = userInfo;
		if (!userInfo || !userInfo.tokenId) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		const isRealName = idCheckFlag && (idCheckFlag === '1' || idCheckFlag === '2');
		if (!isRealName) {
			this.props.toast.info('请先进行实名认证', 2, () => {
				this.props.history.push('/home/real_name?type=noRealName');
			});
		} else {
			this.props.history.push({ pathname: '/mine/select_save_page' });
		}
	};

	handleGoToCouponPage = () => {
		const { userInfo } = this.props;
		const { idCheckFlag = '' } = userInfo;
		if (!userInfo || !userInfo.tokenId) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		const isRealName = idCheckFlag && (idCheckFlag === '1' || idCheckFlag === '2');
		if (!isRealName) {
			this.props.toast.info('请先进行实名认证', 2, () => {
				this.props.history.push({ pathname: '/home/real_name', search: '?type=noRealName' });
			});
		} else {
			this.props.history.push({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
		}
	};

	handleGoToRealNamePage = () => {
		const { userInfo } = this.props;
		if (!userInfo || !userInfo.tokenId) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		this.props.history.push({ pathname: '/home/real_name', search: '?type=noRealName' });
	};

	handleGoToFeedbackPage = () => {
		const { userInfo } = this.props;
		if (!userInfo || !userInfo.tokenId) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		buriedPointEvent(helpCenter.feedback);
		this.props.history.push({ pathname: '/mine/feedback_page' });
	};

	renderListRowRealNameValue() {
		const { userInfo = {} } = this.props;
		const isRealName =
			(userInfo && userInfo.idCheckFlag === '1') || (userInfo && userInfo.idCheckFlag === '2');
		if (!userInfo || !userInfo.tokenId) {
			return (
				<div className={styles.optionListItemAddition}>
					<span className={styles.optionListItemAdditionArrow} />
				</div>
			);
		}
		if (isRealName) {
			return (
				<div className={styles.optionListItemAddition}>
					<span className={styles.optionListItemAdditionText}>已认证</span>
					<span className={styles.optionListItemAdditionArrow} />
				</div>
			);
		}
		return (
			<div className={styles.optionListItemAddition}>
				<span className={styles.optionListItemAdditionTextRed}>待完善信息</span>
				<span className={styles.optionListItemAdditionArrow} />
			</div>
		);
	}

	render() {
		const { mblNoHid } = this.state;
		const { showRedDotNum, msgCount = 0 } = this.props;

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
								{showRedDotNum ? (
									<span className={styles.entranceListItemMsg}>
										{showRedDotNum && Number(showRedDotNum) > 99 ? '99+' : showRedDotNum}
									</span>
								) : null}
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
								{msgCount ? (
									<span className={styles.entranceListItemMsg}>
										{msgCount && Number(msgCount) > 99 ? '99+' : msgCount}
									</span>
								) : null}
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
							{this.renderListRowRealNameValue()}
						</div>
					</div>
					<div className={styles.optionListWrap}>
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
					<div className={styles.bottomSlogen}>
						<FooterBar />
					</div>
				</div>
			</div>
		);
	}
}
