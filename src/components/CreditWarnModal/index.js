import React from 'react';
import { Modal } from 'antd-mobile';
import { ButtonCustom } from 'components';
import { loan_queryDeDuctionAmt } from 'fetch/api.js';
import Image from 'assets/image';
import { thousandFormatNum } from 'utils/common';
import styles from './index.scss';

let timer = null;

export default class CreditWarnModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seconds: 3,
			showModal: true,
			deductionAmount: 24000
		};
	}
	componentDidMount() {
		// this.queryDeDuctionAmt();
	}

	componentWillUnmount() {
		this.stopInterval();
	}

	/**
	 * 查询优惠券减免的金额展示
	 */
	queryDeDuctionAmt = () => {
		fetch.post(loan_queryDeDuctionAmt).then((res) => {
			if (res.code === '000000') {
				console.log(res);
				this.setState(
					{
						deductionAmount: res.data.deductionAmount
					},
					() => {
						this.startInterval();
					}
				);
			}
		});
	};

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
			this.props.toast.info('请认真阅读3s后即可关闭');
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

	lookBigImage = () => {
		this.setState({
			modal1: true
		});
	};

	render() {
		const { showModal, seconds, deductionAmount, modal1 } = this.state;
		return (
			<div>
				<Modal
					visible={modal1}
					transparent
					maskClosable={true}
					onClose={() => {
						this.setState({
							modal1: false
						});
					}}
					className={styles.bigImgModal}
				>
					<img
						src={Image.bg.credit_warn_bg}
						alt=""
						className={styles.credit_warn_bg}
						style={{ width: '100%', height: '10rem' }}
					/>
				</Modal>
				<Modal popup visible={showModal} className={styles.antModal} animationType="slide-up">
					<div className={styles.modalInner}>
						<img src={Image.bg.dunpai} alt="" className={styles.dunpai} />
						<div className={styles.top_wrap}>
							<h3 className={styles.title}>按时还款 可享用</h3>
							<p className={styles.money}>{thousandFormatNum(deductionAmount)}</p>
							<p className={styles.subTitle}>借款时，已为您优惠(元)</p>
						</div>
						<img
							src={Image.bg.credit_warn_bg}
							alt=""
							className={styles.credit_warn_bg}
							onClick={this.lookBigImage}
						/>
						<div className={styles.white_mask_wrap}>
							<p className={styles.list_title}>如果出现逾期：</p>
							<ul className={styles.list_wrap}>
								<li>还款金额会增加，逾期账单的优惠将失效</li>
								<li>
									随行付会将您的逾期不良信息上报至{' '}
									<span style={{ color: '#EC4747' }}>人行征信、百行征信</span>
								</li>
								<li>
									征信上报后一定会影响您的个人信用、信用卡办理、房贷出行、免押租赁等信用生活 出行、及正常生活
								</li>
							</ul>
							<div className={styles.buttonWrap}>
								<ButtonCustom
									className={[styles.button, seconds < 1 && styles.activeButton].join(' ')}
									onClick={this.handleButtonClick}
								>
									{`关闭(${seconds}s)`}
								</ButtonCustom>
							</div>
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}
