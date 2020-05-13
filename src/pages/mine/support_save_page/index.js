/*
 * @Author: shawn
 * @LastEditTime : 2020-02-18 17:19:48
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import qs from 'qs';
import Image from 'assets/image';
import { bank_card_valid } from 'fetch/api';
import { LoadingView } from 'components';

import { connect } from 'react-redux';
import { setBindDepositInfoAction } from 'reduxes/actions/commonActions';
import { setBackGround } from 'utils/background';
const noData = {
	img: Image.bg.no_order,
	text: '暂无账单',
	width: '100%',
	height: '100%'
};
const errorData = {
	img: Image.bg.no_network,
	text: '网络错误,点击重试'
};
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
					this.viewRef && this.viewRef.showDataView();
					this.setState({
						cardList: res.data && res.data.validBanks ? res.data.validBanks : []
					});
				} else {
					this.viewRef && this.viewRef.setEmpty();
					res.message && this.props.toast.info(res.message);
				}
			},
			(error) => {
				this.viewRef && this.viewRef.setEmpty();
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
		this.props.history.goBack();
	};

	renderBankIcon(bankIcon, bankCode, size = '0.6rem') {
		if (bankIcon) {
			return <img style={{ width: size, height: size, verticalAlign: 'middle' }} src={bankIcon} />;
		}
		return <span className={`bank_ico bank_ico_${bankCode}`} />;
	}

	render() {
		return (
			<LoadingView
				ref={(view) => (this.viewRef = view)}
				nodata={noData}
				errordata={errorData}
				onReloadData={() => {
					this.onRefresh();
				}}
			>
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
										{this.renderBankIcon(item.bankIcon, item.bankCode)}
										<span className={styles.bank_name}>{item.bankName}</span>
									</li>
								);
							})}
						</ul>
					) : null}
				</div>
			</LoadingView>
		);
	}
}
