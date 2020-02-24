/*
 * @Author: shawn
 * @LastEditTime: 2020-02-24 16:21:49
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import SXFButton from 'components/ButtonCustom';
import DownloadTip from 'components/DownloadTip';
import { getDeviceType, isWXOpen } from 'utils';
import linkConf from 'config/link.conf';
import { other } from 'utils/analytinsType';
import { download_queryDownloadUrl } from 'fetch/api';
// import qs from 'qs';
import hegui_bg from './img/hegui_bg.png';
import top_bg from './img/top_bg.png';
import { xzyBtn } from '../riskBuryConfig';
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
		buriedPointEvent(other.weixinDownloadPage);
		this.getDownloadUrl();
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
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			buriedPointEvent(other.weixinDownloadBtnClick, {
				device_type: 'IOS'
			});
			window.location.href = linkConf.APPSTORE_URL;
		} else {
			buriedPointEvent(other.weixinDownloadBtnClick, {
				device_type: 'ANDROID'
			});
			if (isWXOpen()) {
				this.setState({
					visible: !this.state.visible
				});
			}
			window.location.href = this.state.downloadUrl;
		}
	};

	render() {
		const { visible = false } = this.state;
		return (
			<div>
				<DownloadTip visible={visible}></DownloadTip>
				<img src={top_bg} alt="" className={styles.top_bg} />
				<div className={styles.btn_box}>
					<SXFButton className={styles.smart_button} onClick={this.downloadClick}>
						安全下载
					</SXFButton>
				</div>
				<p className={styles.desc}>如果您是老用户，请前往还到APP操作并还款</p>
				<img src={hegui_bg} alt="" className={styles.hegui_bg} />
			</div>
		);
	}
}
