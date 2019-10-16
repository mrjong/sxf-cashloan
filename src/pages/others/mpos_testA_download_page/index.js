/*
 * @Author: shawn
 * @LastEditTime: 2019-10-16 20:01:21
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { Toast, Modal } from 'antd-mobile';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
// import SXFButton from 'components/ButtonCustom';
import { getDeviceType, queryUsrSCOpenId } from 'utils';
import { other, daicao } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
import loginModalBg from '../../login/login_common_page/img/login_modal.png';
import loginModalBtn from '../../login/login_common_page/img/login_modal_btn.png';
import closeIco from '../../login/login_common_page/img/close_ico.png';
import listPNG from './img/list.png';
import yuanPNG from './img/yuan.png';
import loginBgImg from './img/loginBg.png';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};
let modalTimer = null;
@setBackGround('#fff')
@fetch.inject()
export default class mpos_download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			times: 3, // 弹框里的倒计时
			showDownloadModal: false
		};
	}
	componentWillMount() {
		buriedPointEvent(other.mposDownloadPage);
		queryUsrSCOpenId({
			$props: this.props
		});
	}

	getDownloadUrl = () => {
		this.props.$fetch
			.get(API.DOWNLOADURL, {
				type: '03'
			})
			.then(
				(res) => {
					if (res.msgCode === 'PTM0000') {
						window.location.href = res.data;
					} else {
						res.msgInfo && this.props.toast.info(res.msgInfo);
					}
				},
				(error) => {
					error.msgInfo && this.props.toast.info(error.msgInfo);
				}
			);
	};

	downloadClickFun = () => {
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'IOS'
			});
		} else {
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'ANDROID'
			});
		}
		this.setState(
			{
				showDownloadModal: true
			},
			() => {
				this.startCountDown();
			}
		);
	};

	// 弹框里的倒计时
	startCountDown = () => {
		let times = this.state.times;
		this.clearCountDown();
		modalTimer = setInterval(() => {
			this.setState({
				times: times--
			});
			if (times <= -1) {
				this.clearCountDown();
				this.downloadApp();
			}
		}, 1000);
	};

	clearCountDown = () => {
		clearInterval(modalTimer);
	};

	// 关闭弹框
	closeModal = () => {
		this.setState(
			{
				showDownloadModal: false,
				times: 3
			},
			() => {
				this.clearCountDown();
			}
		);
	};

	// 下载app
	downloadApp = () => {
		this.closeModal();
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			this.props.$fetch.get(API.DOWNLOADURL, {}).then(
				(res) => {
					if (res.msgCode === 'PTM0000') {
						Toast.info('安全下载中');
						window.location.href = res.data;
					} else {
						res.msgInfo && Toast.info(res.msgInfo);
					}
				},
				(error) => {
					error.msgInfo && Toast.info(error.msgInfo);
				}
			);
		}
	};

	render() {
		const { showDownloadModal } = this.state;
		return (
			<div className={styles.mpos_download_page}>
				<img className={styles.banner} src={loginBgImg} alt="落地页banner" />
				<div className={styles.content}>
					<img className={styles.yuanPNG} src={yuanPNG} />
					<div className={styles.sureBtn} onClick={this.downloadClickFun}>
						<span>立即申请</span>
					</div>
					<img className={styles.listPNG} src={listPNG} />
				</div>
				{showDownloadModal && (
					<Modal wrapClassName="loginModalBox" visible={true} transparent maskClosable={false}>
						<div className={styles.loginModalContainer}>
							{/* 大图 */}
							<img className={styles.loginModalBg} src={loginModalBg} alt="背景" />
							{/* 按钮 */}
							<img
								className={styles.loginModalBtn}
								src={loginModalBtn}
								onClick={() => {
									buriedPointEvent(daicao.modalBtnClick);
									this.downloadApp();
								}}
								alt="按钮"
							/>
							{/* 关闭 */}
							<img className={styles.closeIcoStyle} src={closeIco} onClick={this.closeModal} alt="关闭" />
						</div>
					</Modal>
				)}
			</div>
		);
	}
}
