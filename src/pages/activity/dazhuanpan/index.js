import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import styles from './index.scss';
import AwardShow from './components/AwardShow';
import RuleShow from './components/RuleShow';
import { setBackGround } from 'utils/setBackGround';
import bg from './img/bg.png';
import zp_bg from './img/zp_bg.png';
import zp_btn from './img/zp_btn.png';
import item1 from './img/item1.png';
@fetch.inject()
@setBackGround('#260451')
export default class dc_landing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			numdeg: 0,
			time: 0,
			realDeg: 45,
			transformType: 'linear',
			awardList: [
				{
					prizeId: 1,
					name: '一等奖',
					imgUrl: item1,
					type: '红包',
					valType: '个',
					valDes: '5'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				},
				{
					prizeId: 2,
					name: '二等奖',
					imgUrl: item1,
					type: '优惠券',
					valType: '折',
					valDes: '1'
				}
			]
		};
	}
	isTurn = false;
	componentWillMount() {}
	start = () => {
		if (this.isTurn) {
			return;
		}
		this.setState({
			numdeg: 360 * 1,
			time: 10,
			transformType: 'ease-in'
		});
		let demotime = parseInt(Math.random() * 10) * 1000;
		console.log(demotime);
		setTimeout(() => {
			this.setState(
				{
					numdeg: this.state.realDeg - 25,
					time: 3,
					transformType: 'ease-out'
				},
				() => {
					console.log(this.state.time);
				}
			);
		}, demotime);
	};

	render() {
		const { awardList, time, transformType } = this.state;
		return (
			<div className={styles.dazhuanpan}>
				<div className={styles.bg}>
					<img className={styles.img} src={bg} />
					<div className={styles.hd_box}>
						<div className={styles.get_award_list}>
							<AwardShow />
						</div>
						<div className={styles.zp_bg_box}>
							{/* 转盘灯 */}
							<img className={styles.zp_bg} src={zp_bg} />
							{/* 按钮 */}
							<img className={styles.zp_btn} src={zp_btn} onClick={this.start} />
							{/* 转盘 */}
							<div
								className={styles.zp_box}
								style={{
									transform: `scale(0.85) rotate(${this.state.numdeg}deg)`,
									WebkitTransition: `-webkit-transform ${time}s ${transformType}`,
									transition: `-webkit-transform ${time}s ${transformType}`,
									transition: `transform ${time}s ${transformType}`,
									transition: `transform ${time}s ${transformType}`
								}}
							>
								{/* 奖品 */}
								<div className={styles.zp_img_box}>
									{awardList.map((item, index) => {
										return (
											<img
												key={index}
												className={styles.img1}
												src={item.imgUrl}
												style={{
													transform: `rotate(${index * (360 / awardList.length)}deg)`
												}}
											/>
										);
									})}
								</div>
							</div>
						</div>
						<div className={styles.get_rule_desc}>
							<RuleShow />
						</div>
					</div>
				</div>
			</div>
		);
	}
}
