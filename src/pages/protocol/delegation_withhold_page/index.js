import React, { PureComponent } from 'react';
import { store } from 'utils/store';
import IframeProtocol from 'components/IframeProtocol';

export default class delegation_withhold_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contractInf: {}
		};
	}
	componentWillMount() {
		this.setState({ contractInf: store.getProtocolFinancialData() });
	}
	componentWillUnmount() {
		store.removeProtocolFinancialData();
	}
	render() {
		return <IframeProtocol name="delegation_withhold_page" postData={this.state.contractInf} />;
	}
}
