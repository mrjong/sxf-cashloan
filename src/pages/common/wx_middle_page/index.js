import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { isBugBrowser } from 'utils/common';

const API = {
  isAccessLogin: '/gateway/anydoor', // 是否有登录的权限
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
		// 移除session里存储的跳转url
		if (isBugBrowser()) { // 登陆的token
			store.removeJumpUrl();
		} else {
			store.removeJumpUrlSession();
		}
		// 从url截取数据
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const u = navigator.userAgent;
		const osType = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 ? 'ANDRIOD' : !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ? 'IOS' : 'PC';
        if(query&&query.h5Channel){
		sessionStorage.setItem('h5Channel', query.h5Channel)
        }
        if (query && query.code) {
			this.props.$fetch.post(`/wx/authcb`, {
				state: query.state,
				code: query.code,
				channelCode: sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : '',
				osType: osType,
			}).then(res => {
				if (res.msgCode == 'WX0000' || res.msgCode == 'URM0100') {                            //请求成功,跳到登录页(前提是不存在已登录未注册的情况)
					console.log(res)
					// this.props.history.replace('/login')
					this.jumpRouter();
				} else if (res.msgCode == 'WX0100') { // 已授权不需要登陆
          Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 }); // 微信授权token
					Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
					// TODO: 根据设备类型存储token
					if (isBugBrowser()) { // 登陆的token
						store.setToken(res.loginToken);
					} else {
						store.setTokenSession(res.loginToken);
					}
					// sessionStorage.setItem('authorizedNotLoginStats', 'true')
					// this.props.history.replace('/home/home')
					this.jumpRouter();

				} else {
					this.props.toast.info(res.msgInfo); //请求失败,弹出请求失败信息
				}
			})
		}
		else {
			this.props.$fetch.post('/wx/auth', {

				channelCode: sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : '',
				redirectUrl: encodeURIComponent(window.location.href),
				osType: osType,
			}).then(res => {
				if(query.jumpUrl){
					if (isBugBrowser()) { // 登陆的token
						store.setJumpUrl(query.jumpUrl);
					} else {
						store.setJumpUrlSession(query.jumpUrl);
					}
				}
				if (res.msgCode == 'WX0101') {//没有授权
					console.log(res)
					console.log(res.url)
          Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 });
					window.location.href = res.url
				} else if (res.msgCode == 'WX0102' || res.msgCode == 'URM0100') {  //已授权未登录 (静默授权为7天，7天后过期）
					// this.props.history.replace('/home/home')
					this.jumpRouter();
				} else if (res.msgCode == 'WX0100') {    //已授权已登录
          Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
					// TODO: 根据设备类型存储token
					if (isBugBrowser()) { // 登陆的token
						store.setToken(res.loginToken);
					} else {
						store.setTokenSession(res.loginToken);
					}
					// sessionStorage.setItem('authorizedNotLoginStats', 'true')
					if (query.url) {
						window.location.href = query.url
					}
					else {
						// this.props.history.replace('/home/home')
						this.jumpRouter();
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			}).catch()
		}
	}
	// 跳转路由判断
	jumpRouter = () => {
		if (isBugBrowser()) { // 登陆的token
			if(store.getJumpUrl()){
				this.props.history.replace(store.getJumpUrl())
			}else{
				this.props.history.replace('/home/home') //微信授权成功调到登录页
			}
		} else {
			if(store.getJumpUrlSession()){
				this.props.history.replace(store.getJumpUrlSession())
			}else{
				this.props.history.replace('/home/home') //微信授权成功调到登录页
			}
		}
		
		
		if (isBugBrowser()) { // 登陆的token
			store.removeJumpUrl();
		} else {
			store.removeJumpUrlSession();
		}
	};
  render() {
    return null;
  }
}
