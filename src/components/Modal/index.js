import React from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';
import huodongTootip3 from '../../assets/images/home/huodongTootip3.png';
import huodongTootipBtn3 from '../../assets/images/home/huodongTootip_btn3.png';
import brand from '../../assets/images/home/huodongTootip4.png';
import huodongTootipBtn4 from '../../assets/images/home/huodongTootip_btn4.png';
import koubei_new_bg from '../../assets/images/home/new_user.png';
import koubei_old_bg from '../../assets/images/home/old_user.png';


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
							{modalType === 'huodongTootip3' ? <img src={huodongTootip3} /> : null}
							{modalType === 'brand' ? <img src={brand} /> : null}
							{modalType === 'koubei_new_user' ? <img src={koubei_new_bg} /> : null}
							{modalType === 'koubei_old_user' ? <img src={koubei_old_bg} /> : null}
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
							{modalType === 'brand' ? (
								<img
									className={styles.huodongTootipBtn4}
									src={huodongTootipBtn4}
									onClick={() => {
										activityModalBtn('brand');
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

						</div>
						{/* 关闭按钮 */}
						{
							!modalBtnFlag ? <div className={styles.closeBtn} onClick={closeActivityModal} /> : null
						}
						
					</div>
				</div>
			</Modal>
		);
	}
}

export default ActivityModal;
