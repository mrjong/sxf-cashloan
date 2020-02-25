/*
 * @Author: shawn
 * @LastEditTime: 2020-02-24 16:46:34
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import { createForm } from 'rc-form';

import { getDeviceType, getFirstError, activeConfigSts, recordContract } from 'utils';
import ImageCode from 'components/ImageCode';
import qs from 'qs';
import { Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import { SxfDataRegisterEventSuperPropertiesOnce } from 'utils/analytins';
import { setBackGround } from 'utils/background';
import click from '../mpos_service_authorization_page/img/Button.png';

import { TFDLogin } from 'utils/getTongFuDun';
import { msg_slide, msg_sms, signup_sms, signup_mpos_auth, index_queryPLPShowSts } from 'fetch/api';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { getH5Channel } from 'utils/common';
let timmer = '';
let query = {};
@setBackGround('#fff')
@createForm()
@fetch.inject()
export default class mpos_get_sms_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			timers: '获取验证码',
			countDownTime: 59,
			timeflag: true,
			codeInput: '',
			smsJrnNo: '',
			showSlideModal: false,
			relyToken: ''
		};
	}
	componentWillMount() {
		query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		this.handleSmsCodeClick();
	}

	/**华丽的分割线 */
	// 获取滑动验证码token并发短信
	handleTokenAndSms = () => {
		this.refreshSlideToken().then(() => {
			this.sendSlideVerifySmsCode();
		});
	};

	// 获取滑动验证码token并获取大图
	handleTokenAndImage = () => {
		this.refreshSlideToken();
	};

	// 刷新滑动验证码token
	refreshSlideToken = () => {
		return new Promise((resolve) => {
			const osType = getDeviceType();
			Toast.loading('加载中...', 10);

			this.props.$fetch.get(`${msg_slide}/${query.tokenId}`).then((result) => {
				if (result.code === '000003' && result.data && result.data.tokenId) {
					this.setState({
						relyToken: (result && result.data && result.data.tokenId) || '',
						submitData: {
							mblNo: this.state.mobilePhone,
							osType,
							bFlag: '',
							type: '5'
						}
					});
					resolve();
				} else if (result.code === '000000') {
					Toast.hide();
					this.setState({
						relyToken: result.data.tokenId,
						slideImageUrl: result.data.backImage,
						smallImageUrl: result.data.sliderImage,
						yOffset: result.data.sliderHeight, // 小图距离大图顶部距离
						bigImageH: result.data.backHeight, // 大图实际高度
						showSlideModal: true
					});
				} else {
					Toast.info(result.message);
				}
			});
		});
	};

	// 获取短信(滑动验证码)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		const data = {
			slideDistance: xOffset,
			tokenId: this.state.relyToken,
			type: '6'
		};
		this.props.$fetch
			.post(msg_sms, data)
			.then((result) => {
				this.setState({
					// 去掉错误显示
					errMsg: ''
				});
				if (result.code === '000000') {
					Toast.info('发送成功，请注意查收！');
					this.setState({
						timeflag: false,
						smsJrnNo: result.data.tokenId
					});
					cb && cb('success');
					setTimeout(() => {
						this.closeSlideModal();
					}, 1500);

					this.startCountDownTime();
				} else if (result.code === '000006') {
					// 弹窗不存在时请求大图
					!this.state.showSlideModal && this.handleTokenAndImage();
					cb && cb('error');
				} else if (result.code === '000004') {
					//重新刷新relyToken
					this.handleTokenAndImage();
					cb && cb('refresh');
				} else {
					// 达到短信次数限制
					if (xOffset) {
						Toast.info(result.message);
					} else {
						this.setState({
							errMsg: result.message
						});
					}
					cb && cb('error');
					this.closeSlideModal();
				}
			})
			.catch(() => {
				cb && cb('error');
				this.closeSlideModal();
			});
	};

	goSubmit = () => {
		let { codeInput } = this.state;
		if (!codeInput) {
			this.props.toast.info('请输入验证码');
			return;
		}
		if (!/^\d{6}$/.test(codeInput)) {
			this.props.toast.info('验证码输入不正确');
			return;
		}
		this.props.$fetch
			.post(signup_mpos_auth, {
				imei: '',
				location: store.getPosition(), // 定位地址 TODO 从session取,
				loginType: '0',
				mac: '',
				osType: getDeviceType().toLowerCase(),
				registrationId: '',
				smsCode: codeInput,
				smsFlag: 'Y',
				tokenId: query.tokenId,
				userChannel: getH5Channel()
			})
			.then(
				(res) => {
					if (res.code === '000000') {
						if (res.data.authSts === '1') {
							this.handleSmsCodeClick();
						} else if (res.data.authSts === '0') {
							this.props.setUserInfoAction(res.data);
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
							// contractType 为协议类型 01为用户注册协议 02为用户隐私协议 03为用户协议绑卡,用户扣款委托书
							recordContract({
								contractType: '01,02'
							});
							// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
							TFDLogin();
							this.goHome();
						}
					} else if (res.code === '000009') {
						this.props.toast.info(res.message);
					} else {
						this.props.toast.info('授权失败', 3, () => {
							// token和手机号取chkAuth的
							this.props.history.replace(`/login?tokenId=${query.tokenId}&mblNoHid=${query.mblNoHid}`);
						});
					}
				},
				(err) => {
					this.props.toast.info(err.msgInfo);
				}
			);
	};

	showSlideModal = () => {
		this.setState({ showSlideModal: true });
	};

	closeSlideModal = () => {
		this.setState({ showSlideModal: false });
	};
	/**华丽的分割线 */

	//去登陆按钮
	goLogin = () => {
		if (!this.validateFn()) {
			return;
		}
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			// Toast.info('请先获取短信验证码');
			this.setState({
				errMsg: '请先获取短信验证码'
			});
			return;
		}
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.setState({
					errMsg: ''
				});
				// 埋点-注册登录页一键代还
				let param = {
					tokenId: this.state.relyToken, // 短信流水号
					osType: osType.toLowerCase(), // 操作系统
					loginType: '0',
					smsCode: values.smsCd,
					imei: '',
					mac: '',
					registrationId: '',
					userChannel: getH5Channel(), // 用户渠道
					location: store.getPosition() // 定位地址 TODO 从session取
				};
				Toast.loading('加载中...', 10);
				this.props.$fetch.post(signup_sms, param).then(
					(res) => {
						if (res.code !== '000000') {
							Toast.hide();
							this.setState({
								errMsg: res.message
							});
							return;
						}
						this.setState({
							errMsg: ''
						});
						this.props.setUserInfoAction(res.data);
						Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.data.tokenId);
						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						SxfDataRegisterEventSuperPropertiesOnce({ gps: store.getPosition() });
						// contractType 为协议类型 01为用户注册协议 02为用户隐私协议 03为用户协议绑卡,用户扣款委托书
						this.props.$fetch.get(index_queryPLPShowSts).then((res) => {
							if (res.code === '000000' && res.data && res.data.plpSts === '1') {
								recordContract({
									contractType: '01'
								});
							} else {
								recordContract({
									contractType: '01,02'
								});
							}
						});
						if (this.state.disabledInput) {
							this.goFLHome();
						} else {
							this.goHome();
						}
					},
					(error) => {
						error.message &&
							this.setState({
								errMsg: error.message
							});
					}
				);
			} else {
				this.setState({
					errMsg: getFirstError(err)
				});
			}
		});
	};
	// 开始倒计时
	startCountDownTime = () => {
		clearInterval(timmer);
		let { countDownTime } = this.state;
		timmer = setInterval(() => {
			this.setState(
				{
					timers: countDownTime-- + 's'
				},
				() => {
					if (countDownTime === -1) {
						clearInterval(timmer);
						this.setState({ timers: '重新获取', timeflag: true, countDownTime: 59 });
					}
				}
			);
		}, 1000);
	};

	// 处理获取验证码按钮点击事件
	handleSmsCodeClick = () => {
		if (!this.state.timeflag) return;
		this.getSmsCode();
	};

	// 获得手机验证码
	getSmsCode() {
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				this.setState({
					errMsg: ''
				});
				// 埋点-登录页获取验证码
				this.setState(
					{
						mobilePhone: values.phoneValue
					},
					() => {
						this.handleTokenAndSms();
					}
				);
			} else {
				this.setState({
					errMsg: getFirstError(err)
				});
				// Toast.info(getFirstError(err));
			}
		});
	}
	// AB 测试
	goHome = () => {
		activeConfigSts({
			$props: this.props,
			type: 'A',
			callback: () => {
				getNextStatus({
					$props: this.props,
					actionType: 'mpos'
				});
			}
		});
	};

	render() {
		const {
			slideImageUrl,
			smallImageUrl,
			showSlideModal,
			yOffset,
			timeflag,
			bigImageH,
			codeInput
		} = this.state;

		return (
			<div className={styles.allContainer}>
				<div className={styles.title}>请点击获取发送验证短信(免费)到</div>
				<div className={styles.desc}>{query.mblNoHid}</div>
				<div className={styles.inputItem}>
					<input
						placeholder="请输入短信验证码"
						type="number"
						onChange={(e) => this.setState({ codeInput: e.target.value })}
					/>
					<div
						className={timeflag ? styles.getCodeAct : styles.getCode}
						onClick={() => {
							this.handleSmsCodeClick();
						}}
					>
						{this.state.timers}
					</div>
				</div>
				<div
					className={styles.clickSms}
					onClick={() => {
						this.goSubmit(codeInput);
					}}
				>
					<img src={click} className={styles.icon} />
					<div className={styles.agreen}>登录</div>
				</div>
				{showSlideModal && (
					<ImageCode
						imageUrl={slideImageUrl}
						smallImageUrl={smallImageUrl}
						yOffset={yOffset}
						bigImageH={bigImageH}
						onReload={this.handleTokenAndImage}
						onMoveEnd={(xOffset, cb) => {
							this.sendSlideVerifySmsCode(xOffset, cb);
						}}
						onClose={this.closeSlideModal}
					/>
				)}
			</div>
		);
	}
}
