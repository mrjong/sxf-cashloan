import React, { PureComponent } from 'react';
import style from './index.scss';
import loading_error from 'assets/images/error/loading_error.png';

export default class Blank extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {}
	// 重新加载
	reloadHandler = () => {
		window.location.reload();
	};
	render() {
		return this.props.errorInf ? (
			<div className={style.auth_page}>
				<div>
					<img src={loading_error} />
				</div>
				<div className={style.text} dangerouslySetInnerHTML={{ __html: this.props.errorInf }} />
			</div>
		) : (
			<div />
		);
	}
}
