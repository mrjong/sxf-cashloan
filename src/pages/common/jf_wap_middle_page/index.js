/*
 * @Author: shawn
 * @LastEditTime: 2019-09-11 10:49:48
 */
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
export default class jf_wap_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}
	componentWillMount() {
		store.removeGoMoxie();
		//芝麻信用的回调
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const { taskType, mxcode } = query;
		if (taskType) {
			this.props.$fetch
				.get(`${API.updateCredStsForHandle}/${taskType}`)
				.then((res) => {
					if (res.msgCode !== 'PTM0000') {
						this.buryPointsType(taskType, false, res.msgInfo);
						this.props.toast.info(res.msgInfo);
						this.setState({
							errorInf:
								'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
						});
						return;
					}
					this.buryPointsType(taskType, true);
					store.removeGotoMoxieFlag(); //删除去到第三方魔蝎的标志
					if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
						getNextStr({
							$props: this.props
						});
					} else {
						this.goRouter();
					}
				})
				.catch((err) => {
					err.msgInfo && this.buryPointsType(taskType, false, err.msgInfo);
					this.setState({
						errorInf:
							'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		} else if (mxcode && mxcode === -1) {
			/** mxcode
             * 当配置了backUrl，自动跳转到该backUrl时，添加该参数到backUrl上
                -4 用户输入出错（密码等输错且未继续输入）
                -3 魔蝎数据服务异常
                -2 平台方服务问题（如中国移动维护等）
                -1 默认状态（用于没有进行操作退出）
                0 认证失败，异常错误
                1 任务进行成功
                2 任务进行中
             */
			if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
				this.props.history.push('/home/home');
			} else {
				this.props.history.back();
			}
		} else {
			this.setState({
				errorInf:
					'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
			});
		}
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

	// 判断是首页还是信用加分的提交返回结果埋点 taskType 区分信用卡和运营商 isSucc 结果是否成功 reason 失败原因
	buryPointsType = (taskType, isSucc, reason) => {
		if (taskType === 'carrier') {
			buriedPointEvent(home.operatorResult, { is_success: isSucc, fail_cause: reason });
		} else if (taskType === 'bank') {
			buriedPointEvent(home.cardResult, { is_success: isSucc, fail_cause: reason });
		}
	};

	render() {
		return <Blank errorInf={this.state.errorInf} />;
	}
}
