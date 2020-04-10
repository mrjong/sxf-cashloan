/*
 * @Author: shawn
 * @LastEditTime: 2020-03-26 14:38:20
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { store } from 'utils/store';
import Cookie from 'js-cookie';
import qs from 'qs';
import { getH5Channel } from 'utils/common';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { getDeviceType, activeConfigSts, recordContract } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { ButtonCustom, ProtocolRead } from 'components';
import { mpos_service_authorization } from 'utils/analytinsType';
import { Toast } from 'antd-mobile';
import { TFDLogin } from 'utils/getTongFuDun';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';

import { connect } from 'react-redux';
import { signup_mpos_auth, index_queryPLPShowSts } from 'fetch/api';
import logo from './img/logo.png';

let BtnDisabled = false;
let query = '';
@setBackGround('#fff')
@fetch.inject()
@connect(
	(state) => state,
	{ setUserInfoAction, setIframeProtocolShow }
)
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
		BtnDisabled = true;
		Toast.loading('加载中...', 10);
		this.props.$fetch
			.post(signup_mpos_auth, {
				imei: '',
				location: store.getPosition(), // 定位地址 TODO 从session取,
				loginType: '0',
				mac: '',
				osType: getDeviceType().toLowerCase(),
				registrationId: '',
				smsCode: '',
				smsFlag: '',
				tokenId: query.tokenId,
				userChannel: getH5Channel()
			})
			.then(
				(res) => {
					if (res.code === '000000') {
						buriedPointEvent(mpos_service_authorization.auth_btn);
						if (res.data.authSts === '1') {
							BtnDisabled = false;
							Toast.hide();
							this.props.history.replace(
								`/mpos/mpos_get_sms_page?tokenId=${query.tokenId}&mblNoHid=${query.mblNoHid}`
							);
						} else if (res.data.authSts === '0') {
							this.props.setUserInfoAction(res.data);
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
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
							// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
							TFDLogin();
							this.goHome();
						}
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
			)
			.catch(() => {
				BtnDisabled = false;
			});
	};
	// AB 测试
	goHome = () => {
		activeConfigSts({
			$props: this.props,
			type: 'A',
			callback: () => {
				BtnDisabled = false;
				getNextStatus({
					$props: this.props,
					actionType: 'mpos'
				});
			}
		});
	};

	// 跳转协议
	go = (url) => {
		this.props.setIframeProtocolShow({
			url
		});
	};

	// 点击勾选协议
	checkAgreement = () => {
		this.setState({ selectFlag: !this.state.selectFlag });
	};

	readContract = (item) => {
		this.go(item.url);
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
					<div className={styles.btn_box}>
						<ButtonCustom
							type={selectFlag && !BtnDisabled ? 'blue' : 'default'}
							onClick={selectFlag && !BtnDisabled ? () => this.goSubmit() : null}
						>
							授权并登录
						</ButtonCustom>
					</div>
					{query.mblNoHid && query.mblNoHid !== 'undefined' && query.mblNoHid.substr(-4) && (
						<p className={styles.bold_text}>
							还到将获取您尾号{query.mblNoHid && query.mblNoHid.substr(-4)}的手机号用于登录
						</p>
					)}
				</div>

				<div className={styles.agreement_box}>
					<ProtocolRead
						tip="点击授权并登录视为您阅读并同意签署"
						tipLast="。您同意授权获取信息（实名信息、注册手机号、商标编号及相关信息）。以上信息仅用于还到用户风险评估。"
						isSelect={selectFlag}
						offsetH="0.4rem"
						protocolList={[
							{
								label: '金融用户注册协议',
								url: 'register_agreement_page'
							},
							{
								label: '用户隐私权政策',
								url: 'user_privacy_page'
							}
						]}
						clickRadio={this.checkAgreement}
						clickProtocol={this.readContract}
						radioActiveBg="#4c7afd"
					/>
				</div>
			</div>
		);
	}
}
