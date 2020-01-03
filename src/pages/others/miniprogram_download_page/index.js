/*
 * @Author: shawn
 * @LastEditTime : 2020-01-03 16:40:58
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import SXFButton from 'components/ButtonCustom';
import CopyModal from 'components/CopyModal';
import { other } from 'utils/analytinsType';
import hegui_bg from './img/hegui_bg.png';
import top_bg from './img/top_bg.png';

@setBackGround('#fff')
export default class miniprogram_download_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: false
		};
	}
	componentWillMount() {
		buriedPointEvent(other.weixinDownloadPage);
	}

	downloadClick = () => {
		buriedPointEvent(other.weixinDownloadBtnClick);
		this.setState({
			modalVisible: true
		});
	};

	// 关闭弹框
	closeModal = () => {
		this.setState({
			modalVisible: false
		});
	};

	render() {
		const { modalVisible } = this.state;
		return (
			<div>
				<img src={top_bg} alt="" className={styles.top_bg} />
				<SXFButton className={styles.smart_button} onClick={this.downloadClick}>
					安全下载
				</SXFButton>
				<p className={styles.desc}>如果您是老用户，请前往还到APP操作并还款</p>
				<img src={hegui_bg} alt="" className={styles.hegui_bg} />
				<p className={styles.tipsText}>
					关注<span>【还到】</span>公众号，回复<span>【免息】</span>领取最高30天免息券
				</p>
				<CopyModal visible={modalVisible} closeModal={this.closeModal} />
			</div>
		);
	}
}
