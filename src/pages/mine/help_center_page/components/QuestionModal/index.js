import React, { PureComponent } from 'react';
import styles from './index.scss';
import { Modal, Icon } from 'antd-mobile';

const API = {
	solvedQuestion: '/question/solvedCount'
};
export default class QuestionModal extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			resolve: false,
			noresolve: false
		};
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.visible) {
			this.setState({
				resolve: false,
				noresolve: false
			});
		}
	}

	dianzanClick = (type) => {
		this.setState({
			[type]: !this.state[type]
		});
		this.props.onClose();

		// this.props.$fetch
		// 	.post(API.solvedQuestion, {
		// 		bizId: this.props.question.bizId,
		// 		type: type === 'resolve' ? 'yes' : 'no'
		// 	})
		// 	.then((res) => {
		// 		if (res.msgCode === 'PTM0000' && res.data) {
		// 			console.log(res);
		// 		} else {
		// 			this.props.toast.info(res.msgInfo);
		// 		}
		// 	});
	};

	render() {
		const { visible, question, onClose } = this.props;
		const { noresolve, resolve } = this.state;
		return (
			<Modal
				popup
				className="question_feedback_modal"
				visible={visible}
				animationType="slide-up"
				transparent
				onClose={() => {
					onClose();
				}}
			>
				<div className={styles.modalTitle}>
					{question.title}
					<Icon
						type="cross"
						className={styles.modal_close_btn}
						onClick={() => {
							onClose();
						}}
					/>
				</div>
				<p className={styles.modalDesc}>{question.answer}</p>
				<div className={styles.desc_icon}>以上内容是否解决了您的问题</div>
				<div className={styles.zan_wrap}>
					<div
						onClick={() => {
							this.dianzanClick('noresolve');
						}}
					>
						<span className={[styles.nozan_icon, noresolve && styles.nozan_icon_active].join(' ')}></span>
						<span>未解决</span>
					</div>
					<div
						onClick={() => {
							this.dianzanClick('resolve');
						}}
					>
						<span className={[styles.zan_icon, resolve && styles.zan_icon_active].join(' ')}></span>

						<span>已解决</span>
					</div>
				</div>
			</Modal>
		);
	}
}
