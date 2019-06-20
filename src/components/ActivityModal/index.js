import React from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';
import xianjin from './img/xianjin.png';
import xianjinBtn from './img/xianjinBtn.png';
import jd618Btn from './img/jd618Btn.png';
import jd618 from './img/jd618.png';
import freebill from './img/freebill.png';
import freebill_btn from './img/freebill_btn.png';
import yhq7 from './img/yhq7.png';
import yhq50 from './img/yhq50.png';

class ActivityModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isShowActivityModal: false
		};
	}
	componentWillMount() {
		setTimeout(() => {
			this.setState({
				isShowActivityModal: true
			});
		}, 300);
	}
	// 优先弹688  再弹出免息  再弹iphone
	render() {
		const { closeActivityModal, modalType, activityModalBtn, modalBtnFlag } = this.props;
		return (
			<Modal className={styles.transitionName} wrapClassName="home_modal_warp" visible={this.state.isShowActivityModal} transparent>
				<div className={styles.modal}>
					<div className={styles.modalWrapper}>
						<div className={styles.content}>
							{/* 大图 */}
							{modalType === 'xianjin' ? <img src={xianjin} /> : null}
							{modalType === 'jd618' ? <img src={jd618} /> : null}
							{modalType === 'freebill' ? <img src={freebill} /> : null}
							{modalType === 'yhq7' ? <img src={yhq7} /> : null}
							{modalType === 'yhq50' ? <img src={yhq50} /> : null}
							{/* 按钮 */}
							{modalType === 'xianjin' ? (
								<img
									className={styles.huodongTootipBtn4}
									style={{ width: '3.5rem' }}
									src={xianjinBtn}
									onClick={() => {
										activityModalBtn(modalType);
									}}
								/>
							) : null}
							{modalType === 'jd618' ? (
								<img
									className={styles.jd618Btn}
									src={jd618Btn}
									onClick={() => {
										activityModalBtn('jd618');
									}}
								/>
							) : null}
							{modalType === 'freebill' ? (
								<img
									className={styles.freebillBtn}
									src={freebill_btn}
									onClick={() => {
										activityModalBtn('freebill');
									}}
								/>
							) : null}
						</div>
						{!modalBtnFlag ? (
							<div
								className={styles.closeBtn}
								onClick={() => {
									closeActivityModal(modalType);
								}}
							/>
						) : null}
					</div>
				</div>
			</Modal>
		);
	}
}

export default ActivityModal;
