import React, { Component } from 'react';
import { Modal, Button, Toast, Flex, List } from 'antd-mobile';
import LoginComponent from '../LoginComponent';
import style from './index.scss';
import closeImg from '../../img/20181024_close.png';
import alert_10 from '../../img/20181024_alert_10.png';
import alert_btn from '../../img/20181024_alert_btn.png';
import alert_1000 from '../../img/20181024_alert_1000.png';
import alert_dls from '../../img/20181024_alert_dls.png';

const Item = List.Item;

export default class LoginAlert extends Component {
	constructor(props) {
		super(props);
		this.state = {
			modal1: true,
		};
	}
	componentDidMount() {}
	// 立即使用
	goRoute = () => {
		this.props.history.replace('/home');
	};
	onClose = () => {};
	closeModal = () => {
		this.setState({
			modal1: false
		});
	}
	render() {
		const { alertType, userAwardList, refreshPageFn } = this.props;
		let componentsDisplay = null;
		let closeArr = [ 'closeImg' ];
		let titleBoxArr = [ 'titleBox' ];
		let loginModal = [ 'login_modal' ];
		let titText = '';
		switch (alertType) {
			case 'alert_tel': // 登录
				componentsDisplay = <LoginComponent refreshPageFn={refreshPageFn} closeCb = {this.closeModal} />;
				break;
			case 'alert_dls': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitleBox' ];
				componentsDisplay = (
					<div>
						<img src={alert_dls} className={style.alert_10} />
						<div>
							<a className={style.alert_tel_num} href="tel:400-088-7626">
								<span>客服电话：</span>400-088-7626
							</a>
						</div>
					</div>
				);
				break;
			case 'alert_10': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitleBox' ];
				componentsDisplay = (
					<div>
						<img src={alert_10} className={style.alert_10} />
						<div>
							<img src={alert_btn} onClick={this.goRoute} className={style.alert_btn} />
						</div>
					</div>
				);
				break;
			case 'alert_1000': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitleBox' ];
				componentsDisplay = (
					<div>
						<img src={alert_1000} className={style.alert_10} />
						<div>
							<img src={alert_btn} onClick={this.goRoute} className={style.alert_btn} />
						</div>
					</div>
				);
				break;
			case 'jiangpin': //
				titText = '我的奖品';
				componentsDisplay = (
					<div className={style.alert_list}>
						{userAwardList && userAwardList.length !== 0 ? (
							<List>
								{userAwardList.map((item, key) => {
									return (
										<Item
											extra={
												<Button type="warning" size="small" inline onClick={this.goRoute}>
													立即使用
												</Button>
											}
										>
											{item.desc}
										</Item>
									);
								})}
							</List>
						) : (
							<div className={style.text_center_two}>
								<div>还没有抽中奖品</div>
								<div>快去试试手气吧～</div>
							</div>
						)}
					</div>
				);
				break;
			case 'no_award': // 没有中奖
				titText = '抱歉，未抽中奖品';
				loginModal = [ 'login_modal', 'special_bg_modal' ];
				componentsDisplay = (
					<div className={style.text_center}>
						谢谢参与～
					</div>
				);
				break;
			case 'no_chance': // 没有抽奖机会
				titText = '抱歉，没有抽奖机会';
				loginModal = [ 'login_modal', 'special_bg_modal' ];
				componentsDisplay = (
					<div className={style.noChance}>
						今日机会已用完，请您明日再来
						<Button onClick={this.goRoute} type="primary">
							立即借款
						</Button>
						<div className={style.text_small_box}>
							<div className={style.text_small}>完成授信和借款分别可获得1次机会</div>
							<div className={style.text_small}>授信机会+1 借款机会+1</div>
						</div>
					</div>
				);
				break;
			default:
				break;
		}
		return (
			<div className={style.login_alert}>
				<Modal
					className={loginModal.join(' ')}
					visible={this.state.modal1}
					transparent
					onClose={this.onClose('modal1')}
				>
					<div className="login_content">
						<div className={titleBoxArr.join(' ')}>
							{titText}
							<img
								className={closeArr.join(' ')}
								src={closeImg}
								onClick={this.closeModal}
							/>
						</div>
						<div className={style.login_box}>{componentsDisplay}</div>
					</div>
				</Modal>
			</div>
		);
	}
}
