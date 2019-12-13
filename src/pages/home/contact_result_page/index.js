/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-13 11:40:32
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import ContactResultList from './components/ContactResultList';
import { validators, arrCheckDup } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

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
	editContactHandler = (obj, dataIndex) => {
		buriedPointEvent(home.reContactConfirmModify);
		this.props.history.push({ pathname: '/home/modify_contact_page', state: { ind: dataIndex, ...obj } });
	};

	// 确认按钮点击
	confirmHandler = () => {
		const excConatactList = store.getExcContactList();
		buriedPointEvent(home.reContactSaveClick);
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
			if (excConatactList.includes(seleContactList[i].number)) {
				this.props.toast.info('请不要填写当前注册手机号或紧急联系人手机号', 3);
				return;
			}
		}
		if (!arrCheckDup(seleContactList, 'number')) {
			this.props.toast.info('请输入不同联系人手机号');
			return;
		}
		store.setSaveContactList(seleContactList);
		this.props.history.goBack();
	};

	// 修改联系人信息
	modifyContact = (obj, val, key, dataIndex) => {
		const modifyList = store.getSelContactList();
		modifyList[dataIndex][key] = val;
		this.setState(
			{
				seleContactList: modifyList || []
			},
			() => {
				store.setSelContactList(modifyList);
			}
		);
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
