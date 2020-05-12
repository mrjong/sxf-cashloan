import React from 'react';
import { Modal } from 'antd-mobile';
import { ButtonCustom } from 'components';
import styles from './index.scss';

let timer = null;

export default class CreditWarnModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seconds: 3,
			showModal: true
		};
	}
	componentDidMount() {
		this.startInterval();
	}

	componentWillUnmount() {
		this.stopInterval();
	}

	startInterval = () => {
		clearInterval(timer);
		timer = setInterval(() => {
			this.setState(
				{
					seconds: this.state.seconds - 1
				},
				() => {
					if (this.state.seconds < 1) {
						clearInterval(timer);
					}
				}
			);
		}, 1000);
	};

	handleButtonClick = () => {
		if (this.state.seconds > 0) {
			this.props.toast.info('aaa');
			return;
		}
		this.setState({
			showModal: false
		});
	};

	stopInterval = () => {
		clearInterval(timer);
		this.setState({
			seconds: 0
		});
	};

	render() {
		const { showModal, seconds } = this.state;
		return (
			<Modal popup visible={showModal} className={styles.antModal} animationType="slide-up">
				<div className={styles.modalInner}>
					<h3 className={styles.title}>按时还款, 珍惜信用</h3>
					<p className={styles.subTitle}>还款时授权担保机构扣款保障金</p>
					<div className={styles.buttonWrap}>
						<ButtonCustom
							className={[styles.button, seconds < 1 && styles.activeButton].join(' ')}
							onClick={this.handleButtonClick}
						>
							{`关闭(${seconds}s)`}
						</ButtonCustom>
					</div>
				</div>
			</Modal>
		);
	}
}
