import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import WalletBg from 'assets/images/mine/wallet/wallet_bg.png';
import rightArrow from 'assets/images/mine/wallet/right_arrow.png';
import ButtonCustom from 'components/ButtonCustom';
import { getDeviceType } from 'utils';
import { Modal } from 'antd-mobile';
import { store } from 'utils/store';

let bankCardInf = null;

const API = {
	myRedAccount: '/redAccount/myRedAccount',
	cardList: '/my/card/list',
	cashApply: '/redAccount/cashApply'
};
@fetch.inject()
export default class wallet_page extends PureComponent {
	constructor(props) {
		super(props);
		bankCardInf = store.getCardData();
		store.removeCardData();

		this.state = {
			accountNum: '', // 账户余额
			showMoudle: false,
			miniAmount: '', // 最低可提现金额
			maxAmount: '', // 最高可提现金额
			bankInf: {} // 银行卡信息
		};
	}
	componentWillMount() {
		this.getAccountNum();
	}
	componentDidMount() {}
	componentWillUnmount() {}
	// 获取账户余额
	getAccountNum = () => {
		this.props.$fetch.post(API.myRedAccount).then(
			(result) => {
				if (result.msgCode !== 'PTM0000') {
					result.msgInfo && this.props.toast.info(result.msgInfo);
					return;
				}
				if (result && result.data !== null) {
					if (bankCardInf) {
						this.setState({
							bankInf: bankCardInf,
							showMoudle: true
						});
					}
					this.setState({
						accountNum: Number(result.data.acAmt).toFixed(2),
						miniAmount: result.data.minAMt,
						maxAmount: result.data.maxAmt,
					});
				}
			},
			(err) => {
				err.msgInfo && this.props.toast.info(err.msgInfo);
			}
		);
	};
	// 点击提现
	withdrawHandler = () => {
		this.checkCard();
	};
	// 判断是否绑卡
	checkCard = () => {
		//提交申请 判断是否绑定储蓄卡
		this.getBankInf();
	};

	// 获取用户储蓄卡信息
	getBankInf = () => {
		let { accountNum, miniAmount, maxAmount } = this.state;
		if(miniAmount === null || maxAmount === null){
			this.props.toast.info('暂不能提现');
			return;
		}
		// 参数
		const params = {
			type: '2', //储蓄卡卡类型
			corpBusTyp: '01' //01：银行卡鉴权
		};
		this.props.$fetch.post(API.cardList, params).then(
			(data) => {
				if (data.msgCode !== 'PTM0000') {
					if(data.msgCode === 'PTM3021' ) {
						this.props.toast.info('请绑定储蓄卡', 3, () => {
							store.setBackUrl('/wallet');
							this.props.history.push('/mine/bind_save_page');
						});
					} else {
						data.msgInfo && this.props.toast.info(data.msgInfo);
					}
					return;
				}
				if (data && data.cardList.length > 0) {
					// 金额小于最低可提现金额，则toast提示
					if (accountNum >= miniAmount && accountNum <= maxAmount) {
						if (bankCardInf) {
							this.setState({
								bankInf: bankCardInf
							});
						} else {
							this.setState({
								bankInf: data.cardList[0]
							});
						}
						this.setState({
							showMoudle: true
						});
					} else {
						if(accountNum < miniAmount){
							this.props.toast.info(`最低可提现金额${miniAmount}元`);
						}
						if(accountNum > maxAmount){
							this.props.toast.info(`最高可提现金额${maxAmount}元`);
						}
					}
				} else {
					this.props.toast.info('请绑定储蓄卡', 3, () => {
						store.setBackUrl('/wallet');
						this.props.history.push('/mine/bind_save_page');
					});
				}
			},
			(error) => {
				error.msgInfo && this.props.toast.info(error.msgInfo);
			}
		);
	};
	// 跳转到收入
	goIncome = () => {
		this.props.history.push('/mine/income_page');
	};
	// 跳转到提现
	goWithdraw = () => {
		this.props.history.push('/mine/withdraw_page');
	};

	// 选择银行卡
	selectBank = () => {
		const { bankInf } = this.state;
		store.setBackUrl('/mine/wallet_page');
		this.props.history.push(`/mine/select_save_page?agrNo=${bankInf && bankInf.agrNo}`);
	};

	// 提现申请
	applyCash = () => {
		const { accountNum, bankInf } = this.state;
		const osType = getDeviceType();
		const params = {
			cardAgr: bankInf.agrNo,
			osTyp: osType
		};
		this.props.$fetch.post(API.cashApply, params).then(
			(res) => {
				if (res.msgCode !== 'PTM0000') {
					res.msgInfo && this.props.toast.info(res.msgInfo);
					return;
				}
				this.setState({
					showMoudle: false
				});
				this.props.history.push({pathname:'/mine/withdrawing_page', state: { applyNo : res.data, withdrawMoney: accountNum }});
			},
			(err) => {
				err.msgInfo && this.props.toast.info(err.msgInfo);
			}
		);
	};

	render() {
		let { accountNum, showMoudle, bankInf } = this.state;
		const bankCodeNum = bankInf.bankCode || bankInf.bankCd;
		return (
			<div className={style.wallet_page}>
				<img src={WalletBg} className={style.walletBg} />
				<div className={style.walletTitle}>
					<span className={style.leftPart}>
						<i />当前账户余额
					</span>
					<span className={style.rightPart}>去赚钱</span>
				</div>
				<div className={style.walletCont}>
					<p className={style.money}>
						<span>{accountNum}</span>元
					</p>
					<p className={style.tips}>累计可提现金额</p>
				</div>
				<ButtonCustom className={style.withdrawBtn} onClick={this.withdrawHandler}>
					提现
				</ButtonCustom>
				<div className={style.entryBox}>
					<span className={style.income} onClick={this.goIncome}>
						收入<img src={rightArrow} className={style.rightArrow} />
					</span>
					<span className={style.divideLine} />
					<span className={style.withdraw} onClick={this.goWithdraw}>
						提现<img src={rightArrow} className={style.rightArrow} />
					</span>
				</div>
				<Modal
					popup
					visible={showMoudle}
					onClose={() => {
						this.setState({ showMoudle: false });
					}}
					animationType="slide-up"
					className="walletModal"
				>
					<div className={style.modal_box}>
						<div className={style.modal_title}>
							提现到银行卡<i
								onClick={() => {
									this.setState({ showMoudle: false });
								}}
							/>
						</div>
						<div className={`${style.modal_flex} ${style.with_border}`}>
							<span className={style.modal_label}>提现金额</span>
							<span className={style.modal_value}>{accountNum}元</span>
						</div>
						<div className={style.modal_flex} onClick={this.selectBank}>
							<div className={style.bank_info}>
								<span className={`bank_ico bank_ico_${bankCodeNum}`} />
								<span className={style.bank_name}>{`${bankInf.bankName}(${bankInf.lastCardNo})`}</span>
							</div>
							<i />
						</div>
						<ButtonCustom onClick={this.applyCash} className={style.modal_btn}>
							确定
						</ButtonCustom>
					</div>
				</Modal>
			</div>
		);
	}
}
