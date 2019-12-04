/*
 * @Author: shawn
 * @LastEditTime: 2019-12-03 18:49:28
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import qs from 'qs';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { getDeviceType, activeConfigSts, recordContract } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import SXFButton from 'components/ButtonCustom';
import { mpos_service_authorization } from 'utils/analytinsType';
import { Checkbox } from 'antd-mobile';
import { TFDLogin } from 'utils/getTongFuDun';

import logo from './img/logo.png';
const AgreeItem = Checkbox.AgreeItem;
const needDisplayOptions = ['basicInf'];
const API = {
	doAuth: '/authorize/doAuth',
	getStw: '/my/getStsw' // 获取4个认证项的状态(看基本信息是否认证)
};
let query = '';
@setBackGround('#fff')
@fetch.inject()
export default class mpos_service_authorization_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			selectFlag: true
		};
	}
	componentWillMount() {
		buriedPointEvent(mpos_service_authorization.auth_page);
		document.title = '随行付金融';
		query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
	}

	goSubmit = () => {
		this.props.$fetch
			.post(API.doAuth, {
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType(),
				authToken: query.tokenId
			})
			.then(
				(res) => {
					buriedPointEvent(mpos_service_authorization.auth_btn);
					// contractType 为协议类型 01为用户注册协议 02为用户隐私协议 03为用户协议绑卡,用户扣款委托书
					recordContract({
						contractType: '01,02'
					});
					if (res.authSts === '01') {
						console.log('发验证码');
						this.props.history.replace(
							`/mpos/mpos_get_sms_page?tokenId=${query.tokenId}&mblNoHid=${res.mblNoHid}`
						);
					} else if (res.authSts === '00') {
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						this.goHome();
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
								search: '?jumpToBase=true&entry=authorize'
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

	// 跳转协议
	go = (url) => {
		this.props.history.push(`/protocol/${url}`);
	};
	render() {
		const { selectFlag } = this.state;
		return (
			<div className={styles.mpos_service_authorization_page}>
				<img src={logo} alt="" className={styles.logoWrap} />
				<p className={styles.text}>
					随行付金融提供 <em className={styles.highlight}>借钱还信用卡</em>服务 <br /> 众多信用卡用户新选择{' '}
				</p>
				<div className={styles.btn_fixed}>
					<SXFButton
						className={selectFlag ? styles.smart_button : [styles.smart_button, styles.dis].join(' ')}
						onClick={selectFlag ? () => this.goSubmit() : null}
					>
						授权并登录
					</SXFButton>
					{query.mblNoHid && query.mblNoHid.substr(-4) && (
						<p className={styles.bold_text}>
							还到将获取您尾号{query.mblNoHid && query.mblNoHid.substr(-4)}的手机号用于登录
						</p>
					)}
				</div>
				<div className={styles.agreement_box}>
					<AgreeItem
						className="mpos_middle_checkbox"
						checked={selectFlag}
						data-seed="logId"
						onChange={(e) => this.setState({ selectFlag: e.target.checked })}
					>
						点击授权并登录视为您阅读并同意签署
						<a
							onClick={() => {
								this.go('register_agreement_page');
							}}
						>
							《金融用户注册协议》
						</a>
						<a
							onClick={() => {
								this.go('privacy_agreement_page');
							}}
						>
							《用户隐私权政策》
						</a>
						<span className="agreement_highlight">
							。您同意授权获取信息（实名信息、注册手机号、商标编号及相关信
							息）。以上信息仅用于还到用户风险评估。
						</span>
					</AgreeItem>
				</div>
			</div>
		);
	}
}
