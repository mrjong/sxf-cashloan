/*
 * @Author: shawn
 * @LastEditTime: 2019-09-05 10:09:21
 */
import React, { PureComponent } from 'react';
import OrderCommonPage from '../order_common_page';
// import fetch from 'sx-fetch';

// @fetch.inject()
export default class order_detail_page extends PureComponent {
	render() {
		return <OrderCommonPage {...this.props} />;
	}
}
