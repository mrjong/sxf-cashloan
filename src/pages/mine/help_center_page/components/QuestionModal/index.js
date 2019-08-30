/*
 * @Author: shawn
 * @LastEditTime: 2019-08-30 15:32:21
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import { Modal, Icon } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { helpCenter } from 'utils/analytinsType';

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

	componentDidUpdate() {
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
		this.props.$fetch
			.post(`${API.solvedQuestion}/${this.props.question.bizId}/${type === 'resolve' ? 'yes' : 'no'}`)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					this.props.toast.info('感谢您的反馈');
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
		this.buriedPoint('');
	};

	buriedPoint = (title) => {
		switch (title) {
			case '实名认证':
				buriedPointEvent(helpCenter.realname, {
					is_hot: true,
					q_title: '',
					is_resolve: 'no'
				});
				break;
			case '实名认证1':
				buriedPointEvent(helpCenter.basic, {
					is_hot: true
				});
				break;
			case '实名认证2':
				buriedPointEvent(helpCenter.operators, {
					is_hot: true
				});
				break;
			case '实名认证3':
				buriedPointEvent(helpCenter.creditCard, {
					is_hot: true
				});
				break;
			case '实名认证4':
				buriedPointEvent(helpCenter.submission, {
					is_hot: true
				});
				break;
			case '实名认证5':
				buriedPointEvent(helpCenter.toexamine, {
					is_hot: true
				});
				break;
			case '实名认证6':
				buriedPointEvent(helpCenter.quota, {
					is_hot: true
				});
				break;
			case '实名认证7':
				buriedPointEvent(helpCenter.repayment, {
					is_hot: true
				});
				break;
			default:
				break;
		}
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
