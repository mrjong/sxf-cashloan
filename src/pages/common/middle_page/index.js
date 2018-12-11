import React, { Component } from 'react';
import { store } from 'utils/store';
import qs from 'qs';
import fetch from 'sx-fetch';
import style from './index.scss';
import loading_error from 'assets/images/error/loading_error.png';
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
		const { params, sign, taskType } = query;
		if (params && sign) {
			const data = {
				params,
				sign
			};
			this.props.$fetch
				.post(`${API.getXMURL}`, data)
				.then((res) => {
					if (res && res.msgCode === 'PTM0000') {
						this.goRouter();
					} else {
						this.props.toast.info(res.msgInfo);
						setTimeout(() => {
							this.goRouter();
						}, 3000);
					}
				})
				.catch((err) => {
                    console.log('err',err);
					this.setState({
						errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
				});
		} else if (taskType) {
			this.props.$fetch
				.get(`/auth/updateCredStsForHandle/${taskType}`)
				.then(() => {
					this.goRouter();
				})
				.catch((err) => {
					console.log('err',err);
					this.setState({
						errorInf: '加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
					});
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
		return this.state.errorInf ? (
			<div className={style.auth_page}>
				<div>
					<img src={loading_error} />
				</div>
				<div className={style.text} dangerouslySetInnerHTML={{ __html: this.state.errorInf }} />
			</div>
		) : null;
	}
}
