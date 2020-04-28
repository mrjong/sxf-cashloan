/*
 * @Author: shawn
 * @LastEditTime: 2020-04-28 10:28:25
 */
import React, { Component } from 'react';
import qs from 'qs';
import Cookie from 'js-cookie';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import Blanks from 'components/Blank';
import { getDeviceType } from 'utils';
import { setH5Channel, getH5Channel } from 'utils/common';
import { TFDLogin } from 'utils/getTongFuDun';
import { signup_wx_authcb, signup_wx_auth } from 'fetch/api';
import { connect } from 'react-redux';
import { setUserInfoAction } from 'reduxes/actions/staticActions';
import { buriedPointEvent, pageView } from 'utils/analytins';
import { H5CHANNEL_TEST } from 'utils/analytinsType';

@connect(
	(state) => state,
	{ setUserInfoAction }
)
@fetch.inject()
export default class wx_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}
	componentWillMount() {
		pageView();
		buriedPointEvent(H5CHANNEL_TEST.href, {
			test_href: location.href,
			test_h5Channel: getH5Channel()
		});
		// 移除cookie中的token
		Cookie.remove('FIN-HD-AUTH-TOKEN');
		// 从url截取数据
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const osType = getDeviceType();
		setH5Channel();
		if (query && query.code) {
			buriedPointEvent(H5CHANNEL_TEST.auth, {
				test_h5Channel: getH5Channel()
			});
			this.props.$fetch
				.post(
					signup_wx_authcb,
					{
						code: query.code,
						imei: '',
						location: store.getPosition(),
						loginType: '0',
						mac: '',
						// wxToken: Cookie.get('FIN-HD-WECHAT-TOKEN'),
						osType: osType.toLowerCase(),
						redirectUrl: '',
						registrationId: '',
						state: query.state,
						userChannel: getH5Channel()
					},
					{
						'FIN-HD-WECHAT-TOKEN': Cookie.get('FIN-HD-WECHAT-TOKEN')
					}
				)
				.then((res) => {
					if (res.code == '000000' && res.data.wxFlag === '0') {
						//请求成功,跳到登录页(前提是不存在已登录未注册的情况)
						let NoLoginUrl = store.getNoLoginUrl();
						this.jumpRouter(NoLoginUrl);
					} else if (res.code == '000000' && res.data.wxFlag === '3') {
						// 已授权不需要登陆
						this.props.setUserInfoAction(res.data);
						Cookie.set('FIN-HD-WECHAT-TOKEN', res.data.wxToken, { expires: 365 }); // 微信授权token
						Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.data.tokenId);

						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						this.jumpRouter();
					} else {
						this.props.toast.info(res.message); //请求失败,弹出请求失败信息
					}
				})
				.catch(() => {
					this.setState({
						errorInf:
							'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		} else {
			buriedPointEvent(H5CHANNEL_TEST.noauth, {
				test_h5Channel: getH5Channel()
			});
			this.props.$fetch
				.post(signup_wx_auth, {
					code: '',
					imei: '',
					location: store.getPosition(),
					loginType: '0',
					mac: '',
					osType: osType.toLowerCase(),
					redirectUrl: encodeURIComponent(window.location.href),
					registrationId: '',
					state: '111',
					userChannel: getH5Channel()
				})
				.then((res) => {
					if (query.jumpUrl) {
						// 登陆的token
						store.setJumpUrl(query.jumpUrl);
					}
					if (query.NoLoginUrl) {
						// 登陆的token
						store.setNoLoginUrl(query.NoLoginUrl);
					}
					if (res.code == '000000' && res.data.wxFlag === '1') {
						//没有授权
						Cookie.set('FIN-HD-WECHAT-TOKEN', res.data.wxToken, { expires: 365 });
						window.location.href = decodeURIComponent(res.data.wxUrl);
					} else if (res.code == '000000' && res.data.wxFlag === '2') {
						//已授权未登录 (静默授权为7天，7天后过期）
						let NoLoginUrl = store.getNoLoginUrl();
						this.jumpRouter(NoLoginUrl);
					} else if (res.code == '000000' && res.data.wxFlag === '3') {
						//已授权已登录
						Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
						// TODO: 根据设备类型存储token
						store.setToken(res.data.tokenId);
						this.props.setUserInfoAction(res.data);
						// 登录之后手动触发通付盾 需要保存cookie 和session fin-v-card-toke
						TFDLogin();
						if (query.url) {
							window.location.href = query.url;
						} else {
							this.jumpRouter();
						}
					} else {
						this.props.toast.info(res.message);
					}
				})
				.catch(() => {
					this.setState({
						errorInf:
							'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		}
	}
	// 跳转路由判断
	jumpRouter = (NoLoginUrl) => {
		// 登陆的token
		let jumpUrl = store.getJumpUrl();
		let URL = '';
		store.removeJumpUrl();
		store.removeNoLoginUrl();
		if (NoLoginUrl) {
			URL = jumpUrl ? NoLoginUrl + `?jumpUrl=${jumpUrl}` : NoLoginUrl;
			// 针对微信菜单栏上的在线客服，在url上增加entry参数,登录后可直接跳转
			if (window.globalConfig && window.globalConfig.wxTest) {
				buriedPointEvent(H5CHANNEL_TEST.loginhref, {
					test_h5Channel: getH5Channel()
				});
				if (jumpUrl) {
					this.props.history.replace(URL + '&wxTestFrom=wx_middle_page');
				} else {
					this.props.history.replace(URL + '?wxTestFrom=wx_middle_page');
				}
			} else {
				this.props.history.replace(URL);
			}
		} else if (jumpUrl) {
			this.props.history.replace(jumpUrl);
		} else if (window.globalConfig && window.globalConfig.wxTest) {
			// 微信测试
			this.props.history.replace({
				pathname: '/others/wx_download_page',
				search: `?wxTestFrom=wx_middle_page`
			});
		} else {
			this.props.history.replace('/home/home');
		}
	};
	render() {
		return <Blanks errorInf={this.state.errorInf} />;
	}
}
