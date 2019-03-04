import React, { Component } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import allicon from './img/all@2x.png';
const API = {
	mxoieCardList: '/moxie/mxoieCardList/C'
};
@fetch.inject()
@setBackGround('#fff')
export default class moxie_bank_list_page extends Component {
	state = {
		showAll: false,
		lengthNum: 7,
		bankList: []
	};
	componentWillMount() {
		this.mxoieCardList();
	}
	mxoieCardList = () => {
		this.props.$fetch.get(API.mxoieCardList).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					bankList: res.data || []
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
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
	gotoMoxie = (url) => {
		location.href = url;
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
				<div className={style.bankList}>
					{this.state.bankList.map((item, index) => {
						if (index <= this.state.lengthNum) {
							return (
								<div
									onClick={() => {
										this.gotoMoxie(item.href);
									}}
									key={item.name}
									className={style.bankitem}
								>
									<img src={item.logo} />
									<div className={style.name}>{item.name}</div>
								</div>
							);
						} else {
							return null;
						}
					})}
					{this.state.bankList.length >= 8 ? (
						<div onClick={this.showAllFunc} className={style.bankitem}>
							<img src={allicon} />
							<div className={style.name}>{this.state.showAll ? '收起' : '查看全部'}</div>
						</div>
					) : null}
				</div>
			</div>
		);
	}
}
