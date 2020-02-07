/*
 * @Author: shawn
 * @LastEditTime : 2020-02-07 17:48:17
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import qs from 'qs';
import { store } from 'utils/store';
import { bank_card_valid } from 'fetch/api';
import { connect } from 'react-redux';
import { setBindDepositInfoAction } from 'reduxes/actions/commonActions';
import { setBackGround } from 'utils/background';

let queryData = '';
@fetch.inject()
@setBackGround('#fff')
@connect(
	(state) => ({
		bindDepositInfo: state.commonState.bindDepositInfo
	}),
	{
		setBindDepositInfoAction
	}
)
export default class support_save_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			cardList: []
		};
	}
	componentWillMount() {
		this.queryBankList();
		queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
	}

	// 获取银行卡列表
	queryBankList = () => {
		this.props.$fetch.get(`${bank_card_valid}/D`).then(
			(res) => {
				if (res.code === '000000') {
					this.setState({
						cardList: res.data && res.data.validBanks ? res.data.validBanks : []
					});
				} else {
					res.message && this.props.toast.info(res.message);
				}
			},
			(error) => {
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	handleItemSelect = (name) => {
		const { bindDepositInfo } = this.props;
		if (queryData.isClick !== '0') return;
		this.props.setBindDepositInfoAction({
			...bindDepositInfo,
			bankName: name
		});
		// store.setDepositBankName(name);
		this.props.history.goBack();
	};

	render() {
		return (
			<div className={styles.support_save_page}>
				{this.state.cardList.length ? (
					<ul className={styles.card_list}>
						{this.state.cardList.map((item, index) => {
							return (
								<li
									key={index}
									onClick={() => {
										this.handleItemSelect(item.bankName);
									}}
								>
									<span className={`bank_ico bank_ico_${item.bankCode}`}></span>
									<span className={styles.bank_name}>{item.bankName}</span>
								</li>
							);
						})}
					</ul>
				) : null}
			</div>
		);
	}
}
