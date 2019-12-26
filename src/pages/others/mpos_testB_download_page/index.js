/*
 * @Author: shawn
 * @LastEditTime : 2019-12-26 10:21:01
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { getDeviceType } from 'utils';
import { other } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
import check_img from './img/check_img.png';
import SXFButton from 'components/ButtonCustom';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};
@setBackGround('#fff')
@fetch.inject()
export default class mpos_download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
		buriedPointEvent(other.mposDownloadPage, {
			position: 'testB_download'
		});
		buriedPointEvent(other.mposDownloadPageAB, {
			position: 'testB_download'
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
				position: 'testB_download'
			});
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'ANDROID',
				position: 'testB_download'
			});
			this.props.toast.info('安全下载中');
			this.getDownloadUrl();
		}
	};
	render() {
		return (
			<div className={styles.mpos_download_page}>
				<img className={styles.banner} src={check_img} alt="落地页banner" />
				<div className={styles.content}>
					<p className={styles.title}>恭喜，您提交的资料已通过预审</p>
					<p className={styles.moneyText}>
						最高可获得额度<span>50000元</span>
					</p>
					<SXFButton className={styles.download_button} onClick={this.downloadClickFun}>
						下载APP，查看额度
					</SXFButton>
					<p className={styles.tipsText}>首次登陆APP用户，可领取新手礼</p>
					<p className={styles.descText}>最终以实际审批额度为准</p>
				</div>
			</div>
		);
	}
}
