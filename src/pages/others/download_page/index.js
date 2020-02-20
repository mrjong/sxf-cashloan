/*
 * @Author: shawn
 * @LastEditTime: 2020-02-20 17:48:21
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { getDeviceType } from 'utils';
import styles from './index.scss';
import downloadBtn from './img/download_btn.jpg';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { daicao } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
import { xzyBtn } from '../riskBuryConfig';
import { download_queryDownloadUrl } from 'fetch/api';

let entryPageTime = '';

@fetch.inject()
export default class download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			downloadUrl: '' // 下载的url
		};
	}
	componentWillMount() {
		this.getDownloadUrl();
	}

	componentDidMount() {
		entryPageTime = new Date();
		buriedPointEvent(daicao.downloadPageView);
	}

	componentWillUnmount() {
		let exitPageTime = new Date();
		let durationTime = (exitPageTime.getTime() - entryPageTime.getTime()) / 1000;
		buriedPointEvent(daicao.downloadPageTime, {
			durationTime: durationTime
		});
	}

	getDownloadUrl = () => {
		this.props.$fetch.get(`${download_queryDownloadUrl}/02`).then(
			(res) => {
				if (res.code === '000000') {
					this.setState({
						downloadUrl: res.data.downloadUrl
					});
				} else {
					res.message && this.props.toast.info(res.message);
				}
			},
			(error) => {
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	downloadClick = () => {
		sxfburiedPointEvent(xzyBtn);
		const { downloadUrl } = this.state;
		const phoneType = getDeviceType();
		buriedPointEvent(daicao.downloadBtnClick, {
			deviceType: phoneType
		});
		if (phoneType === 'IOS') {
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			this.props.toast.info('安全下载中');
			window.location.href = downloadUrl;
		}
	};

	render() {
		return (
			<div className={styles.download_page}>
				<img onClick={this.downloadClick} className={styles.downloadBtn} src={downloadBtn} alt="下载按钮" />
			</div>
		);
	}
}
