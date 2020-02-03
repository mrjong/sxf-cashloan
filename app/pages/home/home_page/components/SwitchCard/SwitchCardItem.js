import React from 'react';
import PropTypes from 'prop-types';

import style from './SwitchCardItem.scss';

export default class ActivityEntry extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	static propTypes = {
		cardType: PropTypes.string // 卡片类型 是基础版 还是 plus 版 或者是其他版本
	};

	static defaultProps = {
		cardType: 'basic'
	};

	render() {
		return (
			<div>
				<p>fefe</p>
				<p>fefe</p>
			</div>
		);
	}
}
