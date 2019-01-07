import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import Blanks from 'components/Blank';
import { setH5Channel, getH5Channel, getDeviceType } from 'utils';

const API = {
	validateMposRelSts: '/cmm/validateMposRelSts'
};
@fetch.inject()
export default class wx_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}
	componentWillMount() {
		this.validateMposRelSts();
	}
	validateMposRelSts = () => {
		// // 移除notice是否显示的标记
		// store.removeShowNotice();
		const query = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.props.$fetch
			.post(APi.validateMposRelSts, {
				appid: query.appId,
				token: query.token
			})
			.then((res) => {
				if (res.msgCode == 'URM0000') {
					this.transition();
				} else if (res.msgCode == 'URM9999') {
					this.props.toast.info(res.msgInfo);
				} else if (res.msgCode == 'PTM9000') {
					this.props.history.replace('/ioscontrol');
				} else {
					this.setState({ showBoundle: true });
				}
			})
			.catch((err) => {
				this.setState({
					errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
				});
				console.log(err);
			});
	};
	transition = () => {
		const u = navigator.userAgent;
		const osType =
			u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
				? 'ANDRIOD'
				: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ? 'IOS' : 'PC';
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		this.props.$fetch
			.post('/authorize/chkAuth', {
				mblNo: query.telNo,
				appId: query.appId,
				token: query.token,
				location: this.props.locationAddress ? this.props.locationAddress : '-1,-1',
				osType: osType,
				province: '',
				usrCnl: sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : ''
			})
			.then(
				(res) => {
					sessionStorage.setItem('mblNoHidAuth', res.mblNoHid);
					if (res.whiteFlag === '0') {
						this.props.init('showWhiteFlag', true);
						// this.setState({showBoundle: true})
					}
					if (res.whiteFlag !== '0') {
						this.props.init('showWhiteFlag', false);
						// this.setState({showBoundle: true})
					}
					if (res.authFlag === '0') {
						// sessionStorage.setItem('mblNoHid',res.mblNoHid)
						this.props.history.replace('/serviceAuthorization');
					} else if (res.authFlag === '1') {
						// sa.login(res.userId);
						sessionStorage.setItem('tokenId', res.loginToken);
						sessionStorage.setItem('userId', res.userId);
						this.props.history.replace('/home');
					} else {
						this.props.history.replace('/login');
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
		return <Blanks errorInf={this.state.errorInf} />;
	}
}
