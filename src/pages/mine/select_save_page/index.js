import React, { PureComponent } from 'react';
// import { SwipeAction } from 'antd-mobile';
import { store } from 'utils/store';
import { Modal, Icon } from 'antd-mobile';
import fetch from 'sx-fetch';
import { ButtonCustom, LoadingView } from 'components';
import qs from 'qs';
import Image from 'assets/image';
import styles from './index.scss';
import { bank_card_list, my_card_unbind } from 'fetch/api';
import { connect } from 'react-redux';
import { setWithholdCardDataAction, setWithdrawCardDataAction } from 'reduxes/actions/commonActions';

let backUrlData = ''; // 从除了我的里面其他页面进去
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
			cardList: [],
			isClickAdd: false // 是否点击了添加授权卡
			// unbindData: '', // 解绑卡的数据
		};
		backUrlData = store.getBackUrl();
	}
	componentWillMount() {
		// 改变title值
		if (!backUrlData) {
			this.props.setTitle('储蓄卡管理');
		}
		// 根据不同页面跳转过来查询不同接口
		if (backUrlData && backUrlData === '/mine/confirm_purchase_page') {
			this.queryVipBankList();
			this.props.setTitle('选择银行卡');
		} else {
			this.queryBankList();
		}
		// 设置跳转过来选中的效果
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		if (queryData.agrNo) {
			this.setState({
				agrNo: queryData.agrNo
			});
		}
	}
	componentDidMount() {
		// 改变body的背景色
		if (backUrlData) {
			document.getElementsByTagName('body')[0].className = 'white';
		} else {
			document.getElementsByTagName('body')[0].className = '';
		}
	}
	componentWillUnmount() {
		document.getElementsByTagName('body')[0].className = '';
		if (!this.state.isClickAdd) {
			store.removeBackUrl(); // 清除session里的backurl的值
		}
	}
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

	//存储现金分期卡信息
	storeCashFenQiCardData = (cardDatas) => {
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const cashFenQiCardArr = store.getCashFenQiCardArr();
		//现金分期收、还款银行卡信息
		if (queryData.cardType === 'resave') {
			cashFenQiCardArr[0] = cardDatas;
		} else if (queryData.cardType === 'pay') {
			cashFenQiCardArr[1] = cardDatas;
		}
		store.setCashFenQiCardArr(cashFenQiCardArr);
	};

	// 选择银行卡
	selectCard = (obj) => {
		// if (backUrlData) {
		this.setState({
			// bankName: obj.bankName,
			// lastCardNo: obj.lastCardNo,
			// bankCode: obj.bankCode,
			agrNo: obj.agrNo
		});
		this.props.history.goBack();
		let cardDatas = {};
		// 如果是首页则多存一个参数为showModal的字段，以便首页弹框
		if (backUrlData === '/home/home') {
			cardDatas = { showModal: true, ...obj };
		} else {
			cardDatas = obj;
		}
		this.storeCashFenQiCardData(cardDatas);
		store.setCardData(cardDatas);
		let paramVip = store.getParamVip() || {};
		Object.assign(paramVip, obj);
		store.setParamVip(paramVip);
		// }
	};

	// 新增授权卡
	addCard = () => {
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		if (backUrlData) {
			this.setState({ isClickAdd: true });
			if (backUrlData === '/mine/confirm_purchase_page') {
				this.props.history.replace('/mine/bind_bank_card');
			} else {
				this.props.history.replace(
					`/mine/bind_save_page${queryData.cardType ? `?cardType=${queryData.cardType}` : ''}`
				);
			}
		} else {
			this.setState({ isClickAdd: true });
			this.props.history.push(
				`/mine/bind_save_page${queryData.cardType ? `?cardType=${queryData.cardType}` : ''}`
			);
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
													<Icon type="check-circle-o" color="#5CE492" className={styles.selected_ico} />
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
