/*
 * @Author: shawn
 * @LastEditTime: 2019-09-11 20:31:27
 */
import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { getMxStatus, switchCreditService } from 'utils';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import progressIcon from './img/crawl.png';
const API = {
	USER_IMPORT: '/auth/cardAuth'
};

@fetch.inject()
@setBackGround('#fff')
export default class crawl_progress_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showPopover: '0'
		};
	}

	componentWillMount() {
		const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (queryData.showPopover && queryData.showPopover !== '0') {
			this.setState({
				showPopover: queryData.showPopover
			});
		}
		if (store.getPercentCount()) {
			this.props.$fetch
				.get(API.USER_IMPORT)
				.then(() => {
					store.setPercentCount(null);
				})
				.catch(() => {});
		}
	}

	componentWillUnmount() {
		store.removeAutId2();
	}

	tryAgain = () => {
		if (this.state.showPopover !== '2') {
			this.goMoxieBankList();
		} else {
			buriedPointEvent(home.HomeCardRenew);
			this.props.history.replace('/home/crawl_progress_page');
		}
	};

	goMoxieBankList = async () => {
		store.setMoxieBackUrl('/home/home');
		let mxRes = await getMxStatus({ $props: this.props });
		if (mxRes && mxRes === '0') {
			let mxQuery = location.pathname.split('/');
			let RouterType = (mxQuery && mxQuery[2]) || '';
			this.props.history.push(`/common/crash_page?RouterType=${RouterType}`);
		} else {
			switchCreditService({ $props: this.props });
		}
		buriedPointEvent(home.importOtherCreditCard);
	};
	render() {
		let { showPopover } = this.state;
		return (
			<div className={style.crawl_fail_page}>
				<img src={progressIcon} className={style.progress_icon} />
				<div className={style.progress_desc}>
					资料收齐，只差添加需要还款的信用卡，
					<span>已完成98% </span>
					<span className={style.apply_success}> 申请成功</span>
				</div>
				<div className={style.popover_inner}>信用卡账单导入失败</div>
				{showPopover !== '0' ? (
					<div className={style.popover}>
						<div className={style.arrow} />
						<div className={style.inner}>多次失败建议换张信用卡，已送您一张免息券</div>
					</div>
				) : null}
				<div
					className={style.button}
					onClick={() => {
						this.goMoxieBankList();
					}}
				>
					选择导入其他银行卡
				</div>
				<div style={{ textAlign: 'center' }} onClick={this.tryAgain}>
					尝试再次导入
				</div>
			</div>
		);
	}
}
