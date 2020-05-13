import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import { bank_card_valid } from 'fetch/api.js';

@fetch.inject()
export default class support_credit_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			cardList: []
		};
	}
	componentWillMount() {
		this.queryBankList();
	}

	// 获取银行卡列表
	queryBankList = () => {
		this.props.$fetch.get(`${bank_card_valid}/C`).then(
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

	renderBankIcon(bankIcon, bankCode, size = '0.6rem') {
		if (bankIcon) {
			return <img style={{ width: size, height: size, verticalAlign: 'middle' }} src={bankIcon} />;
		}
		return <span className={`bank_ico bank_ico_${bankCode}`} />;
	}

	render() {
		return (
			<div className={styles.support_credit_page}>
				{this.state.cardList.length ? (
					<ul className={styles.card_list}>
						{this.state.cardList.map((item, index) => {
							return (
								<li key={index}>
									{this.renderBankIcon(item.bankIcon, item.bankCode)}
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
