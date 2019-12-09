/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-09 18:26:13
 */
import React from 'react';
import { InputItem } from 'antd-mobile';
import { handleInputBlur } from 'utils';
import styles from './index.scss';

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

	render() {
		const { seleContactList, modifyContact, editContactHandler, isCanSelect } = this.props;
		return (
			<div className={styles.contact_list_box}>
				<ul className={styles.contact_list}>
					{seleContactList.map((item, index) => {
						return (
							<li key={index}>
								<InputItem
									// clear
									placeholder="输入联系人姓名"
									type="text"
									defaultValue={item.name}
									onBlur={(v) => {
										modifyContact && modifyContact(item, v, 'name');
										handleInputBlur();
									}}
									className={isCanSelect ? 'hasIcon' : ''}
								/>
								<InputItem
									maxLength="13"
									type="phone"
									// clear
									placeholder="输入联系人手机号"
									defaultValue={this.formatePhone(item.number)}
									onBlur={(v) => {
										const val = v.replace(/\s*/g, '');
										modifyContact && modifyContact(item, val, 'number');
										handleInputBlur();
									}}
									className={isCanSelect ? 'hasIcon' : ''}
								/>
								{/* 选择图标 */}
								{isCanSelect ? (
									<div
										className={styles.telSelectBox}
										onClick={() => editContactHandler && editContactHandler(item)}
									>
										<i className={styles.telSelect} />
									</div>
								) : null}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}
