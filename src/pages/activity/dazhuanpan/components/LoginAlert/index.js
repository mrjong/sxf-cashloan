import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';
import login_bg from '../../img/login_bg.png'
export default class LoginAlert extends Component {
	constructor(props) {
		super(props);
		this.state = {
			modal1: true
		};
	}
	componentDidMount() {}
	onClose = () => {};
	render() {
		return (
			<div className={style.login_alert}>
				<Modal
					visible={this.state.modal1}
                    transparent
					onClose={this.onClose('modal1')}
				>
					<div>
                        <div className={style.login_box}>
                            <img className={style.login_bg} src={login_bg}></img>
                        </div>
                    </div>
				</Modal>
			</div>
		);
	}
}
