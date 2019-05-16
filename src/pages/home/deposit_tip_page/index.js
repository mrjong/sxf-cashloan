import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
const API = {
	smsForLogin: '/signup/smsForLogin',
	sendsms: '/cmm/sendsms'
};

@fetch.inject()
export default class login_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {}
	render() {
		return <div ref="loginWrap" className={styles.dc_landing_page} >22222</div>;
	}
}
