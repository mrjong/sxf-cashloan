import React, { Component } from 'react';
import { store } from 'utils/store';
import qs from 'qs';
import fetch from 'sx-fetch';
import Blank from 'components/Blank';
const API = {
	getXMURL: '/auth/zmAuth' // 芝麻认证之后的回调状态
};
@fetch.inject()
export default class middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorInf: ''
		};
	}
	componentWillMount() {
		//芝麻信用的回调
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
        const { taskType } = query;
		if (taskType) {
			this.props.$fetch
				.get(`/auth/updateCredStsForHandle/${taskType}`)
				.then(() => {
					this.goRouter();
				})
				.catch((err) => {
					this.setState({
						errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		} else {
			this.setState({
				errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
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
	render() {
		return <Blank errorInf={this.state.errorInf} />;
	}
}
