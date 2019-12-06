/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-05 21:13:28
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import { InputItem } from 'antd-mobile';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { handleInputBlur } from 'utils';

@createForm()
export default class contact_result_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seleContactList: []
		};
	}
	componentWillMount() {
		const contactList = store.getContactList();
		this.setState({
			seleContactList: contactList || []
		});
	}
	componentDidMount() {}
	componentWillUnmount() {}

	// 选择联系人
	selectContact = (obj) => {
		const { seleContactList } = this.state;
		const changeList = [];
		const selectedList = seleContactList.filter((item) => {
			return item.isMarked;
		});
		// 用户点击已选中的取消选中,点击未选中的如果大于五个则提示
		if (!obj.isMarked && selectedList.length >= 5) {
			this.props.toast.info('最多只能勾选5个推荐联系人');
			return;
		}
		seleContactList.map((item) => {
			if (obj.contactTel === item.contactTel) {
				item.isMarked = !item.isMarked;
			}
			changeList.push(item);
		});
		this.setState({
			seleContactList: changeList
		});
	};

	// 确认按钮点击
	confirmHandler = () => {
		const selectedList = this.getSeleList();
		if (selectedList.length < 5) {
			this.props.toast.info('请勾选满5个指定联系人');
		} else {
			store.setContactList(selectedList);
		}
	};

	// 选中的联系人列表
	getSeleList = () => {
		let selectedList = [];
		const { seleContactList } = this.state;
		selectedList = seleContactList.filter((item) => {
			return item.isMarked;
		});
		return selectedList;
	};

	// 修改联系人信息
	modifyContact = (dataIndex, val, key) => {
		const { seleContactList } = this.state;
		seleContactList.map((item, index) => {
			if (dataIndex === index) {
				item[key] = val;
			}
		});
		store.setContactList(seleContactList);
		console.log(seleContactList, 'seleContactListseleContactList');
	};

	render() {
		const { seleContactList } = this.state;
		return (
			<div className={styles.select_credit_page}>
				{seleContactList.length ? (
					<div>
						<p className={styles.card_tit}>{this.state.isVipEnter ? '已绑定银行卡' : '已绑定信用卡'}</p>
						<ul className={styles.card_list}>
							{seleContactList.map((item, index) => {
								return (
									<li
										// className={isSelected ? styles.active : ''}
										key={index}
										onClick={() => this.selectContact(item)}
									>
										<InputItem
											clear
											placeholder="联系人真实姓名"
											type="text"
											defaultValue={item.contactName}
											onBlur={(v) => {
												this.modifyContact(index, v, 'contactName');
												handleInputBlur();
											}}
										/>
										{/* {item.isMarked ? (
											<Icon type="check-circle-o" color="#5CE492" className={styles.selected_ico} />
										) : null} */}
										<InputItem
											maxLength="11"
											type="number"
											clear
											placeholder="银行卡预留手机号"
											defaultValue={item.contactTel}
											onBlur={(v) => {
												this.modifyContact(index, v, 'contactTel');
												handleInputBlur();
											}}
										/>
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
				<ButtonCustom
					onClick={this.confirmHandler}
					className={
						this.getSeleList().length < 5
							? [styles.confirm_btn, styles.disabled_confirm_btn].join(' ')
							: styles.confirm_btn
					}
				>
					确认
				</ButtonCustom>
			</div>
		);
	}
}
