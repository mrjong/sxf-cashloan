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
		const { data, riskGuarantee } = this.props;
		return (
			<div className={style.step_wrap}>
				<ul>
					{data &&
						data.length > 0 &&
						data.map((item) => (
							<li key={item.perdNum} className={style.item_wrap}>
								<div className={style.top_line}>
									<span className={style.step_index}>{item.perdNum === 1 ? '首' : item.perdNum}期</span>
									<span className={style.circle_dot}></span>
									{riskGuarantee && item.riskGuaranteeAmt > 0 && (
										<span className={style.step_title1}>
											<i>风险保证金 </i>
											<i className={style.value}>{item.riskGuaranteeAmt}</i>
										</span>
									)}
									{item.perdTotalMoney > 0 && (
										<span className={style.step_title}>
											<i>¥ </i>
											<i className={style.value}>{item.perdTotalMoney}</i>
										</span>
									)}
								</div>
								<div className={style.right_box}>
									<div className={style.step_desc}>
										{!riskGuarantee ? (
											<span>
												{item.perdPrcpAmt > 0 && <span>本金{item.perdPrcpAmt}</span>}
												{item.perdItrtAmt > 0 && <span>+利息{item.perdItrtAmt}</span>}
												{item.riskGuaranteeAmt > 0 && <span>+风险保证金{item.riskGuaranteeAmt}</span>}
												{/* {item.perdMngAmt && <span>+服务费{item.perdMngAmt}</span>} */}
											</span>
										) : null}
									</div>
									{(item.perdDeductAmt && item.perdDeductAmt > 0 && (
										<span className={style.step_subDesc}>-优惠{item.perdDeductAmt}</span>
									)) ||
										null}
									{(item.deductRiskAmt && item.deductRiskAmt > 0 && (
										<span className={style.step_subDesc}>-优惠{item.deductRiskAmt}</span>
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
