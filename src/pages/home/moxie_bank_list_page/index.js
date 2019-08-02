import React, { Component } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { moxie_bank_list } from 'utils/analytinsType';
import ButtonCustom from 'components/ButtonCustom';
import linkConf from 'config/link.conf';
import bankCode from 'config/bankCode';
import FeedbackModal from 'components/FeedbackModal';
import recommend_icon from './img/recommend_icon.png';

const API = {
	mxoieCardList: '/moxie/mxoieCardList/C',
	CARD_AUTH: '/auth/cardAuth' // 信用卡授信
};
const RecommendBankList = ['BCOM', 'COMM', 'SPDB', 'SPD', 'CMB', 'CEBB', 'CEB'];
let backUrlData = {};
let moxieBackUrlData = {};
@fetch.inject()
@setBackGround('#fff')
export default class moxie_bank_list_page extends Component {
	state = {
		showAll: true,
		lengthNum: 7,
		bankList: [],
		isnoData: false,
		showFeedbackModal: false
	};
	componentWillMount() {
		// 信用卡直接返回的问题
		// store.removeBankMoxie();
		this.mxoieCardList();
		this.getBackUrl();
		this.getMoxieBackUrl();
		this.showFeedbackModal();
		const needNextUrl = store.getNeedNextUrl();
		if (!needNextUrl) {
			this.props.setTitle('添加信用卡');
		} else {
			this.props.setTitle('添加信用卡');
		}
	}

	componentWillUnmount() {
		store.removeBackUrl2();
		store.removeMoxieBackUrl2();
	}

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

	getBackUrl = () => {
		backUrlData = store.getBackUrl();
		if (backUrlData && JSON.stringify(backUrlData) !== '{}') {
			store.setBackUrl2(store.getBackUrl());
			store.removeBackUrl();
		} else {
			backUrlData = store.getBackUrl2();
		}
	};
	getMoxieBackUrl = () => {
		moxieBackUrlData = store.getMoxieBackUrl();
		if (moxieBackUrlData && JSON.stringify(moxieBackUrlData) !== '{}') {
			store.setMoxieBackUrl2(store.getMoxieBackUrl());
			store.removeMoxieBackUrl();
		} else {
			moxieBackUrlData = store.getBackUrl2();
		}
	};
	mxoieCardList = () => {
		this.props.$fetch
			.get(API.mxoieCardList)
			.then((res) => {
				if (res && res.msgCode === 'PTM0000') {
					this.setState({
						bankList: res.data || [],
						isnoData: false
					});
					if (!res.data) {
						this.setState({
							isnoData: true
						});
					}
				} else {
					this.setState({
						isnoData: true
					});
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch(() => {
				this.setState({
					isnoData: true
				});
			});
	};
	showAllFunc = () => {
		this.setState(
			{
				showAll: !this.state.showAll
			},
			() => {
				if (this.state.showAll) {
					this.setState({
						lengthNum: this.state.bankList.length
					});
				} else {
					this.setState({
						lengthNum: 7
					});
				}
			}
		);
	};
	gotoMoxie = (item) => {
		let setMoxieData = store.getMoxieBackUrl2();
		store.setBackUrl(backUrlData);
		store.setMoxieBackUrl(moxieBackUrlData);
		store.removeBackUrl2();
		store.removeMoxieBackUrl2();
		store.setAutId(item.authorId);
		// if (setMoxieData && setMoxieData.indexOf('noAuthId') > -1) {
		// 	store.setMoxieBackUrl(`/mine/credit_extension_page?isShowCommit=true&autId=${item.authorId}`);
		// }
		buriedPointEvent(moxie_bank_list.bankChooes, {
			bankName: item.name
		});
		// 信用卡直接返回的问题
		store.setBankMoxie(true);
		store.setGoMoxie(true);

		store.setGotoMoxieFlag(true);
		window.location.href =
			item.href +
			`&showTitleBar=NO&agreementEntryText=《个人信息授权书》&agreementUrl=${encodeURIComponent(
				`${linkConf.BASE_URL}/disting/#/internet_bank_auth_page`
			)}`;
	};
	// 重新加载
	reloadHandler = () => {
		buriedPointEvent(moxie_bank_list.bankRefresh);
		window.location.reload();
	};
	render() {
		const needNextUrl = store.getNeedNextUrl();
		return (
			<div className={style.moxie_bank_list_page}>
				{this.state.bankList && this.state.bankList.length > 0 ? (
					<div>
						<div className={style.tipsBox}>
							<i />
							银行专属链接，保护用户数据安全
						</div>
						<div className={style.progressBox}>
							<i />
							<div className={style.bottomText}>
								<span>已完成98%</span>
								<span>申请成功</span>
							</div>
						</div>
						<div className={style.infromationTitle}>
							<p>选择信用卡所在银行</p>
							<span className={style.desc}>登录网上银行，自动查询并添加信用卡</span>
						</div>
						<div className={style.bankList}>
							{this.state.bankList.map((item, index) => {
								return (
									<div
										onClick={() => {
											this.gotoMoxie(item);
										}}
										key={item.name}
										className={style.bankitem}
									>
										{RecommendBankList.includes(item.code) && (
											<img src={recommend_icon} alt="" className={style.recommend_icon} />
										)}
										<span
											className={`${
												bankCode.includes(item.code) ? 'important_bank_moxie_ico' : 'bank_moxie_ico'
											} bank_ico_${item.code}`}
											style={{ backgroundImage: `url(${item.logo})` }}
										/>
										<div className={style.name}>{item.name}</div>
									</div>
								);
							})}
						</div>
					</div>
				) : null}
				{this.state.isnoData ? (
					<div>
						<div className={style.err_page}>
							<i className={style.err_img} />
							<ButtonCustom onClick={this.reloadHandler} className={style.reload_btn}>
								刷新
							</ButtonCustom>
						</div>
					</div>
				) : null}
				<FeedbackModal
					history={this.props.history}
					toast={this.props.toast}
					visible={this.state.showFeedbackModal}
					closeModal={this.closeFeedbackModal}
				/>
			</div>
		);
	}
}
