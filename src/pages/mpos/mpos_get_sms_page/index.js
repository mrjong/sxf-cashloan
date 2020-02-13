/*
 * @Author: shawn
 * @LastEditTime : 2020-02-13 16:38:51
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import { getDeviceType, activeConfigSts } from 'utils';
import qs from 'qs';
import { Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import click from '../mpos_service_authorization_page/img/Button.png';

import { TFDLogin } from 'utils/getTongFuDun';
import { msg_slide, msg_sms } from 'fetch/api';
const needDisplayOptions = ['basicInf'];
const API = {
	sendsms: '/cmm/sendsms',
	doAuth: '/authorize/doAuth',
	getStw: '/my/getStsw' // 获取4个认证项的状态(看基本信息是否认证)
};
let query = {};
@setBackGround('#fff')
@fetch.inject()
export default class mpos_get_sms_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			smsText: '获取验证码',
			timeflag: true,
			codeInput: '',
      smsJrnNo: '',
      showSlideModal: false,
			relyToken: ''
		};
	}
	componentWillMount() {
		query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		this.msg_slide_func();
	}
	msg_slide_func = () => {
		this.props.$fetch.get(`${msg_slide}/${query.tokenId}`).then((result) => {
			if (result.code === '000003' && result.data && result.data.tokenId) {
				this.setState(
					{
						relyToken: result.data.tokenId
					},
					() => {
						this.sendSlideVerifySmsCode();
					}
				);
			}
		});
	};

	// 获取短信(滑动验证码)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		// let data = Object.assign({}, this.state.submitData, {
		// 	bFlag: xOffset,
		// 	aFlag: (this.state.yOffset * 2) / 3
		// });
		const data = {
			slideDistance: this.bFlag,
			tokenId: this.state.relyToken,
			type: '5'
		};
		this.props.$fetch
			.post(msg_sms, data)
			.then((result) => {
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
					!this.state.showSlideModal && this.reloadSlideImage();
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

	// 获取短信(滑动验证码)
	sendSlideVerifySmsCode = (xOffset = '', cb) => {
		// let data = Object.assign({}, this.state.submitData, {
		// 	bFlag: xOffset,
		// 	aFlag: (this.state.yOffset * 2) / 3
		// });
		const data = {
			slideDistance: this.bFlag,
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
					!this.state.showSlideModal && this.reloadSlideImage();
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

	//获取验证码
	getSms(i) {
		this.props.$fetch
			.post(API.sendsms, {
				type: '5',
				authToken: query.tokenId
			})
			.then(
				(result) => {
					if (result.msgCode === 'PTM0000') {
						this.setState({
							smsJrnNo: result.data.smsJrnNo
						});
						let timmer = setInterval(() => {
							this.setState({ smsText: i-- + '"', timeflag: false });
							if (i === -1) {
								clearInterval(timmer);
								this.setState({ smsText: '重新获取', timeflag: true });
							}
						}, 1000);
						this.props.toast.info('发送成功，请注意查收！');
					} else {
						this.props.toast.info(result.msgInfo);
					}
				},
				(err) => {
					console.log(err);
				}
			);
	}
	//登录判断
	goSubmit() {
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
			.post(API.doAuth, {
				authToken: this.state.query.tokenId,
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType(),
				smsCd: codeInput,
				smsJrnNo: this.state.smsJrnNo,
				smsFlg: 'Y'
			})
			.then(
				(res) => {
					if (res.authSts === '00') {
						Cookie.set('FIN-HD-AUTH-TOKEN', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						this.goHome();
					} else {
						this.props.toast.info('授权失败', 3, () => {
							this.props.history.replace(`/login?tokenId=${query.tokenId}&mblNoHid=${query.mblNoHid}`);
						});
					}
				},
				(err) => {
					this.props.toast.info(err.msgInfo);
				}
			);
	}
	// AB 测试
	goHome = () => {
		activeConfigSts({
			$props: this.props,
			type: 'A',
			callback: this.requestGetStatus
		});
	};
	// 获取授信列表状态
	requestGetStatus = () => {
		this.props.$fetch
			.get(`${API.getStw}`)
			.then((result) => {
				if (result && result.data !== null && result.msgCode === 'PTM0000') {
					const stswData =
						result.data.length && result.data.filter((item) => needDisplayOptions.includes(item.code));
					if (stswData && stswData.length) {
						// case '0': // 未认证
						// case '1': // 认证中
						// case '2': // 认证成功
						// case '3': // 认证失败
						// case '4': // 认证过期
						if (stswData[0].stsw.dicDetailCd === '0') {
							this.props.history.replace({
								pathname: '/home/essential_information',
								search: '?jumpToBase=true&entry=sms'
							});
						} else {
							this.props.history.replace('/home/home');
						}
					}
				} else {
					this.props.toast.info(result.msgInfo, 2, () => {
						this.props.history.replace('/home/home');
					});
				}
			})
			.catch(() => {
				this.props.history.replace('/home/home');
			});
	};
	render() {
		const { timeflag, smsText, codeInput,showSlideModal } = this.state;

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
							timeflag ? this.getSms(59) : '';
						}}
					>
						{smsText}
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
				{showDownloadModal && (
					<Modal wrapClassName="loginModalBox" visible={true} transparent maskClosable={false}>
						<div className={styles.loginModalContainer}>
							{/* 大图 */}
							<img className={styles.loginModalBg} src={loginModalBg} alt="背景" />
							{/* 按钮 */}
							<img
								className={styles.loginModalBtn}
								src={loginModalBtn}
								onClick={() => {
									this.downloadApp();
								}}
								alt="按钮"
							/>
							{/* 关闭 */}
							<img
								className={styles.closeIcoStyle}
								src={closeIco}
								onClick={this.closeDownLoadModal}
								alt="关闭"
							/>
						</div>
					</Modal>
				)}
			</div>
		);
	}
			</div>
		);
	}
}
