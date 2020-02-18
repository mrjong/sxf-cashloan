/*
 * @Author: shawn
 * @LastEditTime: 2020-02-18 15:53:47
 */
import React, { Component } from 'react';
import fetch from 'sx-fetch';
import { store } from 'utils/store';

const API = {
	qryDtl: '/bill/qryDtl'
};
@fetch.inject()
export default class wx_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			orderData: ''
		};
	}
	componentWillMount() {
		this.getLoanInfo();
	}
	// 获取还款信息
	getLoanInfo = () => {
		this.props.$fetch
			.post(API.qryDtl, {
				billNo: store.getBillNo()
			})
			.then((res) => {
				if (res.code === 'PTM0000') {
					for (let index = 0; index < res.data.perdList.length; index++) {
						const element = res.data.perdList[index];
						if (res.data.perdNum == element.perdNum) {
							this.setState({
								orderData: element
							});

							break;
						}
					}
					if (res.data.perdList[res.data.perdList.length - 1].perdSts === '4') {
						store.setWxPayEnd(true);
					} else {
						store.setWxPayEnd(false);
					}
				} else {
					this.props.toast.info(res.message);
				}
			});
	};
	render() {
		const { orderData } = this.state;
		return (
			<div
				onClick={() => {
					history.go(-2);
				}}
			>
				{orderData.perdStsNm}
			</div>
		);
	}
}
