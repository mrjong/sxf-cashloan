/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-13 11:42:37
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import ContactResultList from '../contact_result_page/components/ContactResultList';
import { validators, arrCheckDup } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

@setBackGround('#fff')
@createForm()
export default class add_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seleContactList: []
		};
	}
	componentWillMount() {
		const contactList = store.getSelEmptyContactList();
		this.setState({
			seleContactList: contactList || [
				{ name: '', number: '', uniqMark: 'uniq0' },
				{ name: '', number: '', uniqMark: 'uniq1' },
				{ name: '', number: '', uniqMark: 'uniq2' },
				{ name: '', number: '', uniqMark: 'uniq3' },
				{ name: '', number: '', uniqMark: 'uniq4' }
			]
		});
	}
	componentDidMount() {}
	componentWillUnmount() {}

	// 确认按钮点击
	confirmHandler = () => {
		const excConatactList = store.getExcContactList();
		buriedPointEvent(home.speContactConfirmClick);
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
		store.setSaveEmptyContactList(seleContactList);
		this.props.history.goBack();
	};

	// 修改联系人信息
	modifyContact = (obj, val, key, dataIndex) => {
		const { seleContactList } = this.state;
		seleContactList[dataIndex][key] = val;
		store.setSelEmptyContactList(seleContactList);
	};

	render() {
		const { seleContactList } = this.state;
		return (
			<div className={styles.contact_result_page}>
				{seleContactList.length ? (
					<ContactResultList
						isCanSelect={false}
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