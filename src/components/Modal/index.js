import React from 'react';
import styles from './index.scss';
import huodongTootip3 from '../../assets/images/home/huodongTootip3.png';
import huodongTootip1 from '../../assets/images/home/huodongTootip1.png';
import huodongTootip4 from '../../pages/activity/funsisong_page/img/home_modal_bg.png';
import huodongTootipBtn3 from '../../assets/images/home/huodongTootip_btn3.png';
import huodongTootipBtn4 from '../../pages/activity/funsisong_page/img/home_modal_btn.png';

class ActivityModal extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { closeActivityModal, history, isNewModal, activityModalBtn } = this.props;
		return (
			<div className={styles.modal}>
				<div className={styles.mask} />
				<div className={styles.modalWrapper}>
					<div className={styles.content}>
						{/* <img src={isNewModal ? huodongTootip1 : huodongTootip3} />
						{!isNewModal ? (
							<img
								className={styles.huodongTootipBtn}
								src={huodongTootipBtn3}
								onClick={() => {
									activityModalBtn();
								}}
							/>
						) : null} */}
						{/* fun肆送活动 */}
						<img src={huodongTootip4} />
						<img
							className={styles.huodongTootipBtn2}
							src={huodongTootipBtn4}
							onClick={() => {
								activityModalBtn();
							}}
						/>
					</div>
					<div className={styles.closeBtn} onClick={closeActivityModal} />
				</div>
			</div>
		);
	}
}

export default ActivityModal;
