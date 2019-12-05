/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-05 15:08:07
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import { Icon } from 'antd-mobile';
import styles from './index.scss';

export default class reco_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contactList: [
				{
					contactName: '张三',
					contactTel: '18500211234',
					isMarked: true
				},
				{
					contactName: '李四',
					contactTel: '15812349834'
				},
				{
					contactName: '王五',
					contactTel: '13521212232',
					isMarked: true
				},
				{
					contactName: '陈大',
					contactTel: '15212124567'
				},
				{
					contactName: '胡二',
					contactTel: '1712124532'
				},
				{
					contactName: '田六',
					contactTel: '16512345431',
					isMarked: true
				},
				{
					contactName: '徐七',
					contactTel: '14256981234'
				},
				{
					contactName: '任八',
					contactTel: '17437663244',
					isMarked: true
				},
				{
					contactName: '宋九',
					contactTel: '15342335445'
				},
				{
					contactName: '杨十',
					contactTel: '19834764214',
					isMarked: true
				}
			]
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
		const { contactList } = this.state;
		return (
			<div className={styles.select_credit_page}>
				{contactList.length ? (
					<div>
						<p className={styles.card_tit}>{this.state.isVipEnter ? '已绑定银行卡' : '已绑定信用卡'}</p>
						<ul className={styles.card_list}>
							{contactList.map((item, index) => {
								return (
									<li
										// className={isSelected ? styles.active : ''}
										key={index}
										onClick={() => this.selectCard(item)}
									>
										<span>{item.contactName}</span>
										<span className={styles.bank_name}>{item.contactTel}</span>
										{item.isMarked ? (
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
