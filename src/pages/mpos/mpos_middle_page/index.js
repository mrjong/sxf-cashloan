/*
 * @Author: shawn
 * @LastEditTime: 2019-09-03 10:08:42
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
const API = {
	validateMposRelSts: '/authorize/validateMposRelSts',
	chkAuth: '/authorize/chkAuth'
};
let query = {};
@fetch.inject()
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
		if (query.appId && query.token) {
			this.props.$fetch
				.post(API.validateMposRelSts, {
					appid: query.appId,
					token: query.token
				})
				.then((res) => {
					if (res.msgCode === 'URM0000') {
						// entryType为入口类型，DC为贷款超市进入
						if (query && query.entryType === 'DC') {
							window.location.href = `${linkConf.DC_URL}&appId=${query.appId}&token=${query.token}`;
						} else {
							this.transition();
						}
					} else if (res.msgCode === 'URM9999') {
						this.props.toast.info(res.msgInfo);
					} else if (res.msgCode === 'PTM9000') {
						this.props.history.replace('/mpos/mpos_ioscontrol_page?entryType=ioscontrol');
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
	goHome = (res) => {
		// sa.login(res.userId);
		Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
		// TODO: 根据设备类型存储token
		store.setToken(res.loginToken);
		this.props.history.replace('/home/home');
	};
	transition = () => {
		this.props.$fetch
			.post(API.chkAuth, {
				mblNo: query.telNo,
				appId: query.appId,
				token: query.token,
				location: store.getPosition(), // 定位地址 TODO 从session取,
				osType: getDeviceType(),
				province: '',
				usrCnl: getH5Channel()
			})
			.then(
				(res) => {
					if (res.authFlag === '0') {
						this.props.history.replace(
							`/mpos/mpos_service_authorization_page?tokenId=${res.tokenId}&mblNoHid=${res.mblNoHid}`
						);
					} else if (res.authFlag === '1') {
						if (getH5Channel() === 'MPOS') {
							activeConfigSts({
								$props: this.props,
								type: 'A',
								callback: () => {
									this.this.goHome(res);
								}
							});
						} else {
							this.goHome(res);
						}
					} else {
						this.props.history.replace(`/login?tokenId=${res.tokenId}&mblNoHid=${res.mblNoHid}`);
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
