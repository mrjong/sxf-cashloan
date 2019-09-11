/*
 * @Author: shawn
 * @LastEditTime: 2019-09-02 15:33:00
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import { getDeviceType } from 'utils';
import { setBackGround } from 'utils/background';
import ButtonCustom from 'components/ButtonCustom';
import { buriedPointEvent } from 'utils/analytins';
import linkConf from 'config/link.conf';
import { other } from 'utils/analytinsType';
import logo from './img/logo.png';
import cardBg from './img/card_bg.png';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};

@fetch.inject()
@setBackGround('#fff')
export default class outer_download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
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

	downloadClick = () => {
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			buriedPointEvent(other.outerDownloadBtnClick, {
				device_type: 'IOS'
			});
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			buriedPointEvent(other.outerDownloadBtnClick, {
				device_type: 'ANDROID'
			});
			this.props.toast.info('安全下载中');
			this.getDownloadUrl();
		}
	};
	render() {
		return (
			<div>
				<div className={styles.bg}>
					<img className={styles.logo} src={logo} />
					<div className={styles.top_title}>还到邀请您</div>
					<div className={styles.sub_title}>开启VIP资格</div>
				</div>
				<img src={cardBg} className={styles.card_bg} />
				<p className={styles.tooltip}>
					月息低至
					<em>1.2%</em> <del>1.5%</del>
					<i />
				</p>
				<ButtonCustom className={styles.button} onClick={this.downloadClick}>
					下载APP使用
				</ButtonCustom>
				<p className={styles.desc}>打开还到APP首页,查看是否获得VIP资格，或拨打客服电话400-088-7626</p>
			</div>
		);
	}
}
