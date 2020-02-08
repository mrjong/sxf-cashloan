/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-02-08 14:25:25
 */
import React, { Component } from 'react';
import style from './index.scss';

export default class StepBar extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { data } = this.props;
		return (
			<div className={style.step_wrap}>
				<ul>
					{data &&
						data.length > 0 &&
						data.map((item) => (
							<li key={item.perdNum} className={style.item_wrap}>
								<div className={style.top_line}>
									<span className={style.step_index}>{item.perdNum === '1' ? '首' : item.perdNum}期</span>
									<span className={style.circle_dot}></span>
									<span className={style.step_title}>
										<i>¥ </i>
										<i className={style.value}>{item.perdTotalMoney}</i>
									</span>
								</div>
								<div className={style.right_box}>
									<div className={style.step_desc}>
										<span>本金{item.perdPrcpAmt}</span>
										<span>+利息{item.perdItrtAmt}</span>
										{item.perdMngAmt && <span>+服务费{item.perdMngAmt}</span>}
									</div>
									{(item.perdDeductAmt && item.perdDeductAmt > 0 && (
										<span className={style.step_subDesc}>-优惠{item.perdDeductAmt}</span>
									)) ||
										null}
								</div>
							</li>
						))}
				</ul>
			</div>
		);
	}
}
