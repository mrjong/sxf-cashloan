/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-09 16:25:27
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
import { setBackGround } from 'utils/background';

@setBackGround('#fff')
export default class modify_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contactList: []
		};
	}
	componentWillMount() {
		const contactList = store.getContactList();
		const unSeleContactList = contactList.filter((item) => {
			return !item.isMarked;
		});
		this.setState({
			contactList: unSeleContactList || []
		});
	}
	componentDidMount() {}
	componentWillUnmount() {}

	// 选择联系人
	selectContact = (obj) => {
		const { contactList } = this.state;
		const changeList = [];
		contactList.map((item) => {
			item.isMarked = false;
			if (obj.uniqMark === item.uniqMark) {
				item.isMarked = true;
			}
			changeList.push(item);
		});
		this.setState({
			contactList: changeList
		});
	};

	// 确认按钮点击
	confirmHandler = () => {
		const seleContactList = this.getSeleList();
		const allContactList = store.getContactList();
		const seleAllContactList = store.getSelContactList();
		const modifyItem = this.props.history.location.state && this.props.history.location.state.uniqMark;
		const selectIndex = seleAllContactList.findIndex((item) => {
			return item.uniqMark === modifyItem;
		});
		if (seleContactList.length) {
			allContactList.map((item) => {
				// 当前修改的下次还可以选择
				if (modifyItem === item.uniqMark) {
					item.isMarked = false;
				}
				if (item.uniqMark === seleContactList[0].uniqMark) {
					item.isMarked = true;
				}
			});
			seleAllContactList[selectIndex] = seleContactList[0];
			store.setContactList(allContactList);
			store.setSelContactList(seleAllContactList);
		} else {
			this.props.toast.info('请勾选一个推荐联系人');
		}
		this.props.history.goBack();
	};

	// 选中的联系人列表
	getSeleList = () => {
		let selectedList = [];
		const { contactList } = this.state;
		selectedList = contactList.filter((item) => {
			return item.isMarked;
		});
		return selectedList;
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

	render() {
		const { contactList } = this.state;
		return (
			<div className={styles.modify_contact_page}>
				{contactList.length ? (
					<div className={styles.contact_list_box}>
						<p className={styles.contact_desc}>
							勾选联系人授权于我们，在紧急联系人无法接通时，用于与您取得联系
						</p>
						<ul className={styles.contact_list}>
							{contactList.map((item, index) => {
								return (
									<li
										key={index}
										onClick={() => this.selectContact(item)}
										className={item.isMarked ? styles.activeStyle : ''}
									>
										<div className={styles.left_part}>
											<i className={styles.select_ico} />
											<span className={styles.contact_name}>{item.contactName}</span>
										</div>
										<span className={styles.contact_tel}>{this.formatePhone(item.contactTel)}</span>
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
				<div className={styles.confirm_btn_box}>
					<ButtonCustom
						onClick={this.confirmHandler}
						className={
							this.getSeleList().length
								? styles.confirm_btn
								: [styles.confirm_btn, styles.disabled_confirm_btn].join(' ')
						}
					>
						保存
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
