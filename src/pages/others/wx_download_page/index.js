/*
 * @Author: shawn
 * @LastEditTime: 2019-09-03 14:42:05
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import SXFButton from 'components/ButtonCustom';
import DownloadTip from 'components/DownloadTip';
import { getDeviceType, isWXOpen } from 'utils';
import linkConf from 'config/link.conf';
import { other, wxTest } from 'utils/analytinsType';
import qs from 'qs';
import hegui_bg from './img/hegui_bg.png';
import top_bg from './img/top_bg.png';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};

let urlParams = {};
// let entryPageTime = '';
@setBackGround('#fff')
@fetch.inject()
export default class wx_download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			downloadUrl: ''
		};
	}
	componentWillMount() {
		buriedPointEvent(other.mposDownloadPage);
		urlParams = qs.parse(location.search, { ignoreQueryPrefix: true });
		this.getDownloadUrl();
	}
	componentDidMount() {
		// entryPageTime = new Date();
	}
	componentWillUnmount() {
		// if (urlParams && urlParams.wxTestFrom) {
		// 	let exitPageTime = new Date();
		// 	let durationTime = (exitPageTime.getTime() - entryPageTime.getTime()) / 1000;
		// 	buriedPointEvent(wxTest.wxTestDownPageTime, {
		// 		durationTime: durationTime,
		// 		entry: urlParams && urlParams.wxTestFrom
		// 	});
		// } else {
		// 	entryPageTime = '';
		// }
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
		if (urlParams && urlParams.wxTestFrom) {
			buriedPointEvent(wxTest.btnClick_download, {
				entry: urlParams.wxTestFrom
			});
		}
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'IOS'
			});
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			if (isWXOpen()) {
				this.setState({
					visible: !this.state.visible
				});
			}
			buriedPointEvent(other.mposDownloadBtnClick, {
				device_type: 'ANDROID'
			});
			window.location.href = this.state.downloadUrl;
		}
	};

	render() {
		const { visible = false } = this.state;
		return (
			<div>
				<DownloadTip visible={visible}></DownloadTip>
				<img src={top_bg} alt="" className={styles.top_bg} />
				<SXFButton className={styles.smart_button} onClick={this.downloadClick}>
					安全下载
				</SXFButton>
				<p className={styles.desc}>如果您是老用户，请前往还到APP操作并还款</p>
				<img src={hegui_bg} alt="" className={styles.hegui_bg} />
			</div>
		);
	}
}
