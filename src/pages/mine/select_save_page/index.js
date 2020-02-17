import React, { PureComponent } from 'react';
// import { SwipeAction } from 'antd-mobile';
import { Modal } from 'antd-mobile';
import fetch from 'sx-fetch';
import { ButtonCustom, LoadingView } from 'components';
import qs from 'qs';
import Image from 'assets/image';
import styles from './index.scss';
import { bank_card_list, my_card_unbind } from 'fetch/api';
import { connect } from 'react-redux';
import { setWithholdCardDataAction, setWithdrawCardDataAction } from 'reduxes/actions/commonActions';
import card_select_yellow from './img/card_select_yellow.png';
const noData = {
	img: Image.bg.no_order,
	text: '暂无银行卡',
	width: '80%'
	// height: '100%'
};
const errorData = {
	img: Image.bg.no_network,
	text: '网络错误,点击重试'
};
@fetch.inject()
@connect(
	(state) => ({
		cardType: state.commonState.cardType
	}),
	{
		setWithholdCardDataAction,
		setWithdrawCardDataAction
	}
)
export default class select_save_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			agrNo: '',
			cardList: []
			// unbindData: '', // 解绑卡的数据
		};
	}
	componentWillMount() {
		// 改变title值
		const { cardType } = this.props;
		if (cardType) {
			this.props.setTitle('储蓄卡管理');
		}
		this.queryBankList();
		// 设置跳转过来选中的效果
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		if (queryData.agrNo) {
			this.setState({
				agrNo: queryData.agrNo
			});
		}
	}
	componentDidMount() {}
	componentWillUnmount() {}
	// 获取储蓄卡银行卡列表
	queryBankList = () => {
		const params = {
			// agrNo:query.agrNo,
			queryType: '2', //所有储蓄卡列表
			corpBusType: '01,41',
			merType: '' // 筛选出绑定通联支付的卡 JR随行付金融 XD随行付小贷 ZY中元保险
		};
		this.props.$fetch.post(bank_card_list, params).then(
			(res) => {
				if (res.code === '000000') {
					if (res.data.bankCards && res.data.bankCards.length > 0) {
						this.viewRef && this.viewRef.showDataView();
					} else {
						this.viewRef && this.viewRef.setEmpty();
					}
					this.setState({
						cardList: res.data && res.data.bankCards ? res.data.bankCards : []
					});
				} else {
					this.viewRef && this.viewRef.setEmpty();
					// if (res.code === 'PTM3021') {
					// 	this.setState({
					// 		cardList: []
					// 	});
					// 	return;
					// }
					res.message && this.props.toast.info(res.message);
				}
			},
			(error) => {
				this.viewRef && this.viewRef.setEmpty();
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	// 点击解绑按钮
	unbindHandler = (params) => {
		const ele = <div style={{ lineHeight: 3 }}>确认解绑该卡？</div>;
		Modal.alert('', ele, [
			{ text: '取消', onPress: () => {} },
			{
				text: '确定',
				onPress: () => {
					this.unbindCard(params);
				}
			}
		]);
	};

	// 解绑银行卡
	unbindCard = (cardNo) => {
		this.props.$fetch.get(`${my_card_unbind}/${cardNo}`).then(
			(res) => {
				if (res.code === '000000') {
					this.queryBankList();
				} else {
					res.message && this.props.toast.info(res.message);
				}
			},
			(error) => {
				error.message && this.props.toast.info(error.message);
			}
		);
	};

	// 选择银行卡
	selectCard = (obj) => {
		this.setState({
			agrNo: obj.agrNo
		});
		let cardDatas = obj;

		const { cardType } = this.props;
		if (cardType === 'withhold') {
			// 将还款银行卡数据存储到redux中
			this.props.setWithholdCardDataAction(cardDatas);
		} else if (cardType === 'withdraw') {
			this.props.setWithdrawCardDataAction(cardDatas);
		}
		this.props.history.goBack();
	};

	// 新增授权卡
	addCard = () => {
		const { cardType } = this.props;
		if (cardType) {
			// 如果有cardType则用replace跳转,否则navigate
			this.props.history.replace('/mine/bind_save_page');
		} else {
			this.props.history.push('/mine/bind_save_page');
		}
	};

	render() {
		const { cardType } = this.props;
		const { cardList } = this.state;
		return (
			<div className={styles.select_save_page}>
				<LoadingView
					ref={(view) => (this.viewRef = view)}
					nodata={noData}
					errordata={errorData}
					onReloadData={() => {
						this.onRefresh();
					}}
				>
					{cardList.length ? (
						<div>
							<p className={styles.card_tit}>已绑定储蓄卡</p>
							<ul className={styles.card_list}>
								{cardList.map((item, index) => {
									const isSelected = item.coreAgrNos.includes(this.state.agrNo);
									if (cardType) {
										return (
											<li
												className={isSelected ? styles.active : ''}
												key={index}
												onClick={() =>
													this.selectCard({
														bankName: item.bankName,
														lastCardNo: item.cardNoLast,
														bankCode: item.bankCode,
														agrNo: item.agrNo
													})
												}
											>
												<span className={`bank_ico bank_ico_${item.bankCode}`} />
												<span className={styles.bank_name}>{item.bankName}</span>
												<span>···· {item.cardNoLast}</span>
												{isSelected ? (
													<img src={card_select_yellow} className={styles.selected_ico}></img>
												) : null}
											</li>
										);
									}
									return (
										<li key={index}>
											<span className={`bank_ico bank_ico_${item.bankCode}`} />
											<span className={styles.bank_name}>{item.bankName}</span>
											<span>···· {item.cardNoLast}</span>
										</li>
									);
								})}
							</ul>
						</div>
					) : null}
				</LoadingView>
				<div className={styles.addCardBox}>
					<ButtonCustom onClick={this.addCard}>
						<i className={styles.add_ico} />
						绑定储蓄卡
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
