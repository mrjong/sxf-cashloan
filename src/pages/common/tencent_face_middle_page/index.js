/*
 * @Author: shawn
 * @LastEditTime : 2020-02-18 17:22:34
 */
import React, { Component } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { getDeviceType } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss';
import { connect } from 'react-redux';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';

import faceImg from './face.png';
import { auth_faceDetect, auth_getTencentFaceData } from 'fetch/api';
import { Toast } from 'antd-mobile';
let isFetching = false;
@connect((state) => ({
	nextStepStatus: state.commonState.nextStepStatus
}))
@fetch.inject()
export default class tencent_face_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			authStatus: true
		};
	}
	componentWillMount() {
		const osType = getDeviceType();
		const { nextStepStatus } = this.props;
		//人脸识别的回调
		this.props.$fetch
			.get(`${auth_faceDetect}`, {
				osType: osType.toLowerCase()
			})
			.then((res) => {
				if (res.code !== '000000') {
					this.props.toast.info(res.message);
					buriedPointEvent(home.faceAuthResult, {
						is_success: false,
						fail_cause: res.message
					});
					this.setState({
						authStatus: false
					});
					return;
				}
				this.setState({
					authStatus: true
				});
				buriedPointEvent(home.faceAuthResult, {
					is_success: true,
					fail_cause: ''
				});
				// 借钱还信用卡页进入
				// if (!store.getRealNameNextStep()) {
				if (nextStepStatus) {
					// 首页下一步进入
					store.removeRealNameNextStep();
					store.removeTencentBackUrl();
					getNextStatus({
						$props: this.props
					});
				} else {
					this.props.history.replace('/home/home');
				}
			})
			.catch(() => {
				this.setState({
					authStatus: false
				});
			});
	}

	goFaceAuth = () => {
		if (isFetching) return;
		isFetching = true;
		Toast.loading('加载中...', 0);
		this.props.$fetch
			.get(`${auth_getTencentFaceData}?callBackUrl=http://172.16.175.23/common/tencent_face_middle_page`, {})
			.then((result) => {
				if (result.code === '000000' && result.data) {
					setTimeout(() => {
						// 人脸识别第三方直接返回的问题
						Toast.hide();
						isFetching = false;
						window.location.href = result.data.h5Url;
					}, 3000);
				}
			});
	};

	goBack = () => {
		this.goRouter();
	};

	goRouter = () => {
		this.props.history.replace('/home/home');
		store.removeRealNameNextStep();
	};

	render() {
		return (
			<div>
				{!this.state.authStatus && (
					<div className={style.face_wrap}>
						<h2>验证失败</h2>
						<p>视频中人脸检测不到</p>
						<p>录制时，确保人脸清晰完整</p>
						<div className={style.tip_title}>请保持脸部完整</div>
						<img src={faceImg} alt="" className={style.face_img} />
						<button onClick={this.goBack} className={style.button}>
							退出验证
						</button>
						<button onClick={this.goFaceAuth} className={[style.button, style.active_btn].join(' ')}>
							重新验证
						</button>
					</div>
				)}
			</div>
		);
	}
}
