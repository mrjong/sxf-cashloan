import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';
import award_modal_bg from '../../img/award_modal_bg.png';
import use_btn from '../../img/use_btn.png';
import coupon_img from '../../img/coupon_img.png'
import my_award_bg from '../../img/award_bg.png'

export default class WinPrize extends Component {

	static defaultProps = {
	};
	constructor(props) {
		super(props);
		this.state = {
			isPrizeModal: true,
		};
	}

	closeModal = () => {
		const { setalertType } = this.props;
		this.setState({
			isPrizeModal: false
		});
		setalertType && setalertType();
	};

	// 点击按钮
	go = () => {
		const { clickCb } = this.props;
		clickCb();
  	};
	render() {
		const { title, subTit, type, clickCb } = this.props;
		const { isPrizeModal } = this.state;
		return (
			<Modal className="win_prize_modal" visible={isPrizeModal} transparent>
				
					{
						type && type === 'myAward' && // 我的奖品
						<div className={style.my_prize_cont}>
							<img src={my_award_bg} className={style.win_prize_bg} alt="huodong" />
							<h3 className={style.my_prize_tit}>我的奖品</h3>
							<ul className={style.award_list}>
								<li>
									<div className={style.award_cont}>
										<img src={coupon_img} alt="" />
										<div className={style.award_txt}>
											<p>15元免息券</p>
											<p className={style.award_desc}>（借款满3000元可用）</p>
										</div>
									</div>
									<span onClick={()=>{ clickCb() }} className={style.award_use}>立即使用</span>
								</li>
							</ul>
						</div>

					}
					{
						!(type && type === 'myAward') &&
						<div className={style.win_prize_cont}>
							<img src={award_modal_bg} className={style.win_prize_bg} alt="huodong" />
							<div className={style.win_tit_cont}>
								<p className={style.win_prize_tit}>{title}</p>
								<p>{subTit}</p>
							</div>
							<img src={use_btn} onClick={()=>{ clickCb() }} className={style.win_prize_btn} alt="button" />
						</div>
					}
				<i className={type && type === 'myAward' ? `${style.closeBtn} ${style.closeBtn2}` : style.closeBtn} onClick={this.closeModal} />
			</Modal>
		);
	}
}
