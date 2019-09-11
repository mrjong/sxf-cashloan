import React, { PureComponent } from 'react';
import IframeProtocol from 'components/IframeProtocol';

export default class personal_credit_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return <IframeProtocol name="personal_credit_page" />;
	}
}
