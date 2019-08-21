import React, { PureComponent } from 'react';
import Lists from 'components/Lists';
import Panel from 'components/Panel';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { store } from 'utils/store';
import { Modal, Icon } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import { getH5Channel, isMPOS } from 'utils/common';
import qs from 'qs';

export default class order_repay_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			penaltyInfo: {
				// 罚息数据
				label: {
					name: '罚息',
					brief: '逾期管理费'
				},
				extra: [
					{
						name: '10.00',
						color: '#333'
					},
					{
						name: '32.00',
						color: '#333'
					}
				]
			},
			totalMoney: 0,
			showTipModal: false
		};
	}

	componentDidMount() {
		const { insureInfo, orderList, penaltyInfo } = store.getOrderRepayInfo();
		console.log(store.getOrderRepayInfo());
		this.setState({
			insureInfo,
			orderList,
			penaltyInfo
		});
	}

	componentWillUnmount() {
		store.removeOrderRepayInfo();
	}

	checkClickCb = (item) => {
		console.log(item);
		let totalMoney = 0;
		if (item.isChecked) {
			item = {
				...item,
				isChecked: false
			};
		} else {
			item = {
				...item,
				isChecked: true
			};
		}

		for (let i = 0; i < this.state.orderList.length; i++) {
			if (i <= item.key) {
				this.state.orderList[i].isChecked = true;

				for (let j = 0; j < this.state.orderList[i].feeInfos.length; j++) {
					let itm = this.state.orderList[i].feeInfos[j];
					if (itm.feeNm === '剩余应还') {
						totalMoney += itm.feeAmt;
						console.log(totalMoney);
					}
				}
				this.setState({
					totalMoney: Number(totalMoney).toFixed(2)
				});
			} else {
				this.state.orderList[i].isChecked = false;
			}
		}
		this.state.orderList[item.key] = item;
		this.setState({
			orderList: [...this.state.orderList]
		});
	};

	// 展开隐藏
	clickCb = (item) => {
		switch (item.arrowHide) {
			case 'empty':
				break;
			case 'up':
				item = {
					...item,
					arrowHide: 'down',
					showDesc: false
				};
				break;
			case 'down':
				item = {
					...item,
					arrowHide: 'up',
					showDesc: true
				};

				break;
			default:
				break;
		}
		for (let i = 0; i < this.state.orderList.length; i++) {
			if (i !== item.key) {
				this.state.orderList[i].showDesc = false;
				this.state.orderList[i].arrowHide = 'down';
			}
		}
		this.state.orderList[item.key] = item;
		this.setState({
			orderList: [...this.state.orderList]
		});
	};

	handleCloseTipModal = () => {
		this.setState({
			showTipModal: !this.state.showTipModal
		});
	};

	render() {
		const { insureInfo, orderList, penaltyInfo, totalMoney, showTipModal } = this.state;

		return (
			<div className={styles.order_repay_page}>
				<Panel title="其他费用">
					<Lists insureFee={insureInfo} className={styles.order_list} isCheckbox={true} />
				</Panel>
				<Panel
					title="账单"
					extra={{
						style: {
							color: '#FE6666',
							fontSize: '0.34rem',
							float: 'right',
							position: 'relative',
							paddingRight: '0.3rem'
						},
						text: '已逾期(45天)',
						clickCb: () => {
							this.handleCloseTipModal();
						},
						icon: <i className={styles.extra_icon} />
					}}
				>
					<Lists
						listsInf={orderList}
						clickCb={this.clickCb}
						className={styles.order_list}
						isCheckbox={true}
						checkClickCb={this.checkClickCb}
						penaltyInfo={penaltyInfo}
					/>
				</Panel>
				<div className={styles.fixed_button}>
					<span className={styles.money_show}>
						共计<em>{totalMoney}</em>元
					</span>
					<SXFButton onClick={this.handleClickConfirm} className={styles.sxf_btn}>
						立即还款
					</SXFButton>
					<Modal
						wrapClassName="order_repay_page"
						visible={showTipModal}
						transparent
						footer={[
							{
								text: '我知道了',
								onPress: () => {
									this.handleCloseTipModal();
								}
							}
						]}
					>
						<div className={styles.modal_tip_content}>
							<h3 className={styles.modal_title}>逾期天数说明</h3>
							<p className={styles.modal_desc}>
								任意一期未按时足额还款，视为逾期，计算逾期天数。直至还清全部应还未还款项为止。
							</p>
							<p className={styles.modal_desc}>
								您的逾期开始日期：<em>2019年05月22日</em>
							</p>
						</div>
					</Modal>
				</div>
			</div>
		);
	}
}
