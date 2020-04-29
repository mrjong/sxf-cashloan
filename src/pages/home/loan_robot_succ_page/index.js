/*
 * @Author: shawn
 * @LastEditTime: 2020-04-29 17:09:45
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
import { FixedBar } from 'components';

@setBackGround('#fff')
@fetch.inject()
export default class loan_robot_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: null
		};
	}

	componentWillMount() {
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		queryData &&
			this.setState({
				queryData
			});

		const that = this;
		if (queryData && queryData.isPlus) {
			this.setState({
				isAppOpen: true,
				isPlus: queryData.isPlus
			});
		} else {
			document.addEventListener('message', that.checkAppOpen);
		}
	}

	componentDidMount() {
		const { queryData } = this.state;
		if (queryData && queryData.apptoken) {
			//如果从APP过来
			store.setToken(queryData.apptoken);
		}
	}

	componentWillUnmount() {
		const { queryData } = this.state;
		const that = this;
		if (queryData && queryData.isPlus) {
			this.setState({
				isAppOpen: false,
				isPlus: false
			});
		} else {
			document.removeEventListener('message', that.checkAppOpen);
		}
	}

	handleButtonClick = () => {
		const { queryData } = this.state;
		if (queryData && queryData.apptoken) {
			setTimeout(() => {
				if (queryData && queryData.isPlus) {
					window.ReactNativeWebView.postMessage('我知道了');
				} else {
					window.postMessage('我知道了', () => {});
				}
			}, 0);
		} else {
			this.props.history.push('/home/home');
		}
	};

	// 检查是否是app webview打开
	checkAppOpen = (e) => {
		const that = this;
		const passData = JSON.parse(e.data);
		that.setState({
			isAppOpen: passData && passData.isAppOpen,
			isPlus: passData && passData.isPlus
		});
	};

	render() {
		const { queryData, isAppOpen, isPlus } = this.state;
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>预计3小时内电话审核</div>
					<div className={style.subtitle}>
						审核电话为<a>{queryData && queryData.telNo}</a>，请保持电话通畅
					</div>
				</div>
				<div className={style.step_box_new}>
					<div className={[style.step_item, style.active].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							借款申请提交成功
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							<p className={style.telDesc}>电话审核</p>
						</div>
						<div className={style.line} />
					</div>
					<div className={[style.step_item].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							自动放款至信用卡
						</div>
						<div className={style.line} />
					</div>
				</div>

				<div className={style.submitBtnWrap}>
					<ZButton onClick={this.handleButtonClick}>我知道了</ZButton>
					<div className={style.descText}>关注还到公众号 实时查看审核进度</div>
				</div>

				{/* 吸底条 */}
				<FixedBar isAppOpen={isAppOpen} isPlus={isPlus} />
			</div>
		);
	}
}
