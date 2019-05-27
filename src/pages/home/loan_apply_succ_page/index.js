import React, { PureComponent } from 'react';
import style from './index.scss';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';

@setBackGround('#fff')
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			copyText: ''
		};
	}
	render() {
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>预计60秒完成放款</div>
					<div className={style.subtitle}>
						超过2个工作日没有放款成功，可<a href="tel:400-088-7626">联系客服</a>
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[ style.step_item, style.active ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							借款申请提交成功
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							借款打入信用卡
						</div>
						<div className={style.line} />
					</div>
				</div>
			</div>
		);
	}
}
