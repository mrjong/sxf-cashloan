import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import qs from 'qs';
import { setBackGround } from 'utils/background';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { store } from 'utils/store';
import { FixedBar, CreditWarnModal, ButtonCustom, ExamineComponents } from 'components';
import style from './index.scss';

let queryData = {};
@setBackGround('#fff')
@fetch.inject()
export default class remit_ing_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: {},
			isAppOpen: false,
			isPlus: false
		};
	}
	componentWillMount() {
		queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData && queryData.prodType && queryData.prodType === '21') {
			this.props.setTitle('快速打款中');
		}
		if (queryData && queryData.apptoken) {
			//如果从APP过来
			store.setToken(queryData.apptoken);
		}
		this.setState({
			queryData
		});
		buriedPointEvent(home.quickLoan);
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
	componentWillUnmount() {
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
					<div className={style.title}>{queryData.title}</div>
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

							{queryData && queryData.prodType && (queryData.prodType === '21' || queryData.prodType === '11')
								? '借款打入银行卡'
								: '自动放款信用卡'}
						</div>
						<div className={style.line} />
					</div>
				</div>

				<CreditWarnModal toast={this.props.toast} fetch={this.props.$fetch} />

				<ButtonCustom
					onClick={() => {
						buriedPointEvent(home.gotIt);
						if (isAppOpen) {
							setTimeout(() => {
								if (isPlus) {
									window.ReactNativeWebView.postMessage('我知道了');
								} else {
									window.postMessage('我知道了', () => {});
								}
							}, 0);
						} else {
							this.props.history.push('/home/home');
						}
					}}
					className={style.submitBtn}
				>
					我知道了
				</ButtonCustom>
				<p className={style.bottom_tip}>关注还到公众号 实时查看审核进度</p>
				{/* 吸底条 */}
				<FixedBar isAppOpen={isAppOpen} isPlus={isPlus} />
			</div>
		);
	}
}
