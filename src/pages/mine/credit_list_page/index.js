import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import dayjs from 'dayjs';
import fetch from 'sx-fetch';
import qs from 'qs';
import styles from './index.scss';
import { Popover, Icon } from 'antd-mobile';
import select from './img/select.png';
import not_select from './img/not_select.png';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import arrow from './img/arrow.png';
import { getMoxieData } from 'utils';
import FeedbackModal from 'components/FeedbackModal';
import mock from './mock.js';
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
			cardList: [],
      resultLength: '',
      showFeedbackModal: false
		};
	}
	componentWillMount() {
    this.queryBankList();
    this.showFeedbackModal()
	}
	componentWillUnmount() {
		store.removeBackUrl();
	}

	// 获取信用卡银行卡列表
	queryBankList = () => {
		this.props.$fetch
			.post(API.CREDCARDLIST, {
				type: '01'
			})
			.then(
				(res) => {
					if (res.msgCode === 'PTM0000') {
						this.setState({
							// cardList: mock.data.result,
							cardList: res.data && res.data.result ? res.data.result : [],
							resultLength: (res.data && res.data.resultLength) || 0
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
	goMoxieBankList = () => {
		store.setToggleMoxieCard(true);
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		this.props.history.push('/home/moxie_bank_list_page');
	};
	// 新增授权卡
	goToNewMoXie = () => {
		buriedPointEvent(home.addCreditCard);
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
		buriedPointEvent(home.addCreditCard);
  };

  showFeedbackModal = () => {
		if (store.getGotoMoxieFlag()) {
			this.setState({
				showFeedbackModal: true
			});
		}
	};

	closeFeedbackModal = () => {
		this.setState({
			showFeedbackModal: false
		});
		store.removeGotoMoxieFlag();
	};

	render() {
		let { autId, showFeedbackModal } = this.state;
		console.log(autId, 'autId');
		return (
			<div className={styles.credit_list_page}>
				{this.state.cardList.length ? (
					<div>
						{this.state.resultLength === 0 ? (
							<div
								className={styles.noCardTip}
								onClick={() => {
									this.setState({
										resultLength: 1
									});
								}}
							/>
						) : null}

						<div className={[ styles.card_tit ].join(' ')}>
							选择收款信用卡
							<div
								onClick={this.goToNewMoXie}
								className={[
									styles.addCard,
									`${this.state.resultLength === 0 ? styles.noCardTip_ : ''}`
								].join(' ')}
							>
								<i />添加信用卡
								{this.state.resultLength === 0 ? (
									<div className={styles.imgbox}>
										<img src={arrow} />
										<span className={styles.text}>当前卡片均不支持，请添加其他信用卡</span>
									</div>
								) : null}
							</div>
						</div>
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
										onClick={() => {
											item.operationMark === '01' ? this.selectCard(item) : () => {};
										}}
									>
										<div className={styles.cardContainer}>
											<div
												className={`${item.operationMark === '00'
													? styles.dis
													: ''} ${isSelected ? styles.active : ''} ${styles.cardBox} `}
											>
												<div className={styles.bankNameBox}>
													<span className={`${icoClass} ${styles.bank_icon}`} />
													<span className={styles.bank_name}>{item.bankName}</span>
													<div className={styles.subTitle}>
														{item.operationMark === '00' &&
															((item.persionCheck === '00' && '非本人卡') ||
																(item.cardBinSupport === '00' && '暂不支持该信用卡') ||
																(item.cardBillCheck === '00' && '新卡未生成账单') ||
																(item.moneyCheck === '00' && `最低可借${item.minProd}元`))}
														{item.operationMark === '00' ? (
															<Popover
																placement="bottomRight"
																overlayClassName="credit_list_pagePopover"
																visible={false}
																overlay={[
																	<p className={styles.Popover}>
																		{(item.persionCheck === '00' &&
																			'仅支持本人名下信用卡借款，请更换其他信用卡或添加本人名下其他收款信用卡。') ||
																			(item.cardBinSupport === '00' &&
																				'暂不支持该类型信用卡，请添加其他银联信用卡。') ||
																			(item.cardBillCheck === '00' &&
																				'该信用卡暂未生成账单，请添加其他信用卡或生成账单后使用还到。') ||
																			(item.moneyCheck === '00' &&
																				`还到最低可借款金额${item.minProd}元，请添加其他收款信用卡。`)}
																	</p>
																]}
															>
																<span className={styles.wenhao}>
																	<i />
																</span>
															</Popover>
														) : null}
													</div>
												</div>
												<div className={styles.surplus_desc}>信用卡剩余应还金额(元)</div>
												<div className={styles.bill_remain_amt}>
													{(item.autSts !== '2' && item.operationMark === '01') ||
													(item.operationMark === '01' && item.cardBillSts === '02') ||
													(item.operationMark === '01' && item.cardBillSts === '00') ? (
														<span style={{ fontSize: '.6rem' }}>需更新账单</span>
													) : item.cardBillCheck === '00' &&
													item.operationMark === '00' &&
													item.persionCheck !== '00' &&
													item.cardBinSupport !== '00' ? (
														<span style={{ fontSize: '.6rem' }}>----.--</span>
													) : item.billRemainAmt && !isNaN(item.billRemainAmt) ? (
														(item.billRemainAmt > 0 &&
															parseFloat(Number(item.billRemainAmt) * 100 / 100).toFixed(
																2
															)) ||
														'已结清'
													) : item.billRemainAmt === 0 ? (
														'已结清'
													) : !isNaN(item.cardBillAmt) ? (
														(item.cardBillAmt > 0 &&
															parseFloat(Number(item.cardBillAmt) * 100 / 100).toFixed(
																2
															)) ||
														'已结清'
													) : (
														item.cardBillAmt
													)}
												</div>
												{(item.autSts !== '2' && item.operationMark === '01') ||
												(item.cardBillSts === '02' && item.operationMark === '01') ||
												(item.cardBillSts === '00' && item.operationMark === '01') ? (
													<div
														onClick={// 跳银行登录页面
														() => {
															getMoxieData({
																bankCode: item.bankNo,
																$props: this.props,
																goMoxieBankList: this.goMoxieBankList
															});
														}}
														className={styles.updateBtn}
													>
														更新账单
													</div>
												) : null}

												<span>
													<span className={styles.bank_number}>
														{item.beforeCard4No ? (
															<span style={{ marginRight: '.2rem' }}>
																{item.beforeCard4No}
															</span>
														) : (
															<span style={{ marginRight: '.2rem' }}>****</span>
														)}

														<span style={{ marginRight: '.2rem' }}>****</span>
														<span style={{ marginRight: '.2rem' }}>****</span>

														{item.last ? <span>{item.last}</span> : <span>****</span>}
													</span>
													<span className={styles.bank_date}>
														还款日：{(item.autSts !== '2' && item.operationMark === '01') ||
														(item.cardBillSts === '02' && item.operationMark === '01') ||
														(item.cardBillSts === '00' && item.operationMark === '01') ? (
															'待更新'
														) : item.cardBillCheck === '00' &&
														item.operationMark === '00' &&
														item.persionCheck !== '00' &&
														item.cardBinSupport !== '00' ? (
															'----/--/--'
														) : (
															(item.cardBillDt &&
																dayjs(item.cardBillDt).format('YYYY/MM/DD')) ||
															'----/--/--'
														)}
													</span>
												</span>
												{item.operationMark === '01' && isSelected ? (
													<img src={select} className={styles.select_icon} />
												) : null}
												{item.operationMark === '01' && !isSelected ? (
													<img src={not_select} className={styles.select_icon} />
												) : null}
											</div>
											{(item.autSts !== '2' && item.operationMark === '01') ||
                      (item.cardBillSts === '02' && item.operationMark === '01') ||
                      (item.cardBillSts === '00' && item.operationMark === '01') ? (
												<div className={styles.desc}>部分银行存在账单日当天无法更新账单情况，可选择其他信用卡或次日重新更新。</div>
											) : null}
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
        <FeedbackModal
					history={this.props.history}
					toast={this.props.toast}
					visible={showFeedbackModal}
					closeModal={this.closeFeedbackModal}
				/>
			</div>
		);
	}
}
