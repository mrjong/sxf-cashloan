/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-09 18:12:45
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import ContactResultList from './components/ContactResultList';

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
		const seleContactList =
			contactList &&
			contactList.filter((item) => {
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
		this.props.history.goBack();
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

	// 查看是否更改
	checkModify = (obj) => {
		const contactList = store.getContactList();
		const seletedContactList = store.getSelContactList();
		contactList.map((item) => {
			if (item.uniqMark === obj.uniqMark) {
				if (obj.name === item.name && obj.number === item.number) {
					item.isMarked = true;
				} else {
					item.isMarked = false;
				}
			} else {
				// 不能选择相同电话号码的人,名称可以一直
				const filterList = seletedContactList.filter((item2) => {
					return item2.uniqMark === item.uniqMark && item2.number === item.number && !item.isMarked;
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
					<ContactResultList
						isCanSelect={true}
						editContactHandler={this.editContactHandler}
						modifyContact={this.modifyContact}
						seleContactList={seleContactList}
					/>
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
