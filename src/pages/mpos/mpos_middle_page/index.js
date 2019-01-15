import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import Blanks from 'components/Blank';
import { getDeviceType, getH5Channel } from 'utils';
import Alert_mpos from '../mpos_no_realname_alert_page';
const API = {
	validateMposRelSts: '/authorize/validateMposRelSts',
	chkAuth: '/authorize/chkAuth'
};
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
		this.validateMposRelSts();
	}
	validateMposRelSts = () => {
		// // 移除notice是否显示的标记
		// store.removeShowNotice();
		const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		this.props.$fetch
			.post(API.validateMposRelSts, {
				appid: query.appId,
				token: query.token
			})
			.then((res) => {
				if (res.msgCode === 'URM0000') {
					this.transition();
				} else if (res.msgCode === 'URM9999') {
					this.props.toast.info(res.msgInfo);
				} else if (res.msgCode === 'PTM9000') {
					this.props.history.replace('/mpos/mpos_ioscontrol_page');
				} else {
					this.setState({ showBoundle: true });
				}
			})
			.catch((err) => {
				this.setState({
					errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
				});
			});
	};
	transition = () => {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
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
						// sa.login(res.userId);
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						this.props.history.replace('/home/home');
					} else {
						this.props.history.replace(`/login?tokenId=${res.tokenId}&mblNoHid=${res.mblNoHid}`);
					}
				},
				(err) => {
					this.setState({
						errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
					console.log(err);
				}
			)
			.catch((err) => {
				this.setState({
					errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
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