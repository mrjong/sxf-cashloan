/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-10 10:49:02
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import ContactResultList from './components/ContactResultList';
import { validators, arrCheckDup } from 'utils';

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
		const { seleContactList } = this.state;
		let filterList = seleContactList.filter((item) => {
			return !item.name || !item.number;
		});
		if (filterList.length) {
			this.props.toast.info('请添加满5个指定联系人');
			return;
		}
		for (var i = 0; i < seleContactList.length; i++) {
			if (!validators.phone(seleContactList[i].number)) {
				this.props.toast.info('请输入有效手机号');
				return;
			}
		}
		if (!arrCheckDup(seleContactList, 'number')) {
			this.props.toast.info('请输入不同联系人手机号');
			return;
		}
		store.setSaveContactList(true);
		this.props.history.goBack();
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
						toast={this.props.toast}
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
