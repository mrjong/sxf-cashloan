/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-05 14:52:40
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import { Icon } from 'antd-mobile';
import styles from './index.scss';

export default class reco_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contactList: []
		};
	}
	componentWillMount() {}
	componentDidMount() {}
	componentWillUnmount() {}

	// 选择银行卡
	selectCard = (obj) => {
		// if (backUrlData) {
		this.setState({
			// bankName: obj.bankName,
			// lastCardNo: obj.lastCardNo,
			// bankCode: obj.bankCode,
			agrNo: obj.agrNo
		});
		// this.props.history.replace(backUrlData);
		this.props.history.goBack();
		store.setCardData(obj);
		let paramVip = store.getParamVip() || {};
		Object.assign(paramVip, obj);
		store.setParamVip(paramVip);
		// }
	};

	render() {
		return (
			<div className={styles.select_credit_page}>
				{this.state.contactList.length ? (
					<div>
						<p className={styles.card_tit}>{this.state.isVipEnter ? '已绑定银行卡' : '已绑定信用卡'}</p>
						<ul className={styles.card_list}>
							{this.state.contactList.map((item, index) => {
								const isSelected = this.state.agrNo === item.agrNo;
								return (
									<li
										className={isSelected ? styles.active : ''}
										key={index}
										onClick={() => this.selectCard(item)}
									>
										<span>{item.contactName}</span>
										<span className={styles.bank_name}>{item.contact}</span>
										{isSelected ? (
											<Icon type="check-circle-o" color="#5CE492" className={styles.selected_ico} />
										) : null}
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
				<p onClick={this.addCard} className={styles.add_card}>
					<i className={styles.add_ico}></i>
					{this.state.isVipEnter ? '绑定银行卡' : '绑定信用卡'}
				</p>
				{/* {this.state.showMoudle && <Moudles cb={this} logOut={this.unbindCard.bind(this, this.state.unbindData)} textCont="确认解绑该卡？" />} */}
			</div>
		);
	}
}
