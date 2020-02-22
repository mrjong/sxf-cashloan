/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-02-22 15:24:38
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
		confirmAgencyInfo: state.commonState.confirmAgencyInfo
	}),
	{
		setCacheContactAction
	}
)
export default class reco_contact_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contactList: []
		};
	}
	componentWillMount() {
		const { confirmAgencyInfo = {} } = this.props;
		this.setState({
			contactList: confirmAgencyInfo.repayInfo && confirmAgencyInfo.repayInfo.contacts
		});
	}
	componentDidMount() {}
	componentWillUnmount() {}

	// 选择联系人
	selectContact = (obj) => {
		const { contactList } = this.state;
		const changeList = [];
		const selectedList = contactList.filter((item) => {
			return item.isMarked;
		});
		// 用户点击已选中的取消选中,点击未选中的如果大于五个则提示
		if (!obj.isMarked && selectedList.length >= 5) {
			this.props.toast.info('最多只能勾选5个推荐联系人');
			return;
		}
		contactList.map((item) => {
			if (obj.uniqMark === item.uniqMark) {
				item.isMarked = !item.isMarked;
			}
			changeList.push(item);
		});
		this.setState({
			contactList: changeList
		});
	};

	// 确认按钮点击
	confirmHandler = () => {
		buriedPointEvent(home.reContactConfirmClick);

		const selectedList = this.getSeleList();
		if (selectedList.length < 5) {
			this.props.toast.info('请勾选满5个指定联系人');
		} else {
			this.props.setCacheContactAction(selectedList);
			this.props.history.replace('/home/contact_result_page');
		}
	};

	// 选中的联系人列表
	getSeleList = () => {
		let selectedList = [];
		const { contactList } = this.state;
		selectedList = contactList.filter((item) => item.isMarked);
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
			<div className={styles.reco_contact_page}>
				{contactList.length ? (
					<div className={styles.contact_list_box}>
						<p className={styles.contact_tit}>请勾选5个联系人</p>
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
							this.getSeleList().length < 5
								? [styles.confirm_btn, styles.disabled_confirm_btn].join(' ')
								: styles.confirm_btn
						}
					>
						确认
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
