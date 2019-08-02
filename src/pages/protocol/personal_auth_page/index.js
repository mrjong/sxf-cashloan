import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import dayjs from 'dayjs';
import IframeProtocol from 'components/IframeProtocol';

export default class personal_auth_page extends PureComponent {
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
		return <IframeProtocol name="personal_auth_page" postData={this.state.contractInf} />;
	}
}
