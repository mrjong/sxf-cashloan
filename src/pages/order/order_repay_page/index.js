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
			}
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
	checkClickCb = (item) => {
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
			if (i < item.key) {
				this.state.orderList[i].isChecked = true;
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

	render() {
		const { insureInfo, orderList, penaltyInfo } = this.state;

		return (
			<div className={styles.order_repay_page}>
				<Panel title="其他费用">
					<Lists
						insureFee={insureInfo}
						clickCb={this.clickCb}
						className={styles.order_list}
						isCheckbox={true}
						checkClickCb={this.checkClickCb}
					/>
				</Panel>
				<Panel title="账单">
					<Lists
						listsInf={orderList}
						// insureFee={insureInfo}
						clickCb={this.clickCb}
						className={styles.order_list}
						isCheckbox={true}
						checkClickCb={this.checkClickCb}
						penaltyInfo={penaltyInfo}
					/>
				</Panel>
			</div>
		);
	}
}
