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
            case 'alert_tel': // 登录
                titText = '抢<span class="golden_text">12期</span>免息立减券';
				componentsDisplay = <LoginComponent refreshPageFn={refreshPageFn} closeCb={this.closeModal} />;
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
			case 'alert_img': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitleBox' ];
				componentsDisplay = (
					<div>
						<img src={this.props.alert_img} className={style.alert_10} />
						<div>
							<img src={alert_btn} onClick={this.props.goRoute} className={style.alert_btn} />
						</div>
					</div>
				);
                break;
                case 'alert_newUser': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitleBox' ];
				componentsDisplay = (
					<div>
						<img src={this.props.alert_img} className={style.alert_10} />
						<div>
							<img src={alert_btn} onClick={this.props.goRoute} className={style.alert_btn} />
						</div>
					</div>
				);
				break;
			case 'alert_15': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitleBox' ];
				componentsDisplay = (
					<div>
						<img src={alert_15} className={style.alert_10} />
						<div>
							<img src={alert_btn} onClick={this.props.goRoute} className={style.alert_btn} />
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
								{userAwardList &&
									userAwardList.map((item, key) => {
										return (
											<Item
												extra={
													<Button
														type="warning"
														size="small"
														inline
														onClick={this.props.goRoute}
													>
														立即使用
													</Button>
												}
											>
												{item.valDes}
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
			case 'rule_show': // 没有中奖
				titText = '活动规则';
				loginModal = [ 'login_modal', 'special_bg_modal' ];
				componentsDisplay = (
					<div className={[ style.alert_content ].join(' ')}>
						<div>1.活动时间：12月10日-12月22日；</div>
						<div>2.抽中免息券的用户，打开“还到”-“我的”-“优惠券”即可查看，借款时可使用；</div>
						<div>3.本活动获得的优惠券不可叠加使用，优惠券有效期7天，过期自动作废，请中奖用户中奖后尽快使用；</div>
						<div>4.本活动优惠券仅限在还到官方渠道使用；</div>
						<div>5.对于刷票（如：羊毛党），违法，赌博，等恶意行为，我司有权取消该类用户的参与资格，我司将追究其法律责任；</div>
						<div>6.本活动最终解释权归还到所有，如有疑问</div>
						<div>请拨打客服热线：<a className={style.tel} href="tel:4000887626">400-088-7626</a>。</div>
					</div>
				);
				break;
			case 'no_award': // 没有中奖
				titText = '抱歉，未抽中奖品';
				loginModal = [ 'login_modal', 'special_bg_modal' ];
				componentsDisplay = (
					<div className={[ style.text_center, style.btn_alert ].join(' ')}>
						谢谢参与～
						<Button onClick={this.props.goRoute} type="primary">
							立即借款
						</Button>
					</div>
				);
				break;
			case 'no_chance': // 没有抽奖机会
				titText = '抱歉，没有抽奖机会';
				loginModal = [ 'login_modal', 'special_bg_modal' ];
				componentsDisplay = (
					<div className={style.noChance}>
						今日机会已用完，请您明日再来
						<Button onClick={this.props.goRoute} type="primary">
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
							<div dangerouslySetInnerHTML={{__html: titText+''}}></div>
							<img className={closeArr.join(' ')} src={closeImg} onClick={this.closeModal} />
						</div>
						<div className={style.login_box}>{componentsDisplay}</div>
					</div>
				</Modal>
			</div>
		);
	}
}
