import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';
import SXFButton from 'components/ButtonCustom';
import LoginAlert from '../LoginAlert';

export default class ModalWrap extends Component {

	constructor(props) {
		super(props);
		this.state = {
			modalShow: true,
		};
	}

	closeCb = () => {
		this.setState({
			modalShow: false
		});
	};

	render() {
		let componentsDisplay = null;
		const { modalShow } = this.state;
		const { history, contType } = this.props;
		switch (contType) {
			case 'login_tip': //
				componentsDisplay = (
					
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
				componentsDisplay = (
					<div className={style.img_box}>
						<Icon type="cross" onClick={this.closeModal} className={style.close_icon} />
						<img src={thanks} className={style.alert_congratulation} />
						<div className={style.tip_text}>
							没关系，完成首借款<br /> 可返最高500元现金
						</div>
						<Button className={style.btn_loan} onClick={this.props.goRoute} type="primary">
							立即参与
						</Button>
					</div>
				);
				break;
			case 'no_chance': // 没有抽奖机会
				componentsDisplay = (
					<div className={style.img_box}>
						<Icon type="cross" onClick={this.closeModal} className={style.close_icon} />
						<img src={tip} className={style.alert_congratulation} />
						<div className={style.tip_text}>
							您的抽奖次数已用尽<br />完成首借立返最高500元现金
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
			<Modal
				className="login_alert_modal"
				visible={modalShow}
				transparent
				// onClose={this.onClose('modalShow')}
			>
				<div className={style.modal_wrap_style}>
					<i onClick={this.closeCb} className={style.close_icon} />
					<LoginAlert history={history} />
				</div>
			</Modal>
		);
	}
}
