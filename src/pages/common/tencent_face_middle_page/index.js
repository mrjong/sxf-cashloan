/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 21:15:03
 */
import React, { Component } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { getDeviceType, activeConfigSts } from 'utils';
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
		// window.tencent_face_middle_page = null;
		store.removeChkPhotoBackNew();
		const osType = getDeviceType();
		const { nextStepStatus } = this.props;
		//人脸识别的回调
		this.props.$fetch
			.post(`${auth_faceDetect}`, {
				osType
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
				const tencentBackUrl = store.getTencentBackUrl();
				// 借钱还信用卡页进入
				// if (!store.getRealNameNextStep()) {
				if (store.getLoanAspirationHome()) {
					activeConfigSts({
						$props: this.props,
						type: 'B',
						callback: () => {}
					});
				} else if (nextStepStatus && store.getRealNameNextStep() === 'home') {
					// 首页下一步进入
					store.removeRealNameNextStep();
					store.removeIdChkPhotoBack();
					store.removeTencentBackUrl();
					getNextStatus({
						$props: this.props
					});
				} else if (tencentBackUrl) {
					store.removeTencentBackUrl();
					store.removeIdChkPhotoBack();
					store.removeRealNameNextStep();
					this.props.history.replace(tencentBackUrl);
				} else {
					this.props.history.replace('/home/home');
				}
				//  else if (store.getIdChkPhotoBack()) {
				// 	// 我的  借款确认页
				// 	history.go(Number(store.getIdChkPhotoBack()));
				// 	store.removeIdChkPhotoBack();
				// 	store.removeRealNameNextStep();
				// } else {
				// 	this.props.history.push('/home/home');
				// }
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
		this.props.$fetch.post(`${auth_getTencentFaceData}`, {}).then((result) => {
			if (result.code === '000000' && result.data) {
				setTimeout(() => {
					// 人脸识别第三方直接返回的问题
					Toast.hide();
					isFetching = false;
					window.location.href = result.data;
				}, 3000);
			}
		});
	};

	goBack = () => {
		this.goRouter();
	};

	goRouter = () => {
		const tencentBackUrl = store.getTencentBackUrl();
		if (tencentBackUrl) {
			store.removeTencentBackUrl();
			this.props.history.replace(tencentBackUrl);
		} else {
			this.props.history.replace('/home/home');
		}
		store.removeIdChkPhotoBack();
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
