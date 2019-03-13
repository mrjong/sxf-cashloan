import React from 'react';
import styles from './index.scss';
import huodongTootip3 from '../../assets/images/home/huodongTootip3.png';
import huodongTootip1 from '../../assets/images/home/huodongTootip1.png';
import huodongTootipBtn3 from '../../assets/images/home/huodongTootip_btn3.png';

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
						<img onClick={closeActivityModal} src={isNewModal ? huodongTootip1 : huodongTootip3} />
						{!isNewModal ? (
							<img
								className={styles.huodongTootipBtn}
								src={huodongTootipBtn3}
								onClick={() => {
									activityModalBtn();
								}}
							/>
						) : null}
					</div>
					<div className={styles.closeBtn} onClick={closeActivityModal} />
				</div>
			</div>
		);
	}
}

export default ActivityModal;
