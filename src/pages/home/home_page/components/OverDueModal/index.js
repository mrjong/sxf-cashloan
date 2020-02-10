/*
 * @Author: shawn
 * @LastEditTime : 2020-02-10 12:00:20
 */
import React from 'react';
import fetch from 'sx-fetch';
import { Toast } from 'antd-mobile';
import style from './index.scss';
import overDueImg from 'assets/images/home/overDue_icon.png';
import { Modal } from 'antd-mobile';
import { getDeviceType } from 'utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const API = {
	downLoadContract: '/procedure/docDownLoad'
};

@fetch.inject()
export default class OverDueModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			downloadUrl: 'https://odr.qzzcwyh.com/'
		};
	}

	componentWillMount() {}

	downloadFile = (downloadUrl) => {
		if (!downloadUrl) {
			return;
		}
		window.location.href = downloadUrl;
	};

	copyOperation = () => {
		Toast.info(
			'已帮您复制了仲裁委网址，打开浏览器粘贴网址，输入仲裁委短信发送的案件号查看并下载您的仲裁书',
			5
		);
	};

	render() {
		const { handleClick, overDueInf, decreaseCoupExpiryDate } = this.props;
		const { downloadUrl } = this.state;
		const osType = getDeviceType();
		return (
			<Modal className="overDueModalBox" visible={true} transparent maskClosable={false}>
				<div>
					<img className={style.warningImg} src={overDueImg} />
					<h3 className={style.overDueTit}>{overDueInf && overDueInf.progressDesc}</h3>
					<p className={style.overDueDesc}>{overDueInf && overDueInf.progressContent}</p>
					{decreaseCoupExpiryDate ? (
						<div className={style.couponEntry} onClick={handleClick}>
							<span>有减免券可用</span>
							<span className={style.value}>有效期{decreaseCoupExpiryDate}</span>
						</div>
					) : null}

					{overDueInf &&
						(overDueInf.progressOrder === 8 || overDueInf.progressOrder === 9) &&
						osType !== 'IOS' && (
							<p
								className={style.download}
								onClick={() => {
									this.downloadFile(overDueInf.docShowLineUrl);
								}}
							>
								立即下载裁决书
							</p>
						)}

					{overDueInf &&
						(overDueInf.progressOrder === 8 || overDueInf.progressOrder === 9) &&
						osType === 'IOS' && (
							<CopyToClipboard text={downloadUrl} onCopy={() => this.copyOperation()}>
								<p className={style.download}>立即下载裁决书</p>
							</CopyToClipboard>
						)}

					{/* <a href="http://172.18.30.184:8888/wap/procedure/docDownLoad/LzIwMTkwNDE5L+ijgeWGs+S5pi5wZGY=?fin-v-card-token=a6d11943acb04d09af5ebfe0231346e0" target="_parent" download="裁决书.pdf">立即下载裁决书</a> */}
				</div>
				<div onClick={handleClick} className={style.button}>
					我知道了，前去还款
				</div>
			</Modal>
		);
	}
}
