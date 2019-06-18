import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import { Popover, Icon } from 'antd-mobile';
import select from './img/select.png';
import not_select from './img/not_select.png';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

const API = {
	CREDCARDLIST: '/index/usrCredCardList', // 银行卡列表
	CARDAUTH: '/auth/cardAuth', // 0404-信用卡授信
	CACHECREDCARD: '/index/cacheCredCard' // 后台缓存信用卡
};

@setBackGround('#F7F8FA')
@fetch.inject()
export default class credit_list_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			autId: '', // 账单id
			cardList: []
		};
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
					this.fifterData(res.data);
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
	fifterData = (data) => {
		console.log(data);
	};

	// 选择银行卡
	selectCard = (obj) => {
		this.setState({
			autId: obj.autId
		});
		// 如果选择的是同一张卡则不清除session里的RepaymentModalData
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		if (queryData.autId && queryData.autId !== obj.autId) {
			store.removeRepaymentModalData();
		}
	};
	handleVisibleChange = (visible) => {
		this.setState({
			visible
		});
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
				} else {
					res.msgInfo && this.props.toast.info(res.msgInfo);
				}
			},
			(error) => {
				error.msgInfo && this.props.toast.info(error.msgInfo);
			}
		);
	};
	// 新增授权卡
	goToNewMoXie = () => {
		buriedPointEvent(home.addCreditCard);
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
		buriedPointEvent(home.addCreditCard);
	};

	render() {
		let { autId } = this.state;
		console.log(autId, 'autId');
		return (
			<div className={styles.credit_list_page}>
				{this.state.cardList.length ? (
					<div>
						<p className={styles.card_tit}>
							选择收款信用卡
							<div onClick={this.goToNewMoXie} className={styles.addCard}>
								添加信用卡<i />
							</div>
						</p>
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
										className={` ${styles.bank_item}`}
										key={index}
										onClick={this.selectCard.bind(this, item)}
									>
										<div className={styles.cardContainer}>
											<div
												className={`${isSelected ? styles.dis : ''} ${isSelected
													? styles.active
													: ''} ${styles.cardBox} `}
											>
												<div className={styles.bankNameBox}>
													<span className={`${icoClass} ${styles.bank_icon}`} />
													{item.autSts === '1' ? (
														<span className={`${styles.bank_name} ${styles.pending}`}>
															审核中 ····
														</span>
													) : item.autSts === '3' ? (
														<span className={`${styles.bank_name} ${styles.failed}`}>
															审核失败
														</span>
													) : (
														<span className={styles.bank_name}>{item.bankName}</span>
													)}
													<div className={styles.subTitle}>
														最低可借500元
														<Popover
															placement="bottomRight"
															overlayClassName="credit_list_pagePopover"
															mask
															visible={true}
															overlay={[
																<p className={styles.Popover}>
																	还到最低可借款金额500元，请添加其他收款信用卡。
																</p>
															]}
														>
															<i />
														</Popover>
													</div>
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
												<div className={styles.updateBtn}>更新账单</div>
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
											</div>
											<div className={styles.desc}>部分银行存在账单日当天无法更新账单情况，可选择其他信用卡或次日重新更新。</div>
										</div>
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
				</div>
			</div>
		);
	}
}
