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
		this.buriedPoint(type);
	};

	buriedPoint = (type) => {
		const { question } = this.props;
		let buriedParams = {
			is_hot: question.status === '03',
			q_title: question.title,
			is_resolve: type
		};

		switch (question.type) {
			case '01':
				buriedPointEvent(helpCenter.realname, buriedParams);
				break;
			case '02':
				buriedPointEvent(helpCenter.basic, buriedParams);
				break;
			case '03':
				buriedPointEvent(helpCenter.operators, buriedParams);
				break;
			case '04':
				buriedPointEvent(helpCenter.creditCard, buriedParams);
				break;
			case '05':
				buriedPointEvent(helpCenter.submission, buriedParams);
				break;
			case '06':
				buriedPointEvent(helpCenter.toexamine, buriedParams);
				break;
			case '07':
				buriedPointEvent(helpCenter.quota, buriedParams);
				break;
			case '08':
				buriedPointEvent(helpCenter.repayment, buriedParams);
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
					this.buriedPoint('no_click');
					onClose();
				}}
			>
				<div className={styles.modalTitle}>
					{question.title}
					<Icon
						type="cross"
						className={styles.modal_close_btn}
						onClick={() => {
							this.buriedPoint('no_click');
							onClose();
						}}
					/>
				</div>
				<pre className={styles.modalDesc} dangerouslySetInnerHTML={{ __html: question.answer }}></pre>

				<div className={styles.desc_icon}>以上内容是否解决了您的问题</div>
				<div className={styles.zan_wrap}>
					<div
						onClick={() => {
							this.dianzanClick('resolve');
						}}
					>
						<span className={[styles.zan_icon, resolve && styles.zan_icon_active].join(' ')}></span>
						<span>已解决</span>
					</div>
					<div
						onClick={() => {
							this.dianzanClick('noresolve');
						}}
					>
						<span className={[styles.nozan_icon, noresolve && styles.nozan_icon_active].join(' ')}></span>
						<span>未解决</span>
					</div>
				</div>
			</Modal>
		);
	}
}
