import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import ExamineComponents from 'components/ExamineComponents';
import { setBackGround } from 'utils/background';

@fetch.inject()
@setBackGround('#fff')
export default class credit_apply_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>预计最快90秒完成审核</div>
					<div className={style.subtitle}>
						高峰期可能5分钟左右
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[ style.step_item, style.active ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							快速评估中
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							获得额度签约借
						</div>
						<div className={style.line} />
					</div>
				</div>
			</div>
		);
	}
}
