/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 15:05:59
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { Toast, Popover } from 'antd-mobile';
// import qs from 'qs';
import styles from './index.scss';
import { ButtonCustom, LoadingView } from 'components';
import { connect } from 'react-redux';
import { setAuthId } from 'reduxes/actions/staticActions';
// import { Popover } from 'antd-mobile';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { activeConfigSts } from 'utils';
import { cred_queryCredCard, cred_cacheCredCard } from 'fetch/api';
import mark_question from './img/mark_question@3x.png';
import card_select_yellow from './img/card_select_yellow.png';
import Image from 'assets/image';

const noData = {
	img: Image.bg.no_order,
	text: '暂无银行卡',
	width: '100%',
	height: '100%'
};
const errorData = {
	img: Image.bg.no_network,
	text: '网络错误,点击重试'
};
@setBackGround('#F7F8FA')
@fetch.inject()
@connect(
	() => ({}),
	{ setAuthId }
)
export default class credit_list_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			autId: '', // 账单id
			cardList: [],
			resultLength: ''
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
		this.props.$fetch.post(cred_queryCredCard).then(
			(res) => {
				if (res.code === '000000') {
					this.setState(
						{
							cardList: res.data && res.data.cards ? res.data.cards : [],
							resultLength: (res.data && res.data.count) || 0
						},
						() => {
							if (res.data && res.data.cards && res.data && res.data.cards.length > 0) {
								this.viewRef && this.viewRef.showDataView();
							} else {
								this.viewRef && this.viewRef.setEmpty();
							}
						}
					);
				} else {
					this.viewRef && this.viewRef.setEmpty();
				}
			},
			(error) => {
				this.viewRef && this.viewRef.setEmpty();
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	// // 选择银行卡
	// selectCard = (obj) => {
	// 	this.setState({
	// 		autId: obj.autId
	// 	});
	// 	// 如果选择的是同一张卡则不清除session里的RepaymentModalData
	// 	const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
	// 	if (queryData.autId && queryData.autId !== obj.autId) {
	// 		store.removeRepaymentModalData();
	// 	}
	// };
	handleVisibleChange = (visible) => {
		this.setState({
			visible
		});
	};
	// 告诉后台选中的是哪张卡
	sendSelectedCard = async (autId) => {
		if (!autId) {
			Toast.info('请选择一张你需要还款的信用卡');
			return;
		}
		this.props.$fetch
			.post(`${cred_cacheCredCard}`, {
				autId
			})
			.then(
				(res) => {
					if (res.code === '000000') {
						// 更换authid
						this.props.setAuthId(autId);
						this.props.history.push('/home/loan_repay_confirm_page');
					} else {
						res.message && Toast.info(res.message);
					}
				},
				(error) => {
					error.message && Toast.info(error.message);
				}
			);
	};
	// 新增授权卡
	goToNewMoXie = async (type) => {
		store.setGotoMoxieFlag(true);
		if (type === 'add') {
			buriedPointEvent(home.addCreditCard);
		}
		activeConfigSts({
			$props: this.props,
			type: 'B'
		});
	};
	// 选择银行卡
	selectCard = (obj) => {
		if (obj.persionCheck === '00' || obj.cardBinSupport === '00' || obj.cardBillSts !== '01') {
			return;
		}
		this.setState({
			autId: obj.autId
		});
	};
	renderItem = (item, index) => {
		let tipText = '';
		let tipDesc = '';
		if (item.persionCheck === '01') {
			tipText = '非本人卡';
			tipDesc = '仅支持本人名下信用卡借款，请更换其他信用卡或添加本人名下其他收款信用卡。';
		} else if (item.cardBinSupport === '00') {
			tipText = '暂不支持该信用卡';
			tipDesc = '暂不支持该类型信用卡，请添加其他收款信用卡。';
		}
		let cardBillSts = item.cardBillSts === '01'; // 00 || 02 需要更新，01:无需更新
		const icoClass = `bank_ico bank_ico_${item.bankNo}`;
		const isSelected = this.state.autId === item.autId;
		const isDisable = tipText || !cardBillSts;
		return (
			<div
				className={[styles.newCardBoxContainer, isSelected ? styles.selectedLine : ''].join(' ')}
				onClick={() => {
					this.selectCard(item);
				}}
			>
				<div className={styles.newCardBox}>
					<div className={styles.newCardLeftBox}>
						<span className={`${icoClass} ${styles.bank_icon} ${isDisable ? styles.isDisable : ''}`} />
						<div className={styles.leftTextBox}>
							<span className={[styles.leftTextTop, isDisable ? styles.isDisable : ''].join(' ')}>
								{item.bankName}(<span className={styles.leftTextTopNum}>{item.lastNo}</span>)
							</span>
							<span className={[styles.leftTextBottom, isDisable ? styles.isDisable : ''].join(' ')}>
								{!cardBillSts
									? '需更新账单'
									: (item.cardBillAmt && `信用卡剩余应还${item.cardBillAmt.toFixed(2)}`) || '----.--'}
							</span>
						</div>
					</div>
					{tipText ? (
						<div className={styles.newCardRightBox}>
							<span className={styles.RightText}>{tipText}</span>

							<Popover
								overlayClassName="fortest"
								overlayStyle={{ color: 'currentColor' }}
								visible={this.state.visible}
								overlay={[<div className={styles.popBoxTip}>111</div>]}
								align={{
									overflow: { adjustY: 0, adjustX: 0 },
									offset: [-10, 0]
								}}
								onVisibleChange={this.handleVisibleChange}
							>
								<div className={styles.popBox}>
									<img src={mark_question} className={styles.RightIcon} />
								</div>
							</Popover>
							{/* <div
								onClick={() => {
									this[`btnA${index}`].measure((fx, fy, width, height, px, py) => {
										this.setState({
											offsetX: px + 40,
											offsetY: py - 30,
											tipDesc
										});
										this._popoverA.open().catch((e) => {
											console.log(e);
										});
									});
								}}
								ref={(c) => {
									this[`btnA${index}`] = c;
								}}
							>

							</div> */}
						</div>
					) : (
						!cardBillSts && (
							<div className={styles.newCardRightBox}>
								<ButtonCustom
									size="md"
									onClick={
										// 跳银行登录页面
										() => {
											// buidSts 01 绑定成功 可以直接更新
											let param = {};
											if (item.buidSts === '01') {
												param.autId = item.autId;
												param.cardNoHid = item.cardNoHid;
											}
											activeConfigSts({
												$props: this.props,
												type: 'B'
											});
										}
									}
								>
									更新账单
								</ButtonCustom>
							</div>
						)
					)}
				</div>
				{isSelected ? <img src={card_select_yellow} className={[styles.selectedIco]} /> : null}
			</div>
		);
	};

	render() {
		let { autId } = this.state;
		console.log(autId, 'autId');
		return (
			<div className={styles.credit_list_page}>
				{this.state.cardList.length ? (
					<div>
						<div className={styles.top_box}>
							<div className={[styles.card_tit].join(' ')}>选择收款信用卡</div>
							<div
								onClick={() => {
									this.goToNewMoXie('add');
								}}
								className={[styles.addCard].join(' ')}
							>
								<i />
								<span>添加信用卡</span>
							</div>
						</div>
						<LoadingView
							ref={(view) => (this.viewRef = view)}
							nodata={noData}
							errordata={errorData}
							onReloadData={() => {
								this.queryBankList();
							}}
						>
							<ul
								className={styles.card_list}
								style={this.state.cardList.length > 2 ? { paddingBottom: '2.5rem' } : {}}
							>
								{this.state.cardList.map((item, index) => {
									return <div key={item.autId}>{this.renderItem(item, index)}</div>;
								})}
							</ul>
						</LoadingView>
					</div>
				) : null}
				<div className={styles.handle_authority}>
					<ButtonCustom
						type={autId ? 'yellow' : 'default'}
						className={styles.button}
						onClick={() => {
							this.sendSelectedCard(autId);
						}}
					>
						确认
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
