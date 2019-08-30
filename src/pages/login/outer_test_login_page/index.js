import React, { PureComponent } from 'react';
import LoginCommonPage from '../login_common_page';
import bannerImg from './img/login_bg.png';

export default class outer_test_login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		return <LoginCommonPage {...this.props} bannerImg={bannerImg} isChecked={false} />;
	}
}
