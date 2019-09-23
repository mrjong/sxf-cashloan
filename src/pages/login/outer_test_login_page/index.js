/*
 * @Author: shawn
 * @LastEditTime: 2019-09-20 10:27:24
 */
import React, { PureComponent } from 'react';
import LoginCommonPage from '../login_common_page';
import bannerImg4 from './img/login_bg4.png';
/*eslint-disable */
export default class outer_test_login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		return <LoginCommonPage {...this.props} bannerImg={bannerImg4} isChecked={true} />;
	}
}
