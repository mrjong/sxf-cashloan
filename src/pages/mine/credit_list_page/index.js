import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import { Icon } from 'antd-mobile';
import select from './img/select.png'
import not_select from './img/not_select.png'
import { setBackGround } from 'utils/background'
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

const API = {
	CREDCARDLIST: '/index/usrCredCardList', // 银行卡列表
	CARDAUTH: '/auth/cardAuth', // 0404-信用卡授信
	CACHECREDCARD: '/index/cacheCredCard' // 后台缓存信用卡
};

let backUrlData = ''; // 从除了我的里面其他页面进去
@setBackGround('#F7F8FA')
@fetch.inject()
export default class credit_list_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			autId: '', // 账单id
			cardList: []
		};
		backUrlData = store.getBackUrl();
	}
	componentWillMount() {
		this.queryBankList();
	}
	componentWillUnmount() {
		store.removeBackUrl();
	}

	// 获取信用卡银行卡列表
	queryBankList = () => {
		this.props.$fetch.post(API.CREDCARDLIST).then(
			(res) => {
				if (res.msgCode === 'PTM0000') {
					this.setState({
						cardList: res.data ? res.data : []
					});
				} else {
					if (res.msgCode === 'PTM3021') {
						this.setState({
							cardList: []
						});
						return;
					}
					res.msgInfo && this.props.toast.info(res.msgInfo);
				}
			},
			(error) => {
				error.msgInfo && this.props.toast.info(error.msgInfo);
			}
		);
	};

	// 选择银行卡
	selectCard = (obj) => {
		// if (backUrlData) {
		this.setState({
			bankName: obj.bankName,
			// lastCardNo: obj.lastCardNo,
			// bankCode: obj.bankCode,
			autId: obj.autId
		});
		// 如果选择的是同一张卡则不清除session里的RepaymentModalData
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		if (queryData.autId && queryData.autId !== obj.autId) {
			store.removeRepaymentModalData();
		}
		// store.setCardData(obj);
		// }
	};
	// 告诉后台选中的是哪张卡
	sendSelectedCard = (autId) => {
		if (!autId) {
			this.props.toast.info('请选择一张你需要还款的信用卡');
			return;
		}
		this.props.$fetch.get(`${API.CACHECREDCARD}/${autId}`).then(
			(res) => {
				if (res.msgCode === 'PTM0000') {
					this.props.history.replace('/home/loan_repay_confirm_page');
					buriedPointEvent(home.selectCreditCardResult, {
						is_success: true,
						bank_name: this.state.bankName
					})
				} else {
					res.msgInfo && this.props.toast.info(res.msgInfo);
					buriedPointEvent(home.selectCreditCardResult, {
						is_success: false,
						bank_name: this.state.bankName
					})
				}
			},
			(error) => {
				error.msgInfo && this.props.toast.info(error.msgInfo);
			}
		);
	};
	// 新增授权卡
	goToNewMoXie = () => {
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
		buriedPointEvent(home.addCreditCard)
	};

	render() {
		let { autId } = this.state;
		console.log(autId, 'autId');
		return (
			<div className={styles.credit_list_page}>
				{this.state.cardList.length ? (
					<div>
						<p className={styles.card_tit}>选择你需要还款信用卡</p>
						<ul
							className={styles.card_list}
							style={this.state.cardList.length > 2 ? { paddingBottom: '2.5rem' } : {}}
						>
							{this.state.cardList.map((item, index) => {
								const isSelected = this.state.autId === item.autId;
								const icoClass =
									item.autSts === '2' ? `bank_ico bank_ico_${item.bankNo}` : `bank_ico black_logo`;
								return (
									<li
										className={`${isSelected ? styles.active : ''} ${styles.bank_item}`}
										key={index}
										onClick={this.selectCard.bind(this, item)}
									>
										<div className={styles.bankNameBox}>
											<span className={`${icoClass} ${styles.bank_icon}`} />
											{item.autSts === '1' ? (
												<span className={`${styles.bank_name} ${styles.pending}`}>
													审核中 ····
												</span>
											) : item.autSts === '3' ? (
												<span className={`${styles.bank_name} ${styles.failed}`}>审核失败</span>
											) : (
														<span className={styles.bank_name}>{item.bankName}</span>
													)}
										</div>
										<div className={styles.surplus_desc}>信用卡剩余应还金额(元)</div>
										<div className={styles.bill_remain_amt}>
											{item.billRemainAmt ? (
												item.billRemainAmt
											) : item.billRemainAmt === 0 ? (
												'0'
											) : (
														item.cardBillAmt
													)}
										</div>
										{item.autSts === '2' ? (
											<span>
												<span className={styles.bank_number}>
													<span style={{ marginRight: '.2rem' }}>****</span>
													<span style={{ marginRight: '.2rem' }}>****</span>
													<span style={{ marginRight: '.2rem' }}>****</span>
													{item.last}
												</span>
												<span className={styles.bank_date}>还款日：{item.cardBillDt}</span>
											</span>
										) : null}
										{isSelected ? (
											<img src={select} className={styles.select_icon} />
										) : (
												<img src={not_select} className={styles.select_icon} />
											)}
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
				<div className={styles.handle_authority}>
					<div
						className={styles.button}
						onClick={() => {
							this.sendSelectedCard(autId, true);
						}}
					>
						确认
					</div>
					<p onClick={this.goToNewMoXie} className={styles.add_card}>
						新增需要还款信用卡
					</p>
				</div>
			</div>
		);
	}
}
