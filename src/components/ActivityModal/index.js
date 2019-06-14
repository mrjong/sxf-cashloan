import React from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';
import brand from '../../assets/images/home/huodongTootip4.png';
import huodongTootipBtn4 from '../../assets/images/home/huodongTootip_btn4.png';
import xianjin from './img/xianjin.png';
import xianjinBtn from './img/xianjinBtn.png';
import jd618Btn from './img/jd618Btn.png'
import jd618 from './img/jd618.png'
import koubei_new_bg from '../../assets/images/home/new_user.png';
import koubei_old_bg from '../../assets/images/home/old_user.png';
import freebill from './img/freebill.png'
import freebill_btn from './img/freebill_btn.png'


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
			<Modal wrapClassName="home_modal_warp" visible={this.state.isShowActivityModal} transparent>
				<div className={styles.modal}>
					<div className={styles.modalWrapper}>
						<div className={styles.content}>
							{/* 大图 */}
							{modalType === 'xianjin' ? <img src={xianjin} /> : null}
							{modalType === 'brand' ? <img src={brand} /> : null}
							{modalType === 'koubei_new_user' ? <img src={koubei_new_bg} /> : null}
							{modalType === 'koubei_old_user' ? <img src={koubei_old_bg} /> : null}
							{modalType === 'jd618' ? <img src={jd618} /> : null}
							{modalType === 'freebill' ? <img src={freebill} /> : null}

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
							{modalType === 'brand' ? (
								<img
									className={styles.huodongTootipBtn4}
									src={huodongTootipBtn4}
									onClick={() => {
										activityModalBtn(modalType);
									}}
								/>
							) : null}
							{modalType === 'koubei_new_user' ? (
								<img
									className={styles.koubeiBtn}
									src={huodongTootipBtn4}
									onClick={() => {
										activityModalBtn('koubei_new_user');
									}}
								/>
							) : null}
							{modalType === 'koubei_old_user' ? (
								<img
									className={styles.koubeiBtn}
									src={huodongTootipBtn4}
									onClick={() => {
										activityModalBtn('koubei_old_user');
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
						{/* 关闭按钮 */}
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
