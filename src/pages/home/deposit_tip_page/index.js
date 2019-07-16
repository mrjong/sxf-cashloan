import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import { getDeviceType } from 'utils';
import { isMPOS } from 'utils/common';
import logo from './img/logo.png';
import { setBackGround } from 'utils/background';
import ButtonCustom from 'components/ButtonCustom';
import { buriedPointEvent } from 'utils/analytins';
import { loan_fenqi } from 'utils/analytinsType';
import qs from 'qs';

const API = {
	DOWNLOADURL: 'download/getDownloadUrl'
};

@fetch.inject()
@setBackGround('#fff')
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		if (!isMPOS() && getDeviceType() !== 'ANDRIOD') {
			window.location.href = 'cashloan://sxfcashloan.app/openwith?name=qwer';
		}
		this.getDownloadUrl();
	}

	getDownloadUrl = () => {
		this.props.$fetch
			.get(API.DOWNLOADURL, {
				type: '01'
			})
			.then(
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
		buriedPointEvent(loan_fenqi.fenqiDownload);
		if (phoneType === 'IOS') {
			window.location.href = 'https://itunes.apple.com/cn/app/id1439290777?mt=8';
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
				<ButtonCustom className={styles.joinBtn} onClick={this.downloadClick}>
					下载APP提现
				</ButtonCustom>
				<div>
					<ul className={styles.boxs}>
						<li className={styles.item}>
							<i className={[styles.item1, styles.icon].join(' ')} />
							<div>
								<div className={styles.title}>额度高</div>
								<div className={styles.subtitle}>
									平均提额<span>50%</span>
								</div>
							</div>
						</li>
						<li className={styles.item}>
							<i className={[styles.item2, styles.icon].join(' ')} />
							<div>
								<div className={styles.title}>放款快</div>
								<div className={styles.subtitle}>
									提款储蓄卡快至<span>3s</span>
								</div>
							</div>
						</li>
						<li className={styles.item}>
							<i className={[styles.item3, styles.icon].join(' ')} />
							<div>
								<div className={styles.title}>
									利率低
									<i />
								</div>
								<div className={styles.subtitle}>
									月利率低至<span>1.2%</span>
									<span className={styles.midLine}>1.5%</span>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		);
	}
}
