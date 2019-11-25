/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-25 14:34:30
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { buriedPointEvent } from 'utils/analytins';

const API = {
	POP_DONE: '/popup/done' // 首页弹框
};

export default class WelfareModal extends PureComponent {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		const { welfareModalInf } = this.props;
		this.showWelfareModal(welfareModalInf && welfareModalInf.code);
	}

	componentDidMount() {}

	/**
	 * 福利专区弹框显示后台记录
	 * @param code 对应弹框列表返回的code
	 * @return {void}
	 */
	showWelfareModal = (code) => {
		const { fetch } = this.props;
		fetch.get(`${API.POP_DONE}/${code}`, {}, { hideLoading: true });
	};

	render() {
		const { closeWelfareModal, welfareModalBtn, welfareModalInf, closeBtnStyle } = this.props;
		return (
			<div className={styles.modalWrapper}>
				<div className={styles.content}>
					{welfareModalInf.backImgUrl && (
						<img src={welfareModalInf.backImgUrl} className={styles.activityBg} />
					)}
					{/* {welfareModalInf.skipType === '1' ? ( */}
					<div
						onClick={() => {
							// buriedPointEvent('DC_HOME_WELFARE_MODAL_JOIN_CLICK');
							buriedPointEvent('DC_HOME_CONFIG_MODAL_JOIN_CLICK', {
								adsName: welfareModalInf.name
							});
							welfareModalBtn(welfareModalInf);
						}}
						className={styles.btn_container}
					>
						{welfareModalInf.btnImgUrl && (
							<img src={welfareModalInf.btnImgUrl} className={styles.activityBtnBg} />
						)}
					</div>
					{/* ) : null} */}
				</div>
				{welfareModalInf.closeFlag === '0' ? (
					<div
						className={[styles.closeBtn, closeBtnStyle].join(' ')}
						onClick={() => {
							buriedPointEvent('DC_HOME_CONFIG_MODAL_CLOSE_CLICK', {
								adsName: welfareModalInf.name
							});
							closeWelfareModal(welfareModalInf);
						}}
					/>
				) : null}
			</div>
		);
	}
}
