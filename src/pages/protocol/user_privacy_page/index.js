/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-02-18 11:16:59
 */
import React, { PureComponent } from 'react';
import { store } from 'utils/store';
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
			...contractData
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
