import React, { PureComponent } from 'react';
import OrderCommonPage from '../order_common_page';
// import fetch from 'sx-fetch';

// @fetch.inject()
export default class order_repay_page extends PureComponent {
	render() {
		return <OrderCommonPage {...this.props} />;
	}
}