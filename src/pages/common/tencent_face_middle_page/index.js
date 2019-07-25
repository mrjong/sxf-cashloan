import React, { Component } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { getNextStr, getDeviceType, handleClickConfirm } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss';
import faceImg from './face.png';
import { SXFToast } from 'utils/SXFToast';

const API = {
	getFaceDetect: '/auth/faceDetect', // 人脸认证之后的回调状态
	getFace: '/auth/getTencentFaceidData' // 人脸识别认证跳转URL
};
let isFetching = false;
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
		//人脸识别的回调
		this.props.$fetch
			.post(`${API.getFaceDetect}`, {
				osType
			})
			.then((res) => {
				if (res.msgCode !== 'PTM0000') {
					this.props.toast.info(res.msgInfo);
					buriedPointEvent(home.faceAuthResult, {
						is_success: false,
						fail_cause: res.msgInfo
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
				if (!store.getRealNameNextStep()) {
					handleClickConfirm(this.props, {
						...store.getLoanAspirationHome()
					});
					store.removeRealNameNextStep();
					store.removeIdChkPhotoBack();
				} else if (store.getNeedNextUrl() && store.getRealNameNextStep() === 'home') {
					// 首页下一步进入
					store.removeRealNameNextStep();
					store.removeIdChkPhotoBack();
					getNextStr({
						$props: this.props
					});
				} else if (store.getIdChkPhotoBack()) {
					// 我的  借款确认页
					history.go(Number(store.getIdChkPhotoBack()));
					store.removeIdChkPhotoBack();
					store.removeRealNameNextStep();
				} else {
					this.props.history.push('/home/home');
				}
			})
			.catch((err) => {
				this.setState({
					authStatus: false
				});
			});
	}

	goFaceAuth = () => {
		if (isFetching) return;
		isFetching = true;
		SXFToast.loading('加载中...', 0);
		this.props.$fetch.post(`${API.getFace}`, {}).then((result) => {
			if (result.msgCode === 'PTM0000' && result.data) {
				setTimeout(() => {
					// 人脸识别第三方直接返回的问题
					SXFToast.hide();
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
		// 首页进入然后返回
		if (store.getRealNameNextStep() && store.getRealNameNextStep() === 'home') {
			store.removeRealNameNextStep();
			store.removeIdChkPhotoBack();
			this.props.history.push('/home/home');
		} else if (store.getRealNameNextStep() && store.getRealNameNextStep() === 'other') {
			// 我的页面进入然后返回
			store.removeRealNameNextStep();
			store.removeIdChkPhotoBack();
			this.props.history.push('/mine/mine_page');
		} else if (store.getIdChkPhotoBack()) {
			window.tencent_face_middle_page = true;
			history.go(Number(store.getIdChkPhotoBack()));
			store.removeIdChkPhotoBack();
			store.removeRealNameNextStep();
		}
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
