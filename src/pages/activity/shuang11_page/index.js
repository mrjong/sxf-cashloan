import qs from 'qs';
import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { createForm } from 'rc-form';
import { Toast } from 'antd-mobile';
import { store } from 'utils/store';
import { getDeviceType, getFirstError, isBugBrowser, isWXOpen } from 'utils/common';
import bg from './img/bg.png';
import img_5_qiang from './img/img_5_qiang.png';
import alert_new_user from './img/alert_new_user.png';
import alert_btn_new_user from './img/alert_btn_new_user.png';
import alert_btn_shiyong from './img/alert_btn_shiyong.png';
// import alert_btn_688 from './img/alert_btn_688.png';
import img_7_qiang from './img/img_7_qiang.png';
import img_10_qiang from './img/img_10_qiang.png';
import img_15_qiang from './img/img_15_qiang.png';
import img_5_use from './img/img_5_use.png';
import img_7_use from './img/img_7_use.png';
import img_10_use from './img/img_10_use.png';
import img_15_use from './img/img_15_use.png';
import img_5_over from './img/img_5_over.png';
import img_7_over from './img/img_7_over.png';
import img_10_over from './img/img_10_over.png';
import img_15_over from './img/img_15_over.png';
import login_bg from './img/login_bg.png';
import close from './img/20181024_close.png';
import alert_10 from './img/alert_10.png';
import alert_15 from './img/alert_15.png';
import { handleInputBlur } from 'utils'
let timmer;
const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms',
	chkUser: '/event/chkUser',
	receive: '/event/receive'
};

