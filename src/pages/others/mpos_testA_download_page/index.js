/*
 * @Author: shawn
 * @LastEditTime: 2019-09-02 16:38:06
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
// import SXFButton from 'components/ButtonCustom';
import { getDeviceType } from 'utils';
import { other } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
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
		buriedPointEvent(other.mposDownloadPage);
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
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'IOS'
			});
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'ANDROID'
			});
			this.props.toast.info('安全下载中');
			this.getDownloadUrl();
		}
	};

	render() {
		return (
			<div>
				<div className={styles.padding_bottom}>
					<div className={styles.bg_top} />
					<div className={styles.bg_list_box}>
						<div className={styles.bg_list} />
						<div className={styles.moreUse}>
							更多权益<i></i>
						</div>
						<div className={styles.btn_fixed}>
							{/* <SXFButton className={styles.smart_button} onClick={this.downloadClick}>
						安全下载
					</SXFButton> */}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
