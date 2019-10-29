/*
 * @Author: shawn
 * @LastEditTime: 2019-10-29 11:37:05
 */
import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import ExamineComponents from 'components/ExamineComponents';
import ZButton from 'components/ButtonCustom';
// import { buriedPointEvent } from 'utils/analytins';
// import { manualAudit } from 'utils/analytinsType';
import qs from 'qs';
import { store } from '../../../utils/store';

let queryData = null;

@setBackGround('#fff')
@fetch.inject()
export default class loan_robot_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		if (queryData.apptoken) {
			//如果从APP过来
			store.setToken(queryData.apptoken);
		}
	}

	handleButtonClick = () => {
		if (queryData.apptoken) {
			setTimeout(() => {
				window.postMessage('我知道了', () => {});
			}, 0);
		} else {
			this.props.history.push('/home/home');
		}
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
						<a>021-60634627</a>的审核电话
						<br />
						至少会拨打3次，最长不超过3个工作日
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[style.step_item, style.active].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							放款审核中
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={[style.title, style.blue].join(' ')}>
							<div className={style.step_circle} />
							<p style={{ display: 'flex', alignItems: 'center' }}>
								<span>请注意接听021-60634627的审核电话</span>
							</p>
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							短信形式告知您审核结果，审核通过自动放款
						</div>
						<div className={style.line} />
					</div>
				</div>

				<ZButton className={style.submitBtn} onClick={this.handleButtonClick}>
					我知道了
				</ZButton>
			</div>
		);
	}
}
