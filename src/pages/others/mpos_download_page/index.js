/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 18:12:51
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
import { other, wxTest } from 'utils/analytinsType';
import qs from 'qs';

let urlParams = {};
let entryPageTime = '';
@setBackGround('#fff')
@fetch.inject()
export default class mpos_download_page extends PureComponent {
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
		entryPageTime = new Date();
	}
	componentWillUnmount() {
		if (urlParams && urlParams.wxTestFrom) {
			let exitPageTime = new Date();
			let durationTime = (exitPageTime.getTime() - entryPageTime.getTime()) / 1000;
			buriedPointEvent(wxTest.wxTestDownPageTime, {
				durationTime: durationTime,
				entry: urlParams && urlParams.wxTestFrom
			});
		} else {
			entryPageTime = '';
		}
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
		sxfburiedPointEvent('xzyBtn');
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
			// window.location.href =
			// 	'http://a.app.qq.com/o/simple.jsp?pkgname=com.suixingpay.cashloan&ckey=CK1438101189290';
		}
	};

	render() {
		const { visible = false } = this.state;
		return (
			<div>
				<DownloadTip visible={visible}></DownloadTip>
				<div className={styles.padding_bottom}>
					<div className={styles.bg_top} />
					<div className={styles.bg_list} />
				</div>
				<div>
					<div className={styles.btn_fixed}>
						{((urlParams && urlParams.wxTestFrom) || isWXOpen()) && (
							<p className={styles.tip_text}>老用户请下载还到app进行操作或还款</p>
						)}
						<SXFButton className={styles.smart_button} onClick={this.downloadClick}>
							安全下载
						</SXFButton>
					</div>
				</div>
			</div>
		);
	}
}
