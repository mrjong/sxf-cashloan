/*
 * @Author: shawn
 * @LastEditTime : 2020-02-10 14:13:20
 */
import React from 'react';
import style from './index.scss';
export default class MsgTip extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			count: ''
		};
	}

	// 去消息页面
	jumpToMsg = () => {
		this.props.history.push('/home/message_page');
	};
	render() {
		const { tokenObj, msgCount } = this.props;
		return (
			<section className={style.home_header_wrap}>
				<div className={style.home_header_main}>
					<span className={style.home_header_title}>想还·就还到</span>
					<div>
						{tokenObj && (
							<span onClick={this.jumpToMsg} className={style.messageIcon}>
								{msgCount ? <i className={style.active} /> : null}
							</span>
						)}
					</div>
				</div>
				<p className={style.home_header_sub}>随行付金融旗下信贷服务</p>
			</section>
		);
	}
}
