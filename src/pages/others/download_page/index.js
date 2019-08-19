import React, { PureComponent } from 'react';
import fetch from 'sx-fetch-rjl';
import { getDeviceType } from 'utils';
import styles from './index.scss';
import downloadBtn from './img/download_btn.jpg';
import { buriedPointEvent } from 'utils/analytins';
import { home, daicao } from 'utils/analytinsType';
import { store } from 'utils/store';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};

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
		if (!store.getLoginDownloadBtn()) {
			buriedPointEvent(daicao.downloadPageView);
		}
	}

	componentWillUnmount() {
		let exitPageTime = new Date();
		let durationTime = (exitPageTime.getTime() - entryPageTime.getTime()) / 1000;
		if (!store.getLoginDownloadBtn()) {
			buriedPointEvent(daicao.downloadPageTime, {
				durationTime: durationTime
			});
		}
	}

	getDownloadUrl = () => {
		this.props.$fetch.get(API.DOWNLOADURL, {}).then(
			(res) => {
				if (res.msgCode === 'PTM0000') {
					this.setState({
						downloadUrl: res.data
					});
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
		const { downloadUrl } = this.state;
		const phoneType = getDeviceType();
		if (!store.getLoginDownloadBtn()) {
			buriedPointEvent(daicao.downloadBtnClick, {
				deviceType: phoneType
			});
		} else {
			buriedPointEvent(home.downloadBtnClick, {
				deviceType: phoneType
			});
		}
		if (phoneType === 'IOS') {
			window.location.href = 'https://itunes.apple.com/cn/app/id1439290777?mt=8';
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
