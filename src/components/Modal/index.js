import React from 'react';
import styles from './index.scss';
import huodongTootip3 from '../../assets/images/home/huodongTootip3.png';
import huodongTootip1 from '../../assets/images/home/huodongTootip1.png';
import huodongTootipBtn3 from '../../assets/images/home/huodongTootip_btn3.png';
import mianxi30 from './img/mianxi30.png';

class ActivityModal extends React.Component {
	constructor(props) {
		super(props);
	}
	// 优先弹688  再弹出免息  再弹iphone
	render() {
		const { closeActivityModal, history, modalType, activityModalBtn } = this.props;
		return (
			<div className={styles.modal}>
				<div className={styles.mask} />
				<div className={styles.modalWrapper}>
					<div className={styles.content}>
						{/* 大图 */}
						{modalType === 'huodongTootip1' ? <img src={huodongTootip1} /> : null}
						{modalType === 'huodongTootip3' ? <img src={huodongTootip3} /> : null}
						{modalType === 'mianxi30' ? <img src={mianxi30} className={styles.mianxi30} /> : null}
						{/* 按钮 */}
						{modalType === 'huodongTootip3' ? (
							<img
								className={styles.huodongTootipBtn}
								src={huodongTootipBtn3}
								onClick={() => {
									activityModalBtn('huodongTootip3');
								}}
							/>
						) : null}
						{modalType === 'mianxi30' ? (
							<div
								className={styles.btn_mianxi}
								onClick={() => {
									activityModalBtn('mianxi30');
								}}
							>
								立即参与
							</div>
						) : null}
					</div>
					{/* 关闭按钮 */}
					<div className={styles.closeBtn} onClick={closeActivityModal} />
				</div>
			</div>
		);
	}
}

export default ActivityModal;
