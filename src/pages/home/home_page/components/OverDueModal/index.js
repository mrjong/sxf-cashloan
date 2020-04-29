/*
 * @Author: shawn
 * @LastEditTime: 2020-04-29 16:47:03
 */
import React from 'react';
import fetch from 'sx-fetch';
import { Toast, Modal } from 'antd-mobile';
import style from './index.scss';
import { getDeviceType } from 'utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import rhimg from './img/rhimg.png';
import rhimgBig from './img/rhimgBig.png';
@fetch.inject()
export default class OverDueModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
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
	show = () => {
		this.setState({
			visible: true
		});
	};
	render() {
		const { handleClick, overDueInf, decreaseCoupExpiryDate } = this.props;
		const { visible } = this.state;
		const { downloadUrl } = this.state;
		const osType = getDeviceType();
		return (
			<div className={style.overDueModalWrap}>
				<Modal visible={visible} transparent className="welfareModal" maskClosable={false}>
					<img className={style.rhimgBig} src={rhimgBig} />
					<div
						className={[style.closeBtn].join(' ')}
						onClick={() => {
							this.setState({
								visible: false
							});
						}}
					/>
				</Modal>
				{/* <img className={style.warningImg} src={overDueImg} /> */}

				<div className={style.overDueModalBox}>
					<div className={style.imgBoxRH}>
						<div className={style.nexTitle}>随行付网络小贷接入中国人民银行征信中心</div>
						<img onClick={this.show} className={style.rhimg} src={rhimg} />
					</div>
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
					<div onClick={handleClick} className={style.button}>
						我知道了，前去还款
					</div>
				</div>
			</div>
		);
	}
}
