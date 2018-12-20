import qs from 'qs';
import { address } from 'utils/Address';
import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { Toast, InputItem } from 'antd-mobile';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { getDeviceType, getFirstError, isBugBrowser, changeHistoryState, isWXOpen } from 'utils/common';
import { validators } from 'utils/validator';
import { buriedPointEvent, pageView } from 'utils/Analytins';
import { login } from 'utils/AnalytinsType';
import styles from './index.scss';
import bannerImg from './img/login_bg.png';
import { handleInputBlur } from 'utils'
let timmer;
const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms'
};

@fetch.inject()
@createForm()
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '获取验证码',
			timeflag: true,
			flag: true,
			smsJrnNo: '' // 短信流水号
		};
	}

	componentWillMount() {
		// 登录页单独处理
		window.history.pushState(null, null, document.URL);
		document.title = '登录和注册';
		// 保存h5Channel变量
		const query = qs.parse(window.location.search, {
			ignoreQueryPrefix: true
		});
		const ua = window.navigator.userAgent;
		const sessionH5Channel = localStorage.getItem('h5Channel');

		// 移除cookie
		Cookie.remove('fin-v-card-token');
		sessionStorage.clear();
		localStorage.clear();

		// 重新添加h5Channel到session里
		if (query.h5Channel) {
			localStorage.setItem('h5Channel', query.h5Channel);
		} else if (sessionH5Channel) {
			localStorage.setItem('h5Channel', sessionH5Channel);
		} else if (/SuiXingPay-Mpos/i.test(ua)) {
			localStorage.setItem('h5Channel', 'MPOS');
		} else {
			localStorage.setItem('h5Channel', 'other');
		}

		store.setHistoryRouter(window.location.pathname);

		this.props.form.getFieldProps('phoneValue');
		this.props.form.setFieldsValue({
			phoneValue: ''
		});
	}
	componentDidMount() {
		// 获取地址
		address();
		pageView();
	}

	componentWillUnmount() {
		clearInterval(timmer);
	}

	// 校验手机号
	validatePhone = (rule, value, callback) => {
		if (!validators.phone(value)) {
			callback('请输入正确手机号');
		} else {
			callback();
		}
	};

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
				buriedPointEvent(login.submit);
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

							// store.setToken(res.data.tokenId);

							// TODO: 根据设备类型存储token
							if (isBugBrowser()) {
								store.setToken(res.data.tokenId);
							} else {
								store.setTokenSession(res.data.tokenId);
							}
							if (isWXOpen()) {
								// this.props.history.goBack();
								this.props.history.push('/home/home');
							} else {
								this.props.history.push('/home/home');
							}
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
				buriedPointEvent(login.getCode);
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
	// 跳转协议
	go = (url) => {
		store.setLoginBack(true);
		this.props.history.push(`/protocol/${url}`);
	};

	// 处理键盘挡住输入框
	handleScrollToView = (id) => {
		this.refs.loginWrap.scrollTop = this.refs.loginContent.offsetHeight;
		setTimeout(() => {
			this.refs.loginWrap.scrollTop = this.refs.loginContent.offsetHeight;
			document.getElementById(id).focus();
		}, 100);
	};

	render() {
		const { getFieldProps } = this.props.form;
		return (
			//   <div ref="loginWrap" className={style.loginContent}>
			//     <div ref="loginContent" className={style.loginLog}>
			//       <div className={style.centent}>
			//         <InputItem
			//           id="inputPhone"
			//           onFocus={() => { this.handleScrollToView('inputPhone') }}
			//           maxLength="11"
			//           type="number"
			//           className={style.loginInput}
			//           placeholder='请输入您的手机号'
			//           {...getFieldProps('phoneValue', {
			//             rules: [
			//               { required: true, message: '请输入正确手机号' },
			//               { validator: this.validatePhone },
			//             ],
			//           })}
			//         />
			//         <InputItem
			//           id="inputCode"
			//           onFocus={() => { this.handleScrollToView('inputCode') }}
			//           type="number"
			//           maxLength="6"
			//           className={style.loginInput}
			//           placeholder="请输入短信验证码"
			//           {...getFieldProps('smsCd', {
			//             rules: [
			//               { required: true, message: '请输入正确验证码' },
			//             ],
			//           })}
			//         />
			//         <div className={this.state.flag ? style.smsCode : style.smsCodeNumber} onClick={() => {
			//           this.state.timeflag ? this.getTime(59) : '';
			//         }}>
			//           {this.state.timers}
			//         </div>
			//         <div style={{ clear: 'both' }} />
			//         <div className={style.sureBtn} onClick={this.goLogin}>一键代还</div>

			//         <div className={style.agreement}>
			//           注册即视为同意
			//           <span onClick={() => { this.go('register_agreement_page') }}>
			//             《随行付金融用户注册协议》
			//           </span>
			//           <span onClick={() => { this.go('privacy_agreement_page') }}>
			//             《随行付用户隐私权政策》
			//           </span>
			//         </div>
			//       </div>
			//     </div>
			//   </div>
			<div ref="loginWrap" className={styles.dc_landing_page}>
				<img className={styles.banner} src={bannerImg} alt="落地页banner" />
				<div ref="loginContent" className={styles.content}>
					<InputItem
						id="inputPhone"
						maxLength="11"
                        type="number"
                        onFocus={() => { this.handleScrollToView('inputPhone') }}
						className={styles.loginInput}
						placeholder="请输入您的手机号"
						{...getFieldProps('phoneValue', {
							rules: [ { required: true, message: '请输入正确手机号' }, { validator: this.validatePhone } ]
						})}
					/>
					<div className={styles.smsBox}>
						<InputItem
							id="inputCode"
                            type="number"
                            onFocus={() => { this.handleScrollToView('inputCode') }}
							maxLength="6"
							className={styles.loginInput}
							placeholder="请输入短信验证码"
							{...getFieldProps('smsCd', {
								rules: [ { required: true, message: '请输入正确验证码' } ]
							})}
						/>
						<div
							className={this.state.flag ? styles.smsCode : styles.smsCodeNumber}
							onClick={() => {
								this.state.timeflag ? this.getTime(59) : '';
							}}
						>
							{this.state.timers}
						</div>
					</div>
					<div className={styles.sureBtn} onClick={this.goLogin}>
						<span>免费借款</span>
					</div>
					<div className={styles.agreement}>
						注册即视为同意
						<span
							onClick={() => {
								this.go('register_agreement_page');
							}}
						>
							《用户注册协议》
						</span>
						<span
							onClick={() => {
								this.go('privacy_agreement_page');
							}}
						>
							《用户隐私权政策》
						</span>
					</div>
				</div>
			</div>
		);
	}
}
