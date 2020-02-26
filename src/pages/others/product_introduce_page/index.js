import React, { Component } from 'react';
import img1 from './img/img1.png';
import img2 from './img/img2.png';
import img3 from './img/img3.png';
import img4 from './img/img4.png';
import btn from './img/btn.png';
import fixed_btn from './img/fixed_btn.png';
import styles from './index.scss';
import { buriedPointEvent } from 'utils/analytins';
import { other } from 'utils/analytinsType';
import { getDeviceType } from 'utils';
import fetch from 'sx-fetch';
import { getH5Channel } from 'utils/common';
import Cookie from 'js-cookie';
import { signup_wx_auth } from 'fetch/api.js';
import { store } from 'utils/store';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { connect } from 'react-redux';

@fetch.inject()
@connect(
	(state) => state,
	{ setIframeProtocolShow }
)
class product_introduce_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showFixedBtn: false
		};
	}
	componentDidMount() {
		window.addEventListener('scroll', () => {
			let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			this.setState({
				showFixedBtn: 600 < scrollTop
			});
		});
	}

	downloadClick = () => {
		const phoneType = getDeviceType();
		if (phoneType === 'IOS') {
			buriedPointEvent(other.productIntroduceBtnClick, {
				device_type: 'IOS'
			});
		} else {
			buriedPointEvent(other.productIntroduceBtnClick, {
				device_type: 'ANDROID'
			});
		}
		this.checkWxAuth();
	};

	checkWxAuth = () => {
		this.props.$fetch
			.post(signup_wx_auth, {
				code: '',
				imei: '',
				location: store.getPosition(),
				loginType: '0',
				mac: '',
				osType: getDeviceType().toLowerCase(),
				redirectUrl: encodeURIComponent(window.location.href),
				registrationId: '',
				state: '',
				userChannel: getH5Channel()
			})
			.then((res) => {
				if (res.code == '000000' && res.data.wxFlag === '1') {
					//没有授权
					Cookie.set('FIN-HD-WECHAT-TOKEN', res.data.wxToken, { expires: 365 });
					window.location.href = decodeURIComponent(res.data.wxUrl);
				} else if (res.code == '000000' && res.data.wxFlag === '2') {
					//已授权未登录 (静默授权为7天，7天后过期）
					this.props.history.replace('/login?wxTestFrom=wx_middle_page');
				} else if (res.code == '000000' && res.data.wxFlag === '3') {
					//已授权已登录(跳转下载页)
					Cookie.set('FIN-HD-AUTH-TOKEN', res.data.tokenId, { expires: 365 });
					this.props.history.push({
						pathname: '/others/wx_download_page',
						search: `?wxTestFrom=wx_middle_page`
					});
				} else {
					this.props.toast.info(res.message);
				}
			})
			.catch(() => {
				this.setState({
					errorInf:
						'加载失败,请点击<a href="javascript:void(0);" onclick="window.location.reload()">重新加载</a>'
				});
			});
	};

	go = (url) => {
		this.props.setIframeProtocolShow({
			url
		});
	};

	render() {
		return (
			<div className={styles.product_introduce_page}>
				<div className={styles.btnWrap}>
					<span>
						同意并接受还到平台的
						<em
							onClick={() => {
								this.go('register_agreement_page');
							}}
						>
							《用户注册协议》
						</em>
						<em
							onClick={() => {
								this.go('privacy_agreement_page');
							}}
						>
							《用户隐私协议》
						</em>
					</span>
					<img src={btn} alt="" className={styles.btn} onClick={this.downloadClick} />
				</div>
				<img className={styles.imgItem} src={img1} alt="" />
				<img className={styles.imgItem} src={img2} alt="" />
				<img className={styles.imgItem} src={img3} alt="" />
				<img className={styles.imgItem} src={img4} alt="" />
				{this.state.showFixedBtn && (
					<img className={styles.fixedBtn} src={fixed_btn} alt="" onClick={this.downloadClick} />
				)}
			</div>
		);
	}
}

export default product_introduce_page;