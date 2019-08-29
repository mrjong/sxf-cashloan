import React, { PureComponent } from 'react';
import styles from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import { getDeviceType } from 'utils';
import qs from 'qs';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import click from '../mpos_service_authorization_page/img/Button.png';
const needDisplayOptions = ['basicInf'];
const API = {
	sendsms: '/cmm/sendsms',
	doAuth: '/authorize/doAuth',
	getStw: '/my/getStsw' // 获取4个认证项的状态(看基本信息是否认证)
};
@setBackGround('#fff')
@fetch.inject()
export default class mpos_get_sms_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			smsText: '获取验证码',
			timeflag: true,
			codeInput: '',
			query: {},
			smsJrnNo: ''
		};
	}
	componentWillMount() {
		const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		this.setState(
			{
				query
			},
			() => {
				this.getSms(60);
			}
		);
	}
	//获取验证码
	getSms(i) {
		this.props.$fetch
			.post(API.sendsms, {
				type: '5',
				authToken: this.state.query.tokenId
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
						// sa.login(res.userId);
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						this.requestGetStatus();
					} else {
						this.props.toast.info('授权失败', 3, () => {
							this.props.history.replace(
								`/login?tokenId=${this.state.query.tokenId}&mblNoHid=${this.state.query.mblNoHid}`
							);
						});
					}
				},
				(err) => {
					this.props.toast.info(err.msgInfo);
				}
			);
	}

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
		const { timeflag, smsText, query, codeInput } = this.state;

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
			</div>
		);
	}
}
