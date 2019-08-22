import React, { PureComponent } from 'react';
import OrderCommonPage from '../order_common_page';

export default class order_detail_page extends PureComponent {
	render() {
		return <OrderCommonPage history={this.props.history} />;
	}
}
