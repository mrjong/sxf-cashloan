/*
 * @Author: sunjiankun
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-03-23 14:07:58
 */
import React from 'react';
import { InputItem } from 'antd-mobile';
import { handleInputBlur, validators } from 'utils';
import styles from './index.scss';
import { connect } from 'react-redux';

@connect(
	(state) => ({
		cacheContact: state.staticState.cacheContact
	}),
	{}
)
export default class ContactResultList extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {}

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

	// 校验手机号
	validatePhone = (value) => {
		if (!validators.phone(value)) {
			this.props.toast.info('请输入有效手机号');
		}
	};

	render() {
		const { editContactHandler, isCanSelect, changeContact, cacheContact } = this.props;
		return (
			<div className={styles.contact_list_box}>
				<ul className={styles.contact_list}>
					{cacheContact && cacheContact.length
						? cacheContact.map((item, index) => {
								return (
									<li key={index}>
										<InputItem
											// clear
											placeholder="输入联系人姓名"
											type="text"
											defaultValue={item.name}
											onBlur={() => {
												handleInputBlur();
											}}
											onChange={(v) => {
												changeContact && changeContact(item, v, 'name', index);
											}}
											className={isCanSelect ? 'hasIcon' : ''}
										/>
										<InputItem
											maxLength="13"
											type="phone"
											// clear
											placeholder="输入联系人手机号"
											defaultValue={this.formatePhone(item.number)}
											onBlur={() => {
												handleInputBlur();
												// this.validatePhone(v);
											}}
											onChange={(v) => {
												const val = v.replace(/\s*/g, '');
												changeContact && changeContact(item, val, 'number', index);
											}}
											className={isCanSelect ? 'hasIcon' : ''}
										/>
										{/* 选择图标 */}
										{isCanSelect ? (
											<div
												className={styles.telSelectBox}
												onClick={() => editContactHandler && editContactHandler(item, index)}
											>
												<i className={styles.telSelect} />
											</div>
										) : null}
									</li>
								);
						  })
						: null}
				</ul>
			</div>
		);
	}
}
