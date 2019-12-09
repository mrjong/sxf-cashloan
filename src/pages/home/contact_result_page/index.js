/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-09 17:00:42
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import { InputItem } from 'antd-mobile';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { handleInputBlur } from 'utils';
import { setBackGround } from 'utils/background';

@setBackGround('#fff')
@createForm()
export default class contact_result_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seleContactList: []
		};
	}
	componentWillMount() {
		const contactList = store.getSelContactList();
		const seleContactList = contactList.filter((item) => {
			return item.isMarked;
		});
		this.setState({
			seleContactList: seleContactList || []
		});
	}
	componentDidMount() {}
	componentWillUnmount() {}

	// 修改联系人
	editContactHandler = (obj) => {
		this.checkModify(obj);
		this.props.history.push({ pathname: '/home/modify_contact_page', state: obj });
	};

	// 确认按钮点击
	confirmHandler = () => {
		// const { seleContactList } = this.state;
		// store.setSelContactList(seleContactList);
	};

	// 修改联系人信息
	modifyContact = (obj, val, key) => {
		const modifyList = store.getSelContactList();
		const selectIndex = modifyList.findIndex((item) => {
			return item.uniqMark === obj.uniqMark;
		});
		modifyList[selectIndex][key] = val;
		this.setState(
			{
				seleContactList: modifyList || []
			},
			() => {
				store.setSelContactList(modifyList);
			}
		);
	};

	// 格式化手机号
	formatePhone = (val) => {
		let formateVal = '';
		if (!val) {
			return null;
		}
		formateVal = val.replace(/\D/g, '').substring(0, 11);
		var valueLen = formateVal.length;
		if (valueLen > 3 && valueLen < 8) {
			formateVal = formateVal.substr(0, 3) + ' ' + formateVal.substr(3);
		} else if (valueLen >= 8) {
			formateVal = formateVal.substr(0, 3) + ' ' + formateVal.substr(3, 4) + ' ' + formateVal.substr(7);
		}
		return formateVal;
	};

	// 查看是否更改
	checkModify = (obj) => {
		const contactList = store.getContactList();
		const seletedContactList = store.getSelContactList();
		contactList.map((item) => {
			if (item.uniqMark === obj.uniqMark) {
				if (obj.contactName === item.contactName && obj.contactTel === item.contactTel) {
					item.isMarked = true;
				} else {
					item.isMarked = false;
				}
			} else {
				// 不能选择相同电话号码的人,名称可以一直
				const filterList = seletedContactList.filter((item2) => {
					return item2.uniqMark === item.uniqMark && item2.contactTel === item.contactTel && !item.isMarked;
				});
				if (filterList.length) {
					item.isMarked = true;
				}
			}
		});
		store.setContactList(contactList);
	};

	render() {
		const { seleContactList } = this.state;
		return (
			<div className={styles.contact_result_page}>
				{seleContactList.length ? (
					<div className={styles.contact_list_box}>
						<ul className={styles.contact_list}>
							{seleContactList.map((item, index) => {
								return (
									<li key={index}>
										<InputItem
											// clear
											placeholder="联系人真实姓名"
											type="text"
											defaultValue={item.contactName}
											onBlur={(v) => {
												this.modifyContact(item, v, 'contactName');
												handleInputBlur();
											}}
										/>
										<InputItem
											maxLength="13"
											type="phone"
											// clear
											placeholder="银行卡预留手机号"
											defaultValue={this.formatePhone(item.contactTel)}
											onBlur={(v) => {
												const val = v.replace(/\s*/g, '');
												this.modifyContact(item, val, 'contactTel');
												handleInputBlur();
											}}
										/>
										{/* 选择图标 */}
										<div className={styles.telSelectBox} onClick={() => this.editContactHandler(item)}>
											<i className={styles.telSelect} />
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
				<div className={styles.confirm_btn_box}>
					<ButtonCustom onClick={this.confirmHandler} className={styles.confirm_btn}>
						确认
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
