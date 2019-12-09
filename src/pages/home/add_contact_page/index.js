/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-09 18:26:27
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import ContactResultList from '../contact_result_page/components/ContactResultList';

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
		const contactList = store.getSelContactList();
		this.setState({
			seleContactList: contactList || [
				{ name: '', number: '' },
				{ name: '', number: '' },
				{ name: '', number: '' },
				{ name: '', number: '' },
				{ name: '', number: '' }
			]
		});
	}
	componentDidMount() {}
	componentWillUnmount() {}

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

	render() {
		const { seleContactList } = this.state;
		return (
			<div className={styles.contact_result_page}>
				{seleContactList.length ? (
					<ContactResultList
						isCanSelect={false}
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
