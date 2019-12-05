/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-25 16:30:31
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

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
		const { closeWelfareModal, welfareModalBtn, welfareModalInf, closeBtnStyle, wrapperStyle } = this.props;
		return (
			<div className={[styles.modalWrapper, wrapperStyle].join(' ')}>
				<div className={styles.content}>
					{welfareModalInf.backImgUrl && (
						<img src={welfareModalInf.backImgUrl} className={styles.activityBg} />
					)}
					{/* {welfareModalInf.skipType === '1' ? ( */}
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
					{/* ) : null} */}
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
