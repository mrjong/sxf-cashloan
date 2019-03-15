import React, { Component } from 'react';
import { Modal, Button, Toast, Flex, List, Icon } from 'antd-mobile';
import style from './index.scss';
import award_list from '../../img/award_list.png';
import thanks from '../../img/thanks.png';
import hd from '../../img/hd.png';
import tip from '../../img/tip.png';
import congratulation from '../../img/congratulation.png';

const Item = List.Item;

export default class LoginAlert extends Component {
	constructor(props) {
		super(props);
		this.state = {
			modal1: false
		};
	}
	componentDidMount() {}
	componentWillReceiveProps(nextProps) {
		if (nextProps.alertType) {
			this.setState({
				modal1: true
			});
		} else {
			this.setState({
				modal1: false
			});
		}
	}
	onClose = () => {};
	closeModal = () => {
		this.setState(
			{
				modal1: false
			},
			() => {
				this.props.setalertType();
			}
		);
	};
	showModal = () => {
		this.setState({
			modal1: true
		});
	};
	render() {
		const { alertType, userAwardList, refreshPageFn, alert_img } = this.props;
		let componentsDisplay = null;
		let closeArr = [ 'closeImg' ];
		let titleBoxArr = [ 'titleBox' ];
		let loginModal = [ 'login_modal' ];
		let titText = '';
		switch (alertType) {
			case 'login_tip': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitleBox' ];
				componentsDisplay = (
					<div className={style.img_box}>
						<Icon type="cross" onClick={this.closeModal} className={style.close_icon} />
						<img src={hd} className={style.alert_congratulation} />
						<div className={style.tip_text}>
							小主 <br /> 先登录才能参与活动哦～
						</div>
					</div>
				);
				break;
			case 'alert_congratulation': //
				componentsDisplay = (
					<div className={style.img_box}>
						<Icon type="cross" onClick={this.closeModal} className={style.close_icon} />
						<img src={congratulation} className={style.alert_congratulation} />
						{alert_img ? <img className={style.award_img} src={alert_img} /> : null}
						<Button onClick={this.props.goRoute} className={style.btn_loan} type="primary">
							立即借款
						</Button>
					</div>
				);
				break;
			case 'award_list': //
				componentsDisplay = (
					<div className={style.img_box}>
						<Icon type="cross" onClick={this.closeModal} className={style.close_icon} />
						<img src={award_list} className={style.alert_congratulation} />
						
							{userAwardList && userAwardList.length !== 0 ? (
                                <div className={style.alert_list}>
								<div className={style.alert_list_c}>
									<List>
										{userAwardList &&
											userAwardList.map((item, key) => {
												return (
													<Item
														key={key}
														extra={
															<Button
																className={style.btn_loan2}
																type="primary"
																size="small"
																inline
																onClick={this.props.goRoute}
															>
																立即领取
															</Button>
														}
													>
														{item.valDes}
													</Item>
												);
											})}
									</List>
								</div>
                                </div>
							) : (
								<div className={style.tip_text}>
									还没有抽中奖品，<br /> 快去试试手气吧～
								</div>
							)}
						
					</div>
				);
				break;
			case 'no_award': // 没有中奖
				titText = '抱歉，未抽中奖品';
				loginModal = [ 'login_modal' ];
				componentsDisplay = (
					<div className={style.img_box}>
						<Icon type="cross" onClick={this.closeModal} className={style.close_icon} />
						<img src={thanks} className={style.alert_congratulation} />
						<div className={style.tip_text}>
							没关系，完成首借款，<br /> 可返最高500元现金
						</div>
						<Button className={style.btn_loan} onClick={this.props.goRoute} type="primary">
							立即参与
						</Button>
					</div>
				);
				break;
			case 'no_chance': // 没有抽奖机会
				loginModal = [ 'login_modal' ];
				componentsDisplay = (
					<div className={style.img_box}>
						<Icon type="cross" onClick={this.closeModal} className={style.close_icon} />
						<img src={tip} className={style.alert_congratulation} />
						<div className={style.tip_text}>
							您的抽奖次数已用尽，<br /> 不要贪心哦～
						</div>
						<Button className={style.btn_loan} onClick={this.props.goRoute} type="primary">
							立即参与
						</Button>
					</div>
				);

				break;
			default:
				break;
		}
		return (
			<div>
				{this.state.modal1 && (
					<Modal
						className={loginModal.join(' ')}
						visible={this.state.modal1}
						transparent
						onClose={this.onClose('modal1')}
					>
						{componentsDisplay}
					</Modal>
				)}
			</div>
		);
	}
}
