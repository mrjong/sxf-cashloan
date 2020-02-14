/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 18:15:09
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { Toast } from 'antd-mobile';
import { setBackGround } from 'utils/background';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { getDeviceType, queryUsrSCOpenId } from 'utils';
import { other } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
import button_img from './img/button_img.png';
import cover_img from './img/cover_img.png';
import { download_queryDownloadUrl } from 'fetch/api';

@setBackGround('#fff')
@fetch.inject()
export default class mpos_download_page extends PureComponent {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		buriedPointEvent(other.mposDownloadPage, {
			position: 'testA_download'
		});
		buriedPointEvent(other.mposDownloadPageAB, {
			position: 'testA_download'
		});
		queryUsrSCOpenId({
			$props: this.props
		});
	}

	getDownloadUrl = () => {
		this.props.$fetch.get(`${download_queryDownloadUrl}/03`).then(
			(res) => {
				if (res.code === '000000') {
					window.location.href = res.data.downloadUrl;
				} else {
					res.message && this.props.toast.info(res.message);
				}
			},
			(error) => {
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	downloadClickFun = () => {
		sxfburiedPointEvent('xzyBtn');
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'IOS',
				position: 'testA_download'
			});
		} else {
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'ANDROID',
				position: 'testA_download'
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
			this.props.$fetch.get(`${download_queryDownloadUrl}/02`).then(
				(res) => {
					if (res.msgCode === '000000') {
						Toast.info('安全下载中');
						window.location.href = res.data.downloadUrl;
					} else {
						res.message && Toast.info(res.message);
					}
				},
				(error) => {
					error.message && Toast.info(error.message);
				}
			);
		}
	};

	render() {
		return (
			<div className={styles.mpos_download_page}>
				<img className={styles.banner} src={cover_img} alt="落地页banner" />
				<div className={styles.content}>
					<div className={styles.loginContentBox}>
						<p className={styles.title}>最高可借(元）</p>
						<p className={styles.moneyText}>50000</p>
						<img
							src={button_img}
							alt=""
							onClick={() => {
								this.downloadClickFun();
							}}
							className={styles.sureBtn}
						/>
						<i className={[styles.commonLine, styles.leftTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightTopLine].join(' ')} />
						<i className={[styles.commonLine, styles.leftBottomLine].join(' ')} />
						<i className={[styles.commonLine, styles.rightBottomLine].join(' ')} />
					</div>
				</div>
			</div>
		);
	}
}
