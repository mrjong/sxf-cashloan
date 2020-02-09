import React from 'react';

import Images from 'assets/image';
import classNM from './index.scss';

export default class FixedHelpCenter extends React.PureComponent {
	handleGoCustomerService = () => {
		console.log(1);
	};

	render() {
		const { className, style, top } = this.props;

		return (
			<div
				style={{ ...style, top }}
				className={[classNM.fixed_help_center_wrap, className].join(' ')}
				onClick={this.handleGoCustomerService}
			>
				<img className={classNM.fixed_help_center_icon} src={Images.icon.customer_service} alt="客服" />
			</div>
		);
	}
}
