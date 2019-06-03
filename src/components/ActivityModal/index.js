import React from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';
import brand from '../../assets/images/home/huodongTootip4.png';
import huodongTootipBtn4 from '../../assets/images/home/huodongTootip_btn4.png';
import xianjin from './img/xianjin.png';
import xianjinBtn from './img/xianjinBtn.png';

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
		const { closeActivityModal, modalType, activityModalBtn } = this.props;
		return (
			<Modal wrapClassName="home_modal_warp" visible={this.state.isShowActivityModal} transparent>
				<div className={styles.modal}>
					<div className={styles.modalWrapper}>
						<div className={styles.content}>
							{/* 大图 */}
							{modalType === 'xianjin' ? <img src={xianjin} /> : null}
							{modalType === 'brand' ? <img src={brand} /> : null}
							{modalType === 'xianjin' ? (
								<img
                  className={styles.huodongTootipBtn4}
                  style={{width:'3.5rem'}}
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
						</div>
						{/* 关闭按钮 */}
						<div className={styles.closeBtn} onClick={()=>{closeActivityModal(modalType)}} />
					</div>
				</div>
			</Modal>
		);
	}
}

export default ActivityModal;