@fetch.inject()
@createForm()
export default class shuang11_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '获取验证码',
			timeflag: true,
			flag: true,
			smsJrnNo: '', // 短信流水号
			login_box: false,
			showAlert: false,
			alertType: '',
			type: '',
			img5: img_5_qiang,
			img7: img_7_qiang,
			img10: img_10_qiang,
			img15: img_15_qiang
		};
	}
	componentWillMount() {
		// 返现上一次刷新的状态
		if (localStorage.getItem('img5')) {
			this.setState({
				img5: localStorage.getItem('img5')
			});
		}
		if (localStorage.getItem('img7')) {
			this.setState({
				img7: localStorage.getItem('img7')
			});
		}
		if (localStorage.getItem('img10')) {
			this.setState({
				img10: localStorage.getItem('img10')
			});
		}
		if (localStorage.getItem('img15')) {
			this.setState({
				img15: localStorage.getItem('img15')
			});
		}
	}
	// 关闭登录弹窗
	closeFunc = () => {
		this.setState({
			login_box: false,
			type: ''
		});
	};

	// 图片点击
	imgClick = (type) => {
		const token = Cookie.get('fin-v-card-token');
		if (!token) {
			this.setState({
				login_box: true,
				type
			});
			return;
        }
        store.setTokenSession(token)
		this.typeUp(type);
	};

	typeUp = (type) => {
		console.log(type);
		switch (type) {
			case '5':
				if (this.state.img5 === img_5_over) {
					// Toast.info('今日您已抢券,请明天再试~');
					return;
				}
				if (this.state.img5 === img_5_use) {
					this.goRoute();
					return;
				}
				Toast.loading('数据加载中...');
				setTimeout(() => {
					Toast.hide();
					Toast.info('您来晚了，奖品已抢光');
					this.setState({
						img5: img_5_over
					});
					localStorage.setItem('img5', img_5_over);
				}, 1000);
				break;
			case '7':
				if (this.state.img7 === img_7_over) {
					// Toast.info('今日您已抢券,请明天再试~');
					return;
				}
				if (this.state.img7 === img_7_use) {
					this.goRoute();
					return;
				}
				Toast.loading('数据加载中...');
				setTimeout(() => {
					Toast.hide();
					Toast.info('您来晚了，奖品已抢光');
					this.setState({
						img7: img_7_over
					});
					localStorage.setItem('img7', img_7_over);
				}, 1000);
				break;
			case '10':
				if (this.state.img10 === img_10_over) {
					// Toast.info('今日您已抢券,请明天再试~');
					return;
				}
				if (this.state.img10 === img_10_use) {
					this.goRoute();
					return;
				}
				this.chkUser(type);
				break;
			case '15':
				if (this.state.img15 === img_15_over) {
					// Toast.info('今日您已抢券,请明天再试~');
					return;
				}
				if (this.state.img15 === img_15_use) {
					this.goRoute();
					return;
				}
				this.chkUser(type);
			default:
				break;
		}
		return;
	};
	// 判断用户是否可以领劵
	chkUser = (type) => {
		this.props.$fetch.get(`${API.chkUser}`).then((res1) => {
			if (res1 && res1.msgCode === 'PTM0000') {
				// 0：老用户；1：新用户；
				if (res1.data.userRegDt === '0') {
					this.setState({
						showAlert: true,
						alertType: 'alert_new_user'
					});
					return;
				}
				if (type === '10') {
					// 调用领券接口
					this.receive(type);
					this.setState({
						img10: res1.data.coupon10 === '0' ? img_10_use : img_10_use
					});
					localStorage.setItem('img10', res1.data.coupon10 === '0' ? img_10_use : img_10_use);
					if (res1.data.coupon10 === '0') {
						this.setState({
							showAlert: true,
							alertType: 'alert_10'
						});
					}
				}
				if (type === '15') {
					// 调用领券接口
					this.receive(type);
					this.setState({
						img15: res1.data.coupon15 === '0' ? img_15_use : img_15_use
					});
					localStorage.setItem('img15', res1.data.coupon15 === '0' ? img_15_use : img_15_use);
					if (res1.data.coupon10 === '0') {
						this.setState({
							showAlert: true,
							alertType: 'alert_15'
						});
					}
				}
			} else if (res1 && res1.msgCode === 'PTM1000') {
				this.imgClick(type);
				this.setState({
					login_box: true,
					type: ''
				});
			} else {
				Toast.info(res1.msgInfo);
			}
		});
	};
	// 领券
	receive = (type) => {
		this.props.$fetch.get(`${API.receive}/COUPON_${type}`);
	};
	//获得手机验证码
	getTime(i) {
		if (!this.getSmsCode(i)) {
			return;
		}
	}

	// 获得手机验证码
	getSmsCode(i) {
		const osType = getDeviceType();
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				// 埋点-登录页获取验证码
				// 发送验证码
				this.props.$fetch
					.post(API.sendsms, {
						type: '6',
						mblNo: values.phoneValue,
						osType
					})
					.then((result) => {
						if (result.msgCode !== 'PTM0000') {
							Toast.info(result.msgInfo);
							this.setState({ valueInputImgCode: '' });
							return false;
						}
						Toast.info('发送成功，请注意查收！');
						this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
						timmer = setInterval(() => {
							this.setState({ flag: false, timers: i-- + '"' });
							if (i === -1) {
								clearInterval(timmer);
								this.setState({ timers: '重新获取', timeflag: true, flag: true });
							}
						}, 1000);
					});
			} else {
				Toast.info(getFirstError(err));
			}
		});
	}

	//去登陆按钮
	goLogin = () => {
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			Toast.info('请先获取短信验证码');
			return;
		}
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		this.props.form.validateFields((err, values) => {
			if (!err) {
				// 埋点-注册登录页一键代还
				this.props.$fetch
					.post(API.smsForLogin, {
						mblNo: values.phoneValue, // 手机号
						smsJrnNo: this.state.smsJrnNo, // 短信流水号
						osType, // 操作系统
						smsCd: values.smsCd, // IP地址
						usrCnl:
							queryData && queryData.h5Channel
								? queryData.h5Channel
								: localStorage.getItem('h5Channel') || 'h5', // 用户渠道
						location: store.getPosition() // 定位地址 TODO 从session取
					})
					.then(
						(res) => {
							if (res.msgCode !== 'PTM0000') {
								res.msgInfo && Toast.info(res.msgInfo);
								return;
							}
							Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });
							this.imgClick(this.state.type);
							// store.setToken(res.data.tokenId);

							// TODO: 根据设备类型存储token
							if (isBugBrowser()) {
								store.setToken(res.data.tokenId);
							} else {
								store.setTokenSession(res.data.tokenId);
							}
							this.closeFunc();
						},
						(error) => {
							error.msgInfo && Toast.info(error.msgInfo);
						}
					);
			} else {
				Toast.info(getFirstError(err));
			}
		});
	};

	// 立即使用
	goRoute = () => {
		this.props.history.replace('/home/home');
	};

	render() {
		const { getFieldProps } = this.props.form;
		return (
			<div id="huodong">
				<div className={style.bg}>
					<img src={bg} className={style.bg_img} />
					<div className={style.img_box}>
						<img
							src={this.state.img5}
							onClick={() => {
								this.imgClick('5');
							}}
							className={style.img_big}
						/>
						<img
							src={this.state.img7}
							onClick={() => {
								this.imgClick('7');
							}}
							className={style.img_big}
						/>
						<div className={style.img_box_small}>
							<img
								onClick={() => {
									this.imgClick('10');
								}}
								src={this.state.img10}
							/>
							<img
								onClick={() => {
									this.imgClick('15');
								}}
								src={this.state.img15}
							/>
						</div>
					</div>
				</div>
				{/* 弹窗 */}
				<div style={{ display: this.state.login_box ? 'block' : 'none' }}>
					<div className={style.alert_bg} />
					<img className={style.login_bg} src={login_bg} />
					<div className={style.login_box}>
						<img src={close} onClick={this.closeFunc} className={style.close} />
						<input
							pattern="[0-9]*"
							maxLength="11"
							type="text"
							{...getFieldProps('phoneValue', {
								rules: [ { required: true, message: '请输入正确手机号' }, { validator: this.validatePhone } ]
							})}
							placeholder="请输入手机号码"
						/>
						<div className={style.sms_box}>
							<input
								pattern="[0-9]*"
								maxLength="6"
								type="text"
								placeholder="请输入短信验证码"
								{...getFieldProps('smsCd', {
									rules: [ { required: true, message: '请输入正确验证码' } ]
								})}
							/>
							<button
								onClick={() => {
									this.state.timeflag ? this.getTime(59) : '';
								}}
								className={this.state.flag ? style.btn_sms : style.btn_sms_dis}
							>
								{this.state.timers}
							</button>
						</div>
						<button onClick={this.goLogin} className={style.btn_login}>
							登录领取
						</button>
					</div>
				</div>
				{/* 新用户 */}
				{this.state.showAlert && this.state.alertType === 'alert_new_user' ? (
					<div className={style.alert_bg}>
						<img
							className={style.closeImg}
							src={close}
							onClick={() => {
								this.setState({
									showAlert: false,
									type: ''
								});
							}}
						/>
						<img src={alert_new_user} className={style.alert_new_user} />
						<div>
							<img src={alert_btn_new_user} onClick={this.goRoute} className={style.alert_btn_new_user} />
						</div>
					</div>
				) : null}
				{this.state.showAlert && this.state.alertType === 'alert_10' ? (
					<div className={style.alert_bg}>
						<img
							className={[ style.closeImg, style.closeImg_10 ].join(' ')}
							src={close}
							onClick={() => {
								this.setState({
									showAlert: false,
									type: ''
								});
							}}
						/>
						<img src={alert_10} className={style.alert_10} />
						<div>
							<img src={alert_btn_shiyong} onClick={this.goRoute} className={style.alert_btn_shiyong} />
						</div>
					</div>
				) : null}
				{this.state.showAlert && this.state.alertType === 'alert_15' ? (
					<div className={style.alert_bg}>
						<img
							className={[ style.closeImg, style.closeImg_10 ].join(' ')}
							src={close}
							onClick={() => {
								this.setState({
									showAlert: false,
									type: ''
								});
							}}
						/>
						<img src={alert_15} className={style.alert_10} />
						<div>
							<img src={alert_btn_shiyong} onClick={this.goRoute} className={style.alert_btn_shiyong} />
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
