import React, { Component } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { setBackGround } from 'utils/background';
import allicon from './img/all@2x.png';
import { SXFToast } from 'utils/SXFToast';

import ButtonCustom from 'components/ButtonCustom';
const API = {
	mxoieCardList: '/moxie/mxoieCardList/C',
	CARD_AUTH: '/auth/cardAuth' // 信用卡授信
};
let backUrlData = {};
let moxieBackUrlData = {};
@fetch.inject()
@setBackGround('#fff')
export default class moxie_bank_list_page extends Component {
	state = {
		showAll: false,
		lengthNum: 7,
		bankList: [],
		isnoData: false
	};
	componentWillMount() {
		this.mxoieCardList();
		this.getBackUrl();
		this.getMoxieBackUrl();
	}
	componentWillUnmount() {
		store.removeBackUrl2();
		store.removeMoxieBackUrl2();
	}
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
		if (setMoxieData&&setMoxieData.indexOf('noAuthId') > -1) {
			store.setMoxieBackUrl(
				`/mine/credit_extension_page?isShowCommit=true&autId=${item.authorId}`
			);
		}
		location.href = item.href + '&showTitleBar=NO';
		// 跳魔蝎
		// this.props.$fetch
		// 	.post(API.CARD_AUTH, {
		// 		clientCode: '04'
		// 	})
		// 	.then((result) => {
		// 		if (result && result.msgCode === 'PTM0000' && result.data !== null) {
		// 			if (setMoxieData.indexOf('noAuthId') > -1) {
		// 				store.getMoxieBackUrl(
		// 					`/mine/credit_extension_page?isShowCommit=true&autId=${result.data && result.data.autId}`
		// 				);
		// 			}
		// 			SXFToast.loading('加载中...', 0);
		// 			location.href = url + '&showTitleBar=NO';
		// 		} else {
		// 			this.props.toast.info(result.msgInfo);
		// 		}
		// 	});
	};
	// 重新加载
	reloadHandler = () => {
		window.location.reload();
	};
	render() {
		return (
			<div className={style.moxie_bank_list_page}>
				<div className={style.title}>
					选择发卡银行
					<span className={style.subTitle}>获3项优质服务</span>
				</div>
				<div className={style.bankDesc}>
					<span>
						<i className={style.dot} />
						高效管理信用卡
					</span>
					<span>
						<i className={style.dot} />
						一键同步账单
					</span>
					<span>
						<i className={style.dot} />
						多重加密
					</span>
				</div>
				{this.state.bankList && this.state.bankList.length > 0 ? (
					<div>
						<div className={style.bankList}>
							{this.state.bankList.map((item, index) => {
								if (index <= this.state.lengthNum) {
									return (
										<div
											onClick={() => {
												this.gotoMoxie(item);
											}}
											key={item.name}
											className={style.bankitem}
										>
											<span
												className={`bank_moxie_ico bank_moxie_${item.code}`}
												style={{ backgroundImage: `url(${item.logo})` }}
											/>
											<div className={style.name}>{item.name}</div>
										</div>
									);
								} else {
									return null;
								}
							})}
							{this.state.bankList.length >= 8 ? (
								<div onClick={this.showAllFunc} className={style.bankitem}>
									<span className={`bank_moxie_ico bank_moxie_ALL`} />
									<div className={style.name}>{this.state.showAll ? '收起' : '查看全部'}</div>
								</div>
							) : null}
						</div>
					</div>
				) : null}
				{this.state.isnoData ? (
					<div>
						<div className={style.err_page}>
							<i className={style.err_img} />
							{/* <p className={style.err_cont}>对不起，您找的页面走丢了～</p> */}
							<ButtonCustom onClick={this.reloadHandler} className={style.reload_btn}>
								刷新
							</ButtonCustom>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}