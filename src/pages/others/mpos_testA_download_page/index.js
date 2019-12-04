/*
 * @Author: shawn
 * @LastEditTime: 2019-12-04 15:15:45
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
import button_img from './img/button_img.png';
import cover_img from './img/cover_img.png';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};
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
