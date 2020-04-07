/*
 * @Author: shawn
 * @LastEditTime: 2020-04-07 16:19:02
 */
import React, { PureComponent } from 'react';
// import qs from 'qs';
import styles from './index.scss';
import bannerImg from './img/banner.png';
import QRCode from 'qrcode-react';
import { nativeSaveWebView2Png, nativeGetQRCodeContent } from 'utils/publicApi';
import { Toast } from 'antd-mobile';
// const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
export default class wxshare_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			qrcodeUrl: '',
			hideBtn: false
		};
	}
	// *  size二维码大小number
	// *  bgColor二维码背景色string （CSS颜色）"#FFFFFF"
	// * fgColor颜色 string （CSS颜色）
	// * logo图片地址 string
	// * logoWidth二维码宽度 number
	// * logoHeight二维码高度number

	componentWillMount() {
		nativeGetQRCodeContent((res) => {
			this.setState({
				qrcodeUrl: res
			});
		});
	}
	saveImg = () => {
		this.setState(
			{
				hideBtn: true
			},
			() => {
				nativeSaveWebView2Png((res) => {
					if (res) {
						Toast.info('保存成功');
					} else {
						Toast.info('保存失败');
					}
					setTimeout(() => {
						this.setState({
							hideBtn: false
						});
					}, 2000);
				});
			}
		);
	};
	render() {
		const { qrcodeUrl } = this.state;
		return (
			<div className={styles.dc_landing_page}>
				<img className={styles.banner} src={bannerImg} alt="落地页banner" />
				<div className={styles.qrcode}>
					{qrcodeUrl ? (
						<QRCode size={150} logo={bannerImg} value={qrcodeUrl} logoWidth={50} logoHeight={50}></QRCode>
					) : null}
				</div>
				{!this.state.hideBtn ? (
					<div className={styles.content}>
						<div className={styles.sureBtn} onClick={this.saveImg}>
							<span>保存图片</span>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
