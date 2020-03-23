/*
 * @Author: shawn
 * @LastEditTime: 2020-03-23 11:22:38
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { getDeviceType } from 'utils';
import { other } from 'utils/analytinsType';
import linkConf from 'config/link.conf';
import check_img from './img/check_img.png';
import SXFButton from 'components/ButtonCustom';
import { download_queryDownloadUrl } from 'fetch/api';
import { xzyBtn } from '../riskBuryConfig';
import Images from 'assets/image';

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
		this.props.$fetch.get(`${download_queryDownloadUrl}/03`).then(
			(res) => {
				if (res.code === '000000') {
					window.location.href = res.data.downloadUrl;
				} else {
					res.message && this.props.toast.info(res.message);
				}
			},
			(error) => {
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	downloadClickFun = () => {
		sxfburiedPointEvent(xzyBtn);
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
						可获得额度高至<span>50000元</span>
					</p>
					<p className={styles.tipsText2}>
						已领先<span>95%</span>的申请用户
					</p>

					<SXFButton className={styles.download_button} onClick={this.downloadClickFun}>
						下载APP，查看额度
						<img alt="lable" src={Images.adorn.lable_ico} className={styles.lable_style} />
					</SXFButton>
					<p className={styles.tipsText}>
						首次登陆APP，领取<span>10天免息</span>新手礼
					</p>
					<p className={styles.descText}>最终以实际审批额度为准</p>
				</div>
			</div>
		);
	}
}
