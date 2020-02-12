/*
 * @Author: shawn
 * @LastEditTime : 2020-02-12 12:41:30
 */
import React from 'react';
import style from './index.scss';
import Images from 'assets/image';

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

	handleGoCustomCenter = () => {
		this.props.history.push('/mine/qiyu_page');
	};
	render() {
		const { tokenObj, msgCount } = this.props;
		return (
			<section className={style.home_header_wrap}>
				<div className={style.home_header_main}>
					<span className={style.home_header_title}>想还·就还到</span>
					{tokenObj && (
						<div className={style.icon_wrap}>
							<div className={style.help_center_icon_wrap} onClick={this.handleGoCustomCenter}>
								<img className={style.help_center_icon} src={Images.icon.customer_service} alt="客服" />
							</div>
							<span onClick={this.jumpToMsg} className={style.messageIcon}>
								{msgCount ? <i className={style.active} /> : null}
							</span>
						</div>
					)}
				</div>
				<p className={style.home_header_sub}>随行付金融旗下信贷服务</p>
			</section>
		);
	}
}
