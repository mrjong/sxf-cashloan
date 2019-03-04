import React, { Component } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
const API = {
	mxoieCardList: '/moxie/mxoieCardList/D'
};
@fetch.inject()
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
			console.log(res);
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
	render() {
		return (
			<div className={style.moxie_bank_list_page}>
				<div className={style.title}>
					选择发卡银行
					<span className={style.subTitle}>获3项优质服务</span>
				</div>
				<div>
					<span>
						<i className={style.dot} />
						高效管理信用卡
					</span>
					<span>
						<i />
						高效管理信用卡
					</span>
					<span>
						<i />
						高效管理信用卡
					</span>
				</div>
				<div className={style.bankList}>
					{this.state.bankList.map((item, index) => {
						if (index <= this.state.lengthNum) {
							return (
								<div key={item.name} className={style.bankitem}>
									<img src={item.src} />
									<div>{item.name}</div>
								</div>
							);
						} else {
							return null;
						}
					})}
					{this.state.bankList.length >= 8 ? (
						<div onClick={this.showAllFunc} className={style.bankitem}>
							<img src="data:image/png;base64,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" />
							<div>{this.state.showAll ? '收起' : '查看全部'}</div>
						</div>
					) : null}
				</div>
			</div>
		);
	}
}
