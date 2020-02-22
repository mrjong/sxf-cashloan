/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-02-22 15:24:45
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';
import ButtonCustom from 'components/ButtonCustom';
// import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { connect } from 'react-redux';
import { setCacheContactAction } from 'reduxes/actions/commonActions';

// @setBackGround('#fff')
@connect(
	(state) => ({
		confirmAgencyInfo: state.commonState.confirmAgencyInfo,
		cacheContact: state.commonState.cacheContact
	}),
	{
		setCacheContactAction
	}
)
export default class modify_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contactList: []
		};
	}
	componentWillMount() {
		const { confirmAgencyInfo = {}, cacheContact = [] } = this.props;
		const contactList = (confirmAgencyInfo.repayInfo && confirmAgencyInfo.repayInfo.contacts) || [];
		const selContactList = cacheContact;
		let unSeleContactList = contactList.filter(
			(item) => !selContactList.some((ele) => ele.number === item.number)
		);
		unSeleContactList.map((item) => {
			item.isMarked = false;
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
		buriedPointEvent(home.speContactSaveClick);
		const seleContactList = this.getSeleList();
		const { cacheContact = [] } = this.props;
		const seleAllContactList = cacheContact;
		const { ind } = this.props.history.location.state;
		if (seleContactList.length) {
			const seleContactList2 = [
				...seleAllContactList.slice(0, ind),
				{ ...seleContactList[0] },
				...seleAllContactList.slice(ind + 1)
			];
			this.props.setCacheContactAction(seleContactList2);
		} else {
			this.props.toast.info('请勾选一个推荐联系人');
			return;
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
							签约前请勾选联系人授权于我们，当紧急联系人无法接通时，我们将通过下方选择的授权联系人与您取得联系
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
											<span className={styles.contact_name}>{item.name}</span>
										</div>
										<span className={styles.contact_tel}>{this.formatePhone(item.number)}</span>
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
