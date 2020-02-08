/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-02-08 15:33:08
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { createForm } from 'rc-form';
// import { setBackGround } from 'utils/background';
import ContactResultList from './components/ContactResultList';
import { validators, arrCheckDup } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { connect } from 'react-redux';
import { setCacheContactAction, setSaveContactAction } from 'reduxes/actions/commonActions';

// @setBackGround('#fff')
@createForm()
@connect(
	(state) => ({
		confirmAgencyInfo: state.commonState.confirmAgencyInfo,
		cacheContact: state.commonState.cacheContact
	}),
	{
		setCacheContactAction,
		setSaveContactAction
	}
)
export default class contact_result_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {}
	componentDidMount() {}
	componentWillUnmount() {}

	// 修改联系人
	editContactHandler = (obj, dataIndex) => {
		buriedPointEvent(home.reContactConfirmModify);
		this.props.history.push({ pathname: '/home/modify_contact_page', state: { ind: dataIndex, ...obj } });
	};

	// 确认按钮点击
	confirmHandler = () => {
		buriedPointEvent(home.reContactSaveClick);
		const { cacheContact, confirmAgencyInfo = {} } = this.props;
		const excConatactList =
			(confirmAgencyInfo.repayInfo && confirmAgencyInfo.repayInfo.excludedContacts) || [];
		let filterList = cacheContact.filter((item) => !item.name || !item.number);
		if (filterList.length) {
			this.props.toast.info('请添加满5个指定联系人');
			return;
		}
		for (var i = 0; i < cacheContact.length; i++) {
			if (!validators.phone(cacheContact[i].number)) {
				this.props.toast.info('请输入有效手机号');
				return;
			}
			if (excConatactList.includes(cacheContact[i].number)) {
				this.props.toast.info('请不要填写当前注册手机号或紧急联系人手机号', 3);
				return;
			}
		}
		if (!arrCheckDup(cacheContact, 'number')) {
			this.props.toast.info('请输入不同联系人手机号');
			return;
		}
		this.props.setSaveContactAction(cacheContact);
		this.props.history.goBack();
	};

	// onchang 时改变state值
	changeContact = (obj, val, key, dataIndex) => {
		const { cacheContact } = this.props;
		let cacheContact2 = [];
		if (cacheContact && cacheContact.length) {
			// cacheContact[dataIndex][key] = val;
			cacheContact2 = [
				...cacheContact.slice(0, dataIndex),
				{ ...cacheContact[dataIndex], [key]: val },
				...cacheContact.slice(dataIndex + 1)
			];
		}
		this.props.setCacheContactAction(cacheContact2);
	};

	render() {
		return (
			<div className={styles.contact_result_page}>
				<ContactResultList
					isCanSelect={true}
					editContactHandler={this.editContactHandler}
					changeContact={this.changeContact}
					toast={this.props.toast}
				/>
				<div className={styles.confirm_btn_box}>
					<ButtonCustom onClick={this.confirmHandler} className={styles.confirm_btn}>
						确认
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
