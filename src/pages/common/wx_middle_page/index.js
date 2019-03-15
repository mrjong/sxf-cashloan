import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import Blanks from 'components/Blank';
import { getDeviceType } from 'utils';
import { setH5Channel, getH5Channel } from 'utils/common';

const API = {
	wxAuthcb: '/wx/authcb',
	wxAuth: '/wx/auth',
	isAccessLogin: '/gateway/anydoor' // 是否有登录的权限
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
		// 移除cookie中的token
		Cookie.remove('fin-v-card-token');
		// 从url截取数据
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const osType = getDeviceType();
		// if (query && query.h5Channel) {
		// 	// localStorage.setItem('h5Channel', query.h5Channel);
		// 	store.setH5Channel(query.h5Channel)
		// }
		setH5Channel();
		if (query && query.code) {
			this.props.$fetch
				.post(API.wxAuthcb, {
					state: query.state,
					code: query.code,
					channelCode: getH5Channel(),
					osType: osType
				})
				.then((res) => {
					if (res.msgCode == 'WX0000' || res.msgCode == 'URM0100') {
						//请求成功,跳到登录页(前提是不存在已登录未注册的情况)
						console.log(res);
						// this.props.history.replace('/login')
						this.jumpRouter();
					} else if (res.msgCode == 'WX0100') {
						// 已授权不需要登陆
						Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 }); // 微信授权token
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						// localStorage.setItem('authorizedNotLoginStats', 'true')
						// this.props.history.replace('/home/home')
						this.jumpRouter();
					} else {
						this.props.toast.info(res.msgInfo); //请求失败,弹出请求失败信息
					}
				})
				.catch((err) => {
					console.log(err);
					this.setState({
						errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		} else {
			this.props.$fetch
				.post(API.wxAuth, {
					channelCode: getH5Channel(),
					redirectUrl: encodeURIComponent(window.location.href),
					osType: osType
				})
				.then((res) => {
					if (query.jumpUrl) {
						// 登陆的token
						store.setJumpUrl(query.jumpUrl);
					}
					if (res.msgCode == 'WX0101') {
						//没有授权
						console.log(res);
						console.log(res.url);
						Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 });
						window.location.href = decodeURIComponent(res.url);
					} else if (res.msgCode == 'WX0102' || res.msgCode == 'URM0100') {
						//已授权未登录 (静默授权为7天，7天后过期）
						// this.props.history.replace('/home/home')
						this.jumpRouter();
					} else if (res.msgCode == 'WX0100') {
						//已授权已登录
						Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.loginToken);
						// localStorage.setItem('authorizedNotLoginStats', 'true')
						if (query.url) {
							window.location.href = query.url;
						} else {
							// this.props.history.replace('/home/home')
							this.jumpRouter();
						}
					} else {
						this.props.toast.info(res.msgInfo);
					}
				})
				.catch((err) => {
					console.log(err);
					this.setState({
						errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		}
	}
	// 跳转路由判断
	jumpRouter = () => {
		// 登陆的token
		let jumpUrl = store.getJumpUrl();
		this.removeJumpRouter();
		if (jumpUrl) {
			this.props.history.replace(jumpUrl);
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
