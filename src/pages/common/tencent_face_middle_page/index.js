import React, { Component } from 'react';
import { store } from 'utils/store';
import qs from 'qs';
import fetch from 'sx-fetch';
import { getNextStr } from 'utils';
import Blank from 'components/Blank';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

const API = {
	getXMURL: '/auth/zmAuth', // 芝麻认证之后的回调状态
	updateCredStsForHandle: '/auth/updateCredStsForHandle'
};
@fetch.inject()
export default class tencent_face_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}
	componentWillMount() {
		store.removeGoMoxie();
		//人脸识别的回调
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    
		// if (taskType) {
		// 	this.props.$fetch
		// 		.get(`${API.updateCredStsForHandle}/${taskType}`)
		// 		.then((res) => {
		// 			if (res.msgCode !== 'PTM0000') {
		// 				this.props.toast.info(res.msgInfo);
		// 				this.setState({
		// 					errorInf:
		// 						'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
		// 				});
		// 				return;
		// 			}
		// 			if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
		// 				getNextStr({
		// 					$props: this.props
		// 				});
		// 			} else {
		// 				this.goRouter();
		// 			}
		// 		})
		// 		.catch((err) => {
		// 			this.setState({
		// 				errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
		// 			});
		// 		});
		// } else if (mxcode && mxcode === -1) {
		// 	/** mxcode
    //          * 当配置了backUrl，自动跳转到该backUrl时，添加该参数到backUrl上 
    //             -4 用户输入出错（密码等输错且未继续输入）
    //             -3 魔蝎数据服务异常 
    //             -2 平台方服务问题（如中国移动维护等）
    //             -1 默认状态（用于没有进行操作退出）
    //             0 认证失败，异常错误 
    //             1 任务进行成功 
    //             2 任务进行中
    //          */
		// 	if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
		// 		this.props.history.push('/home/home');
		// 	} else {
		// 		this.props.history.back();
		// 	}
		// } else {
		// 	this.setState({
		// 		errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
		// 	});
		// }
	}
	goRouter = () => {
		const moxieBackUrl = store.getMoxieBackUrl();
		if (moxieBackUrl) {
			store.removeMoxieBackUrl();
			this.props.history.replace(moxieBackUrl);
		} else {
			this.props.history.replace('/home/home');
		}
	};

	render() {
		return <Blank errorInf={this.state.errorInf} />;
	}
}
