/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 18:05:08
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import { getDeviceType } from 'utils';
import logo from './img/logo.png';
import { setBackGround } from 'utils/background';
import ButtonCustom from 'components/ButtonCustom';
import { buriedPointEvent } from 'utils/analytins';
import { loan_fenqi } from 'utils/analytinsType';
import qs from 'qs';
import { download_queryDownloadUrl } from 'fetch/api';
import linkConf from 'config/link.conf';

@fetch.inject()
@setBackGround('#fff')
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.getDownloadUrl();
	}

	getDownloadUrl = () => {
		this.props.$fetch.get(`${download_queryDownloadUrl}/01`).then(
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
		const { downloadUrl } = this.state;
		const phoneType = getDeviceType();
		buriedPointEvent(loan_fenqi.fenqiDownload);
		if (phoneType === 'IOS') {
			window.location.href = linkConf.APPSTORE_URL;
			// this.props.toast.info('暂不支持ios下载')
		} else {
			this.props.toast.info('安全下载中');
			window.location.href = downloadUrl;
			// window.location.href = 'http://172.16.138.162:8920/app-release.apk'
		}
	};
	render() {
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		return (
			<div className={styles.deposit_tip_page}>
				<div className={styles.bg}>
					<img className={styles.logo} src={logo} />
					<div className={styles.top_title}>还到Plus用户专享</div>
					<div className={styles.sub_title}>{queryData.cashMoney}额度已到账</div>
				</div>
				<div className={styles.joinBtnWrap}>
					<ButtonCustom onClick={this.downloadClick}>下载APP使用</ButtonCustom>
				</div>
				<div>
					<ul className={styles.boxs}>
						<li className={styles.item}>
							<i className={[styles.item2, styles.icon].join(' ')} />
							<div className={styles.title}>放款快</div>
						</li>
						<li className={styles.item}>
							<i className={[styles.item3, styles.icon].join(' ')} />
							<div className={styles.title}>利率低</div>
						</li>
						<li className={styles.item}>
							<i className={[styles.item1, styles.icon].join(' ')} />
							<div className={styles.title}>安全合规</div>
						</li>
					</ul>
				</div>
			</div>
		);
	}
}
