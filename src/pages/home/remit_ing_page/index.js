import React, { PureComponent } from 'react';
import style from './index.scss';
import { setBackGround } from 'utils/background';
import ExamineComponents from './components/ExamineComponents';
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
					<div className={style.title}>预计最快90秒完成审核</div>
					<div className={style.subtitle}>
						<a>010-86355 XXX</a>高峰期可能5分钟左右
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
						<div className={[ style.title, style.blue ].join(' ')}>
							<div className={style.step_circle} />
							请注意接听010-86355XXX的审核电话
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							短信形式告知您审核结果，审核通过自动放款
						</div>
						<div className={style.desc}>我们会尽快完成审核，最长不超过3个工作日</div>
						<div className={style.line} />
					</div>
				</div>
			</div>
		);
	}
}
