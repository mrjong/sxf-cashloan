/*
 * @Author: shawn
 * @LastEditTime: 2019-09-02 18:43:23
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
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
		buriedPointEvent(other.testDownloadClick, {
			position: '专项通道按钮'
		});
		this.downloadClickFun();
	};
	downloadClickFun = () => {
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
	msgClick = () => {
		buriedPointEvent(other.testDownloadClick, {
			position: '喇叭链接'
		});
		this.downloadClickFun();
	};
	render() {
		return (
			<div className={styles.bg}>
				<div className={styles.padding_bottom}>
					<div className={styles.bg_top} onClick={this.msgClick} />
					<div className={styles.bg_list}>
						<div className={styles.bg_btn} onClick={this.downloadClick} />
						<div
							className={styles.moreUse}
							onClick={() => {
								buriedPointEvent(other.testDownloadClick, {
									position: '更多权益链接2'
								});
								this.downloadClickFun();
							}}
						>
							更多权益<i></i>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
