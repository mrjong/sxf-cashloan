import React, { Component } from 'react';
import { Modal, Button, Toast, Flex, List } from 'antd-mobile';
import LoginComponent from '../LoginComponent';
import style from './index.scss';
import closeImg from '../../img/20181024_close.png';
import alert_new_user from '../../img/alert_new_user.png';
import alert_btn_new_user from '../../img/alert_btn_new_user.png';
import alert_15 from '../../img/alert_15.png';
import alert_btn from '../../img/alert_btn.png';
import { buriedPointEvent } from 'utils/analytins';
import { activity_shuang12 } from 'utils/analytinsType';
const Item = List.Item;
function closest(el, selector) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}
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
    onWrapTouchStart = (e) => {
        if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            return;
        }
        const pNode = closest(e.target, '.am-modal-content');
        if (!pNode) {
            e.preventDefault();
        }
    }
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
						<img style={{ width: '80%' }} src={alert_new_user} className={style.alert_10} />
						<div>
							<img
								className={style.alert_btn_box}
								src={alert_btn_new_user}
								onClick={this.props.goRoute}
							/>
						</div>
					</div>
				);
				break;
			case 'alert_15': //
				loginModal = [ 'login_modal', 'big_modal' ];
				titleBoxArr = [ 'titleBox', 'noTitle_15' ];
				componentsDisplay = (
					<div>
						<img src={alert_15} className={style.alert_10} />
						<img src={alert_btn} onClick={this.props.goRoute} className={style.alert_btn} />
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
						<div>
							请拨打客服热线：<a className={style.tel} href="tel:4000887626">
								400-088-7626
							</a>。
						</div>
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
							立即拿钱
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
						<Button
							onClick={() => {
								// 打开弹窗按钮
								buriedPointEvent(activity_shuang12.shuang12_draw_over_click);
								this.props.goRoute();
							}}
							type="primary"
						>
							立即拿钱
						</Button>
						{/* <div className={style.text_small_box}>
							<div className={style.text_small}>完成授信和借款分别可获得1次机会</div>
							<div className={style.text_small}>授信机会+1 借款机会+1</div>
						</div> */}
					</div>
				);
				break;
			default:
				break;
		}
		return (
			<div className={style.login_alert} >
				<Modal
					className={loginModal.join(' ')}
					visible={this.state.modal1}
                    transparent
                    wrapProps={{ onTouchStart: this.onWrapTouchStart }}
					onClose={this.onClose('modal1')}
				>
					<div className="login_content">
						<div className={titleBoxArr.join(' ')}>
							<div dangerouslySetInnerHTML={{ __html: titText + '' }} />
							<img className={closeArr.join(' ')} src={closeImg} onClick={this.closeModal} />
						</div>
						<div className={style.login_box}>{componentsDisplay}</div>
					</div>
				</Modal>
			</div>
		);
	}
}
