/*
 * @Author: shawn
 * @LastEditTime: 2020-03-24 11:06:09
 */
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
import { setH5Channel } from 'utils/common';
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
		setH5Channel();
		this.props.history.push('/common/wx_middle_page?NoLoginUrl=/login&jumpUrl=/others/wx_download_page');
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
								this.go('user_privacy_page');
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
