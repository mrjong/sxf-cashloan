import React, { Component } from 'react';
import style from './index.scss';

class CountDownBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			item: 3,
			data: [ 1, 2, 3 ]
		};
		this.requestClose = (type) => {
			this.props.onRequestClose(type);
			if (this.props.autoClose) clearTimeout(this.autoClose);
		};
	}
	getDom = (item) => {
		if (item >= 0) {
			setTimeout(() => {
				this.setState({
					item: item - 1
				});
			}, 1000);
			return (
				<div key={item} className={style.box}>
					<div className={style.numBg} />
					<div className={style.num}>
						<span>{item ? item : 'go'}</span>
					</div>
				</div>
			);
		}
	};
	render() {
		const { item } = this.state;
		return <div>{item >= 0 ? <div className={style.bg}>{this.getDom(item)}</div> : null}</div>;
	}
}

export default CountDownBox;
