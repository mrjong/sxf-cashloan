/*
 * @Author: shawn
 * @LastEditTime : 2020-02-13 16:16:23
 */
import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import Blanks from 'components/Blank';
import { getDeviceType, activeConfigSts } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import { getH5Channel } from 'utils/common';
import { address } from 'utils/Address';
import Alert_mpos from '../mpos_no_realname_alert_page';
import linkConf from 'config/link.conf';
import { TFDLogin } from 'utils/getTongFuDun';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { signup_mpos_validate, signup_mpos_check } from 'fetch/api';
import { connect } from 'react-redux';

let query = {};
@fetch.inject()
@connect(
	(state) => state,
	{ setUserInfoAction }
)
export default class mpos_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: '',
			showBoundle: false
		};
	}
	componentWillMount() {
		address();
		this.validateMposRelSts();
	}
	validateMposRelSts = () => {
		// // 移除notice是否显示的标记
		// store.removeShowNotice();
		query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		if (query.h5Channel) {
			buriedPointEvent(activity.MposH5Channel, {
				h5Channel: query.h5Channel
			});
		}
		const osType = getDeviceType();
		if (query.appId && query.token) {
			this.props.$fetch
				.post(signup_mpos_validate, {
					appId: query.appId,
					token: query.token,
					location: store.getPosition(),
					loginType: '0',
					mac: '',
					imei: '',
					osType: osType.toLowerCase(), // 操作系统
					registrationId: '',
					userChannel: getH5Channel()
				})
				.then((res) => {
					if (res.code === '000000') {
						// entryType为入口类型，DC为贷款超市进入
						if (query && query.entryType === 'DC') {
							window.location.href = `${linkConf.DC_URL}&appId=${query.appId}&token=${query.token}`;
						} else {
							this.transition();
						}
					} else if (res.code === '999999') {
						if (window.globalConfig && window.globalConfig.wxTest) {
							this.props.history.replace('/outer_mpos_login?wxTestFrom=mpos&h5Channel=MPOS-fjj');
						} else {
							this.props.history.replace('/mpos/mpos_ioscontrol_page?entryType=ioscontrol');
						}
					} else {
						this.setState({ showBoundle: true });
					}
				})
				.catch(() => {
					this.setState({
						errorInf:
							'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		} else {
			this.setState({ showBoundle: true });
		}
	};
	goHome = () => {
		this.props.history.replace('/home/home');
	};
	transition = () => {
		this.props.$fetch
			.post(signup_mpos_check, {
				telNoCpt: query.telNo || '1',
				imei: '',
				mac: '',
				loginType: '0',
				appId: query.appId,
				token: query.token,
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType().toLowerCase(),
				userChannel: getH5Channel()
			})
			.then(
				(res) => {
					if (res.code === '000000') {
						if (res.data.authFlag === '1') {
							this.props.setUserInfoAction(res.data);
							Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
							// TODO: 根据设备类型存储token
							store.setToken(res.data.tokenId);
							// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
							TFDLogin();
							activeConfigSts({
								$props: this.props,
								type: 'A',
								callback: this.goHome
							});
						} else if (res.data.authFlag === '0')
							this.props.history.replace(
								`/mpos/mpos_service_authorization_page?tokenId=${res.data.tokenId}&mblNoHid=${res.data.telNoHid}`
							);
					} else {
						this.props.history.replace(`/login?tokenId=${res.data.tokenId}&mblNoHid=${res.data.telNoHid}`);
					}
				},
				(err) => {
					this.setState({
						errorInf:
							'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
					console.log(err);
				}
			)
			.catch((err) => {
				this.setState({
					errorInf:
						'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
				});
				console.log(err);
			});
	};
	// 跳转路由判断
	jumpRouter = () => {
		// 登陆的token
		let jumpUrl = store.getJumpUrl();
		this.removeJumpRouter();
		if (jumpUrl) {
			this.props.history.push(jumpUrl);
		} else {
			this.props.history.replace('/home/home'); //微信授权成功调到登录页
		}
	};
	removeJumpRouter = () => {
		store.removeJumpUrl();
	};
	render() {
		return <div>{this.state.showBoundle ? <Alert_mpos /> : <Blanks errorInf={this.state.errorInf} />}</div>;
	}
}
