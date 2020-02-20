import React, { PureComponent } from 'react';
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

		this.setState({ contractInf: { ...contractData } });
	}
	componentWillUnmount() {}
	render() {
		return <IframeProtocol name="delegation_withhold_page" postData={this.state.contractInf} />;
	}
}
