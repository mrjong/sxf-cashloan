/*
 * @Author: shawn
 * @LastEditTime: 2020-02-20 18:13:45
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
import CouponModal from 'components/CouponModal';
import { isShowCouponModal, closeCouponModal } from '../loan_apply_succ_page/common';

@setBackGround('#fff')
@fetch.inject()
export default class loan_robot_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			queryData: null,
			couponModalShow: false
		};
	}

	componentWillMount() {
		isShowCouponModal(this);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		queryData &&
			this.setState({
				queryData
			});
	}

	componentDidMount() {
		const { queryData } = this.state;
		if (queryData && queryData.apptoken) {
			//如果从APP过来
			store.setToken(queryData.apptoken);
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

	render() {
		const { queryData, couponModalShow } = this.state;
		return (
			<div className={style.remit_ing_page}>
				<div className={style.topImg}>
					<ExamineComponents />
				</div>
				<div className={style.topBox}>
					<div className={style.title}>需要人工审核，耐心等待</div>
					<div className={style.subtitle}>
						<a>{queryData && queryData.telNo}</a>的审核电话
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
								<span>请注意接听{queryData && queryData.telNo}的审核电话</span>
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

				<div className={style.submitBtnWrap}>
					<ZButton onClick={this.handleButtonClick}>我知道了</ZButton>
				</div>
				{/* 首贷首期用户-还款券测试 */}
				<CouponModal
					visible={couponModalShow}
					onConfirm={() => {
						closeCouponModal(this);
					}}
					couponData={queryData && queryData.couponInfo}
				/>
			</div>
		);
	}
}
