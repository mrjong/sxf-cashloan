import React, { Component } from 'react';
import style from './index.scss';

export default class StepBar extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { current } = this.props;
		const steps = [
			{
				period: '首期',
				title: '3422',
				desc: '本金本金3000+利息300+服务费+3',
				subDesc: '-优惠178'
			},
			{
				period: '2期',
				title: '3422',
				desc: '本金本金3000+利息300+服务费+3本金本金3000+利息300+服务费+3',
				subDesc: '-优惠178'
			},
			{
				period: '3期',
				title: '3422',
				desc: '本金本金3000+利息300+服务费+3',
				subDesc: '-优惠178'
			},
			{
				period: '4期',
				title: '3422',
				desc: '本金本金3000+利息300+服务费+3',
				subDesc: '-优惠178'
			},
			{
				period: '5期',
				title: '3422',
				desc: '本金本金3000+利息300+服务费+3',
				subDesc: '-优惠178'
			}
		];
		return (
			<div className={style.step_wrap}>
				<ul>
					{steps &&
						steps.length > 0 &&
						steps.map((item) => (
							<li key={item.period} className={style.item_wrap}>
								<div className={style.top_line}>
									<span className={style.step_index}>{item.period}</span>
									<span className={style.circle_dot}></span>
									<span className={style.step_title}>
										<i>¥ </i>
										<i className={style.value}>{item.title}</i>
									</span>
								</div>
								<div className={style.right_box}>
									<span className={style.step_desc}>{item.desc}</span>
									<span className={style.step_subDesc}>{item.subDesc}</span>
								</div>
							</li>
						))}
				</ul>
			</div>
		);
	}
}
