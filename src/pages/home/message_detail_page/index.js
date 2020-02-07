/*
 * @Author: shawn
 * @LastEditTime: 2020-02-07 14:24:56
 */
import React, { PureComponent } from 'react';
import style from './index.scss';
import { store } from 'utils/store';
import { setBackGround } from 'utils/background';
@setBackGround('#fff')
export default class message_detail_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			msgObj: {}
		};
	}
	componentWillMount() {
		let msgObj = store.getMsgObj();
		this.setState({
			msgObj
		});
	}
	componentWillUnmount() {
		store.removeMsgObj();
	}

	render() {
		return (
			<div className={style.descContainer}>
				<div className={style.title}>{this.state.msgObj && this.state.msgObj.title}</div>
				<div className={style.time}>{this.state.msgObj && this.state.msgObj.sendTm}</div>
				<pre className={style.p}>
					{(this.state.msgObj && this.state.msgObj.detail) || (this.state.msgObj && this.state.msgObj.dec)}
				</pre>
			</div>
		);
	}
}
