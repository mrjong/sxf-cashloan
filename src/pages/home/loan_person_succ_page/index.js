import React, { PureComponent } from 'react';
import style from './index.scss';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';

@setBackGround('#fff')
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			copyText: '还到'
		};
	}
	componentWillMount() {
		buriedPointEvent(home.manualAudit)
	}
	copyOperation = () => {
		buriedPointEvent(home.manualAuditFollow)
		this.props.toast.info('复制成功！马上打开微信关注“还到”');
		setTimeout(() => {
			window.postMessage('复制成功', () => {});
		}, 0);
	};
	render() {
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>需要人工审核，耐心等待</div>
					<div className={style.subtitle}>
						<a>010-86355 XXX</a>的审核电话
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[ style.step_item, style.active ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							放款审核中
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={[ style.title ].join(' ')}>
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
				<CopyToClipboard text={this.state.copyText} onCopy={() => this.copyOperation()}>
					<ZButton className={style.submitBtn}>关注“还到”公众号</ZButton>
				</CopyToClipboard>
				<div className={style.desctext}>关注还到公众号 实时查看审核进度</div>
			</div>
		);
	}
}
