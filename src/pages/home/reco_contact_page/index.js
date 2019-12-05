/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-05 17:53:53
 */
import React, { PureComponent } from 'react';
// import { store } from 'utils/store';
import { Icon } from 'antd-mobile';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';

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
					contactTel: '15812349834',
					isMarked: false
				},
				{
					contactName: '王五',
					contactTel: '13521212232',
					isMarked: true
				},
				{
					contactName: '陈大',
					contactTel: '15212124567',
					isMarked: false
				},
				{
					contactName: '胡二',
					contactTel: '1712124532',
					isMarked: false
				},
				{
					contactName: '田六',
					contactTel: '16512345431',
					isMarked: true
				},
				{
					contactName: '徐七',
					contactTel: '14256981234',
					isMarked: false
				},
				{
					contactName: '任八',
					contactTel: '17437663244',
					isMarked: true
				},
				{
					contactName: '宋九',
					contactTel: '15342335445',
					isMarked: false
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

	// 选择联系人
	selectContact = (obj) => {
		const { contactList } = this.state;
		const changeList = [];
		const selectedList = contactList.filter((item) => {
			return item.isMarked;
		});
		if (!obj.isMarked && selectedList.length >= 5) {
			this.props.toast.info('最多只能勾选5个推荐联系人');
			return;
		}
		contactList.map((item) => {
			if (obj.contactTel === item.contactTel) {
				item.isMarked = !item.isMarked;
			}
			changeList.push(item);
		});
		this.setState({
			contactList: changeList
		});
	};

	// 确认按钮点击
	confirmHandler = () => {
		if (!this.isAbleClick()) {
			this.props.toast.info('请勾选满5个指定联系人');
		}
	};

	// 是否小于5个联系人
	isAbleClick = () => {
		let isCanClick = true;
		const { contactList } = this.state;
		const selectedList = contactList.filter((item) => {
			return item.isMarked;
		});
		if (selectedList.length < 5) {
			isCanClick = false;
		}
		return isCanClick;
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
										onClick={() => this.selectContact(item)}
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
				<ButtonCustom
					onClick={this.confirmHandler}
					className={
						this.isAbleClick()
							? styles.confirm_btn
							: [styles.confirm_btn, styles.disabled_confirm_btn].join(' ')
					}
				>
					确认
				</ButtonCustom>
			</div>
		);
	}
}
