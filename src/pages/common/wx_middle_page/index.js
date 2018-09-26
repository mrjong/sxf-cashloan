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
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const u = navigator.userAgent;
		const osType = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 ? 'ANDRIOD' : !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ? 'IOS' : 'PC';
		sessionStorage.setItem('h5Channel', query.h5Channel)
		if (query && query.code) {
			this.props.$fetch.post(`/wx/authcb`, {
				state: query.state,
				code: query.code,
				channelCode: sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : '',
				osType: osType,
			}).then(res => {
				if (res.msgCode == 'WX0000' || res.msgCode == 'URM0100') {                            //请求成功,跳到登录页(前提是不存在已登录未注册的情况)
					console.log(res)
					this.props.history.replace('/login')       //微信授权成功调到登录页
				} else if (res.msgCode == 'WX0100') {
					// $.cookie('fin_v_card_token_wechat', res.token, { path: '/', expires: 999 })
          // $.cookie('fin_v_card_token', res.loginToken, { path: '/', expires: 999 })
          Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 });
          Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
					sessionStorage.setItem('tokenId', res.loginToken)
					sessionStorage.setItem('authorizedNotLoginStats', 'true')
					this.props.history.replace('/home/home')

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
				if (res.msgCode == 'WX0101') {//没有授权
					console.log(res)
					console.log(res.url)
          // $.cookie('fin_v_card_token_wechat', res.token, { path: '/', expires: 999 })
          Cookie.set('fin-v-card-token-wechat', res.token, { expires: 365 });
					window.location.href = res.url
				} else if (res.msgCode == 'WX0102' || res.msgCode == 'URM0100') {  //已授权未登录
					this.props.history.replace('/home/home')
				} else if (res.msgCode == 'WX0100') {    //已授权已登录
          // $.cookie('fin_v_card_token', res.loginToken, { path: '/', expires: 999 })
          Cookie.set('fin-v-card-token', res.loginToken, { expires: 365 });
          if (isBugBrowser()) {
            store.setToken(token);
          } else {
            store.setTokenSession(token);
          }
					// sessionStorage.setItem('tokenId', res.loginToken)
					// sessionStorage.setItem('authorizedNotLoginStats', 'true')
					if (query.url) {
						window.location.href = query.url
					}
					else {
						this.props.history.replace('/home/home')
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			}).catch()
		}
  }
  render() {
    return null;
  }
}
