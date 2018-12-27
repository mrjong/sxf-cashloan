import React, { Component } from 'react';
import { Button, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import style from './index.scss';
import { getDeviceType, getFirstError, isBugBrowser } from 'utils/common';
import { store } from 'utils/store';
import { validators } from 'utils/validator';
import fetch from 'sx-fetch';
import qs from 'qs';
import Cookie from 'js-cookie';
import { buriedPointEvent } from 'utils/Analytins';
import { activity_shuang12 } from 'utils/AnalytinsType';
import { handleInputBlur } from 'utils'

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
								Toast.info(result.msgInfo);
								return;
							} else {
								Toast.info('发送成功，请注意查收！');
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
							error.msgInfo && Toast.info(error.msgInfo);
						}
					);
				return true;
			} else {
				Toast.info(getFirstError(err));
			}
		});
	}
	// 确定去登陆按钮
	goLogin = () => {
		// 登录按钮
		buriedPointEvent(activity_shuang12.shuang12_login_click);
		const { closeCb, refreshPageFn } = this.props;
		const osType = getDeviceType();
		if (!this.state.smsJrnNo) {
			Toast.info('请先获取短信验证码');
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

							// TODO: 根据设备类型存储token
							if (isBugBrowser()) {
								store.setToken(res.data.tokenId);
							} else {
								store.setTokenSession(res.data.tokenId);
							}
							closeCb();
							refreshPageFn();
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
    onBlur = ()=>{
        handleInputBlur()
        console.log('222222222');
		// $('body').animate( {scrollTop: 0}, 500);
		handleInputBlur()
    }
	render() {
		const { getFieldProps } = this.props.form;
		return (
			<div className={style.inputContent}>
				<div>
					<input
						onBlur={this.onBlur}
						maxLength={11}
						type="text"
						pattern="[0-9]*"
						{...getFieldProps('phoneValue', {
							rules: [ { required: true, message: '请输入正确手机号' }, { validator: this.validatePhone } ]
						})}
						className={style.form_control}
						placeholder="请输入手机号码"
					/>
				</div>
				<div className={style.inputCode}>
					<input
                        maxLength={6}
                        onBlur={this.onBlur}
						type="text"
						pattern="[0-9]*"
						{...getFieldProps('smsCd', {
							rules: [ { required: true, message: '请输入正确验证码' } ]
						})}
						className={style.form_control}
						placeholder="请输入短信验证码"
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
						立即抽免息
					</Button>
				</div>
			</div>
		);
	}
}
