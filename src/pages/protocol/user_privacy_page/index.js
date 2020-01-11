/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-01-11 10:41:56
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import dayjs from 'dayjs';
import IframeProtocol from 'components/IframeProtocol';

export default class user_privacy_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contractInf: {}
		};
	}
	componentWillMount() {
		const contractData = store.getProtocolPersonalData();
		const formateContractData = {
			...contractData,
			dateTime: contractData && dayjs(contractData.dateTime).format('YYYY年MM月DD日')
		};
		this.setState({ contractInf: formateContractData });
	}
	componentWillUnmount() {
		store.removeProtocolPersonalData();
	}

	render() {
		return <IframeProtocol name="user_privacy_page" postData={this.state.contractInf} />;
	}
}
