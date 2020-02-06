import React, { PureComponent } from 'react';
import dayjs from 'dayjs';
import IframeProtocol from 'components/IframeProtocol';

export default class delegation_withhold_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contractInf: {}
		};
	}
	componentWillMount() {
		let contractData = {};
		if (this.props.history.location.state && this.props.history.location.state.contractInf) {
			contractData = this.props.history.location.state.contractInf;
		}
		const formateContractData = {
			...contractData,
			dateTime: contractData && dayjs(contractData.dateTime).format('YYYY年MM月DD日')
		};
		this.setState({ contractInf: formateContractData });
	}
	componentWillUnmount() {}
	render() {
		return <IframeProtocol name="delegation_withhold_page" postData={this.state.contractInf} />;
	}
}
