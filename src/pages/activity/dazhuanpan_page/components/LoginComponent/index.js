import React, { Component } from 'react';
import { Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import style from './index.scss';
import { getDeviceType, getFirstError, validators, handleInputBlur } from 'utils';
import { getH5Channel } from 'utils/common';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import qs from 'qs';
import Cookie from 'js-cookie';

const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms'
};
let timmer;
@fetch.inject()
@createForm()
export default class LoginComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			smsText: '获取验证码',
			timeflag: true,
			smsJrnNo: '' // 短信流水号
		};
	}
	componentDidMount() {}
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
	//获取手机验证码
	getSms(i) {
		if (!this.getSmsCode(i)) {
			return;
		}
	}
	getSmsCode(i) {
		const osType = getDeviceType();
		this.props.form.validateFields((err, values) => {
			if (err && err.smsCd) {
				delete err.smsCd;
			}
			if (!err || JSON.stringify(err) === '{}') {
				// 发送验证码
				this.props.$fetch
					.post(API.sendsms, {
						type: '6',
						mblNo: values.phoneValue,
						osType
					})
					.then(
						(result) => {
							if (result.msgCode !== 'PTM0000') {
								this.props.toast.info(result.msgInfo);
								return;
							} else {
								this.props.toast.info('发送成功，请注意查收！');
								this.setState({ timeflag: false, smsJrnNo: result.data.smsJrnNo });
								timmer = setInterval(() => {
									this.setState({ flag: false, smsText: i-- + '"' });
									if (i === -1) {
										clearInterval(timmer);
										this.setState({ smsText: '重新获取', timeflag: true, flag: true });
									}
								}, 1000);
							}
						},
						(error) => {
							error.msgInfo && this.props.toast.info(error.msgInfo);
						}
					);
				return true;
			} else {
				this.props.toast.info(getFirstError(err));
			}
		});
	}
	// 确定去登陆按钮
	goLogin = () => {
		const { closeCb, refreshPageFn } = this.props;
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			this.props.toast.info('请先获取短信验证码');
			return;
		}
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.props.$fetch
					.post(API.smsForLogin, {
						mblNo: values.phoneValue, // 手机号
						smsJrnNo: this.state.smsJrnNo, // 短信流水号
						osType, // 操作系统
						smsCd: values.smsCd, // IP地址
						usrCnl: getH5Channel(), // 用户渠道
						location: store.getPosition() // 定位地址 TODO 从session取
					})
					.then(
						(res) => {
							if (res.msgCode !== 'PTM0000') {
								res.msgInfo && this.props.toast.info(res.msgInfo);
								return;
							}
							Cookie.set('fin-v-card-token', res.data.tokenId, { expires: 365 });

							// store.setToken(res.data.tokenId);

							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
							closeCb();
							refreshPageFn();
						},
						(error) => {
							error.msgInfo && this.props.toast.info(error.msgInfo);
						}
					);
			} else {
				this.props.toast.info(getFirstError(err));
			}
		});
	};
	render() {
		const { getFieldProps } = this.props.form;
		return (
			<div className={style.inputContent}>
				<div>
					{/* <input
							placeholder="请输入短信验证码"
							type="number"
							onChange={(e) => this.setState({ smsCd: e.target.value })}
						/> */}
					{/* <input
						type="text"
						disabled
						value={this.state.phoneValue}
						className={style.form_control}
						placeholder="请输入手机号码"
					/> */}
					<input
						maxLength={11}
						type="text"
						pattern="[0-9]*"
						// value={this.state.phoneValue}
						// onChange={(e) => {
						// 	if (isNaN(e.target.value) || e.target.value.length > 11) {
						// 		return;
						// 	}
						// 	this.setState({ phoneValue: e.target.value.replace(/\s+/g, '') });
						// }}
						{...getFieldProps('phoneValue', {
							rules: [{ required: true, message: '请输入正确手机号' }, { validator: this.validatePhone }]
						})}
						className={style.form_control}
						placeholder="请输入手机号码"
						onBlur={() => {
							handleInputBlur();
						}}
					/>
				</div>
				<div className={style.inputCode}>
					<input
						maxLength={6}
						type="text"
						pattern="[0-9]*"
						// value={this.state.smsCd}
						// onChange={(e) => {
						// 	if (isNaN(e.target.value) || e.target.value.length > 6) {
						// 		return;
						// 	}
						// 	this.setState({ smsCd: e.target.value.replace(/\s+/g, '') });
						// }}
						{...getFieldProps('smsCd', {
							rules: [{ required: true, message: '请输入正确验证码' }]
						})}
						className={style.form_control}
						placeholder="请输入短信验证码"
						onBlur={() => {
							handleInputBlur();
						}}
					/>
					<div className={!this.state.timeflag ? style.getCodeAct : style.getCode}>
						<Button
							size="small"
							onClick={() => {
								this.state.timeflag ? this.getSms(60) : '';
							}}
							type="primary"
						>
							{this.state.smsText}
						</Button>
					</div>
				</div>
				<div className={style.a_btn}>
					<Button size="small" onClick={this.goLogin} type="primary">
						确定
					</Button>
				</div>
			</div>
		);
	}
}
