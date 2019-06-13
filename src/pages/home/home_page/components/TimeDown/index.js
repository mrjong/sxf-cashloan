import React from 'react';
import style from './index.scss';
export default class TimeDown extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { percentData, showData, handleClick } = this.props;
		console.log(percentData);
		return (
			<div>
				<div>
					<span id="_d">00</span>
					<span id="_h">00</span>
					<span id="_m">00</span>
					<span id="_s">00</span>
				</div>
			</div>
		);
	}
}
