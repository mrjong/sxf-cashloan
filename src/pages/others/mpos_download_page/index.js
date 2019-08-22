import React, { PureComponent } from 'react';
import styles from './index.scss';
import fetch from 'sx-fetch-rjl';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import SXFButton from 'components/ButtonCustom';
import { getDeviceType } from 'utils';
import { other } from 'utils/analytinsType';
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
			window.location.href = 'https://itunes.apple.com/cn/app/id1439290777?mt=8';
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
					<div className={styles.bg_list} />
				</div>
				<div>
					<div className={styles.btn_fixed}>
						<SXFButton className={styles.smart_button} onClick={this.downloadClick}>
							安全下载
						</SXFButton>
						{/* <div>
							<AgreeItem
								className="mpos_middle_checkbox"
								checked={selectFlag}
								data-seed="logId"
								onChange={(e) => this.setState({ selectFlag: e.target.checked })}
							>
								请阅读协议内容，点击按钮即视为同意
								<a
									onClick={() => {
										this.go('register_agreement_page');
									}}
								>
									《用户注册协议》
								</a>
								<a
									onClick={() => {
										this.go('privacy_agreement_page');
									}}
								>
									《用户隐私权政策》
								</a>
							</AgreeItem>
						</div> */}
					</div>
				</div>
			</div>
		);
	}
}
