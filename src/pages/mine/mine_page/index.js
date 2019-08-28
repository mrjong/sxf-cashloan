import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import fetch from 'sx-fetch-rjl';
import avatar from 'assets/images/mine/login_logo.png';
import Lists from 'components/Lists';
import { isWXOpen, logoutAppHandler } from 'utils';
import styles from './index.scss';
import { isMPOS } from 'utils/common';
import { setBackGround } from 'utils/background';
import fqaImg from 'assets/images/mine/fqa_img.png';
import notLoginImg from 'assets/images/mine/not_login_logo.png';

const API = {
	VIPCARD: '/my/queryUsrMemSts', // 查询用户会员卡状态
	LOGOUT: '/signup/logout', // 用户退出登陆
	USERSTATUS: '/signup/getUsrSts', // 用户状态获取
	couponRedDot: '/index/couponRedDot', // 优惠券红点
	couponCount: '/index/couponCount' // 优惠券红点
};

let token = '';
let tokenFromStorage = '';

@fetch.inject()
@setBackGround('#fff')
export default class mine_page extends PureComponent {
	constructor(props) {
		super(props);
		// 获取token
		token = Cookie.get('fin-v-card-token');
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
		this.props.globalTask(null);
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
		// 清除订单缓存
		store.removeBackData();
		// 移除会员卡出入口
		store.removeVipBackUrl();
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
			this.couponRedDot();
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
	// 查询用户会员卡状态
	queryVipCard = () => {
		this.props.$fetch.get(API.VIPCARD).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				let inOnwMinute = new Date(new Date().getTime() + 1 * 15 * 1000);
				Cookie.set('VIPFlag', result.data.memSts, {
					expires: inOnwMinute
				});
				store.setVIPInfo(result.data);
				store.setVipBackUrl('/mine/mine_page');
				switch (result.data.memSts) {
					case '0':
						this.setState({ memberInf: { status: '未购买', color: '#FF5A5A' } });
						break;
					case '1':
						this.setState({ memberInf: { status: '已购买', color: '#4CA6FF' } });
						break;
					case '2':
						this.setState({ memberInf: { status: '处理中', color: '#4CA6FF' } });
						break;
					default:
						break;
				}
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 退出

	// 第一组里的点击事件
	clickhandle = (item) => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		if (item.jumpToUrl === '/mine/coupon_page') {
			this.props.history.push({ pathname: item.jumpToUrl, search: '?entryFrom=mine' });
		} else {
			const { mblNoHid, realNmFlg } = this.state;
			if (mblNoHid && realNmFlg && Cookie.get('VIPFlag') !== '2') {
				// this.props.history.push(item.jumpToUrl);
				this.props.history.push({ pathname: item.jumpToUrl, search: '?entryFrom=mine' });
			}
			// if (!mblNoHid) {
			//   this.props.toast.info('用户未登录', 2, () => {
			//     this.props.history.push('/login');
			//   })
			// }
			if (!realNmFlg) {
				this.props.toast.info('请先进行实名认证', 2, () => {
					// let isWx=this.is_weixn()
					// if (isWx) {
					//     //在微信中打开
					//     this.props.history.replace('/wxName')
					// }
					//else{
					this.props.history.push('/home/real_name?type=noRealName');
					//}
				});
			}
		}
	};
	// 第二组里的点击事件
	clickhandle2 = (item) => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		if (item.jumpToUrl === '/home/real_name?type=noRealName' || item.jumpToUrl === '/mine/fqa_page') {
			this.props.history.push(item.jumpToUrl);
		} else {
			const { mblNoHid, realNmFlg } = this.state;
			if (mblNoHid && realNmFlg) {
				this.props.history.push(item.jumpToUrl);
			}
			if (!realNmFlg) {
				this.props.toast.info('请先进行实名认证', 2, () => {
					this.props.history.push('/home/real_name?type=noRealName');
				});
			}
		}
	};
	// 第三组里的点击事件
	clickhandle3 = (item) => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		this.props.history.push(item.jumpToUrl);
	};
	// 点击退出登录后弹框
	logoutHandler = () => {
		logoutAppHandler();
	};
	// 登陆
	logInHandler = () => {
		this.props.history.push('/login');
	};

	goPage = () => {
		this.props.history.push('/mpos/mpos_ioscontrol_page?entryType=mine');
	};

	// 常见问题跳转
	jumpToFqa = () => {
		if (!tokenFromStorage && !token) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push('/login');
			});
			return;
		}
		this.props.history.push('/mine/fqa_page');
	};

	render() {
		const { mblNoHid, realNmFlg } = this.state;
		// 定义list所需的数据
		const listsArr = [
			// {
			//   extra: {
			//     name: this.state.memberInf.status,
			//     color: this.state.memberInf.color,
			//   },
			//   label: {
			//     name: '会员卡',
			//     icon: require('assets/images/mine/menu_ico7.png')
			//   },
			//   jumpToUrl: '/mine/membership_card_page',
			// },
			{
				// extra: {
				//   name: this.state.memberInf.status,
				//   color: this.state.memberInf.color,
				// },
				label: {
					name: '优惠劵',
					className: styles.coupon_page
				},
				jumpToUrl: '/mine/coupon_page'
			},
			{
				label: {
					name: '我的钱包',
					className: styles.wallet_page
				},
				jumpToUrl: '/mine/wallet_page'
			}
		];
		const listsArr2 = [
			{
				extra: {
					name: mblNoHid && realNmFlg ? '已认证' : '未认证',
					color: mblNoHid && realNmFlg ? '#66C879' : '#FF6666'
				},
				label: {
					name: '实名认证',
					className: styles.real_name
				},
				jumpToUrl: '/home/real_name?type=noRealName'
			},
			{
				label: {
					name: '储蓄卡管理',
					className: styles.select_save_page
				},
				jumpToUrl: '/mine/select_save_page'
			}
			// {
			// 	label: {
			// 		name: '常见问题',
			// 		className: styles.fqa_page
			// 	},
			// 	jumpToUrl: '/mine/fqa_page'
			// }
		];
		return (
			<div className={[styles.mine_page, 'mine_page_global'].join(' ')}>
				{tokenFromStorage && token ? (
					<div className={styles.user_inf}>
						<div className={styles.userInfBox}>
							<img src={avatar} alt="用户头像" />
							<span className={styles.mobile}>{mblNoHid}</span>
						</div>
						<div className={styles.follow_btn} onClick={this.goPage}>
							关注得免息
						</div>
					</div>
				) : null}
				{!(tokenFromStorage && token) ? (
					<div className={styles.notLoginBox}>
						<img src={notLoginImg} alt="未登录" />
						<p className={styles.desc}>借钱还信用卡，找还到</p>
						<div className={styles.loginBtn} onClick={this.logInHandler}>
							登录
						</div>
					</div>
				) : null}
				<Lists
					className={styles.mine_list}
					clickCb={this.clickhandle}
					CouponCount={this.state.CouponCount}
					listsInf={listsArr}
				/>
				<Lists
					clickCb={this.clickhandle2}
					listsInf={listsArr2}
					className={[styles.common_margin, styles.mine_list].join(' ')}
				/>
				<div className={styles.fqaBox} onClick={this.jumpToFqa}>
					<img src={fqaImg} alt="用户头像" />
				</div>
				{/* <Lists clickCb={this.clickhandle3} listsInf={listsArr3} className={styles.common_margin} /> */}
				{tokenFromStorage && token && !isMPOS() && (
					<div onClick={this.logoutHandler} className={styles.logout}>
						退出登录
					</div>
				)}
			</div>
		);
	}
}
