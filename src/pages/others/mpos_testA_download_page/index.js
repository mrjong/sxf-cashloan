/*
 * @Author: shawn
 * @LastEditTime: 2019-10-16 20:01:21
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { Toast } from 'antd-mobile';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { getDeviceType, queryUsrSCOpenId } from 'utils';
import { other } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
import button_bg from './img/button_bg.png';
import cover_bg from './img/cover_bg.png';
import logo from './img/logo.png';
import title_bg from './img/title_bg.png';
import img1 from './img/img1.png';
import img2 from './img/img2.png';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};
@setBackGround('#50C5FC')
@fetch.inject()
export default class mpos_download_page extends PureComponent {
	constructor(props) {
		super(props);
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
		this.downloadApp();
	};

	// 下载app
	downloadApp = () => {
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
		return (
			<div className={styles.mpos_download_page}>
				<div className={styles.img_wrap}>
					<img src={logo} alt="" className={styles.logo} />
					<img src={title_bg} alt="" className={styles.title_bg} />
					<img src={cover_bg} alt="" className={styles.cover_bg} />
				</div>
				<div className={styles.content}>
					<img src={img1} alt="" />
					<img src={button_bg} alt="" className={styles.button_bg} onClick={this.downloadClickFun} />
				</div>
				<div className={styles.content2}>
					<img src={img2} alt="" />
				</div>
			</div>
		);
	}
}
