import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import ExamineComponents from 'components/ExamineComponents';
import { setBackGround } from 'utils/background';
import qs from 'qs';
import { store } from 'utils/store';

import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
let autId = '';
const API = {
	isBankCard: '/my/chkCard', // 是否绑定了银行卡
	chkCredCard: '/my/chkCredCard' // 查询信用卡列表中是否有授权卡
};
@fetch.inject()
@setBackGround('#fff')
export default class credit_apply_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		autId = query && query.autId;
	}
	// 判断是否绑卡
	checkIsBandCard = () => {
		buriedPointEvent(home.assessingBindCard);
		const api = autId ? `${API.chkCredCard}/${autId}` : API.isBankCard;
		this.props.$fetch.get(api).then((result) => {
			// 跳转至储蓄卡
			if (result && result.msgCode === 'PTM2003') {
				store.setCheckCardRouter('checkCardRouter');
				this.props.toast.info(result.msgInfo);
				store.setBackUrl('/home/home');
				setTimeout(() => {
					this.props.history.replace({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.msgCode === 'PTM2002') {
				store.setCheckCardRouter('checkCardRouter');
				this.props.toast.info(result.msgInfo);
				store.setBackUrl('/home/home');
				setTimeout(() => {
					this.props.history.replace({
						pathname: '/mine/bind_credit_page',
						search: `?noBankInfo=true&autId=${autId}`
					});
				}, 3000);
			} else {
				this.props.history.push('/home/home');
			}
		});
	};
	render() {
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>预计最快90秒完成审核</div>
					<div className={style.subtitle}>高峰期可能5分钟左右</div>
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
							绑定还款储蓄卡<a
								onClick={() => {
									this.checkIsBandCard();
								}}
							>
								先去绑卡
							</a>
						</div>
						<div className={style.line} />
					</div>
					<div className={[ style.step_item ].join(' ')}>
						<div className={style.title}>
							<div className={style.step_circle} />
							获得额度签约借款
						</div>
						<div className={style.line} />
					</div>
				</div>
			</div>
		);
	}
}
