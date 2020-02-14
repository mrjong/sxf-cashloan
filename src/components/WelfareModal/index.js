/*
 * @Author: sunjiankun
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2020-02-08 14:13:00
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { msg_popup_done } from 'fetch/api';
import fetch from 'sx-fetch';

export default class WelfareModal extends PureComponent {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { welfareModalInf } = this.props;
		buriedPointEvent(home.configModalShow, {
			adsName: welfareModalInf.name
		});
		this.showWelfareModal(welfareModalInf && welfareModalInf.code);
	}

	/**
	 * 福利专区弹框显示后台记录
	 * @param code 对应弹框列表返回的code
	 * @return {void}
	 */
	showWelfareModal = (code) => {
		fetch.get(`${msg_popup_done}/${code}`, {}, { hideToast: true });
	};

	render() {
		const { closeWelfareModal, welfareModalBtn, welfareModalInf, closeBtnStyle, wrapperStyle } = this.props;
		return (
			<div className={[styles.modalWrapper, wrapperStyle].join(' ')}>
				<div className={styles.content}>
					{welfareModalInf.backImgUrl && (
						<img src={welfareModalInf.backImgUrl} className={styles.activityBg} />
					)}
					{welfareModalInf && welfareModalInf.extensionData && welfareModalInf.extensionData.rewardDays && (
						<span
							className={[
								styles.fudai_rewardDay,
								welfareModalInf.extensionData.rewardDays > 9 && styles.fudai_rewardDay1
							].join(' ')}
						>
							{welfareModalInf.extensionData.rewardDays}天
						</span>
					)}
					<div
						onClick={() => {
							buriedPointEvent(home.configModalJoinClick, {
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
				</div>
				{welfareModalInf.closeFlag === '0' ? (
					<div
						className={[styles.closeBtn, closeBtnStyle].join(' ')}
						onClick={() => {
							buriedPointEvent(home.configModalCloseClick, {
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
