/*
 * @Author: shawn
 * @LastEditTime: 2020-04-28 10:53:12
 */
import React, { PureComponent } from 'react';
import { Icon } from 'antd-mobile';
// import { buriedPointEvent } from 'utils/analytins';
// import { home } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import style from './index.scss';
import { domListen } from 'utils/domListen';
import { ButtonCustom } from 'components';
import {} from 'fetch/api.js';
import { connect } from 'react-redux';
import { setRouterTypeAction } from 'reduxes/actions/commonActions';
import { thousandFormatNum } from 'utils/common';

@setBackGround('#fff')
@fetch.inject()
@createForm()
@domListen()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		credictInfo: state.commonState.credictInfo,
		authId: state.staticState.authId
	}),
	{
		setRouterTypeAction
	}
)
export default class lend_confirm_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {}

	componentWillUnmount() {}

	// 查看详情
	checkDetail = () => {
		// 跳转标识存入redux
		this.props.setRouterTypeAction('lendConfirm');
		this.props.history.push({
			pathname: '/home/confirm_agency'
		});
	};

	// 保留额度稍后借款
	savaCredict = () => {
		this.props.history.push('/home/home');
	};

	// 立即放款至信用卡

	render() {
		const { credictInfo = {} } = this.props;
		return (
			<div className={style.lend_confirm}>
				<div className={style.lend_confirm_cont}>
					<h2 className={style.lend_tit}>
						以您现有资质
						<br />
						本次借款审批成功金额
					</h2>
					<p className={style.realAmt}>
						¥<span>{thousandFormatNum(credictInfo && credictInfo.credAmt)}</span>
					</p>
					<p className={style.applyAmt}>
						本次申请金额(元)：<span>{thousandFormatNum(credictInfo && credictInfo.applyAmt)}</span>
					</p>
					<div className={style.detailWrap} onClick={this.checkDetail}>
						<span>借款详情</span>
						<div className={style.detailRight}>
							<span>查看</span>
							<Icon type="right" className={style.enterIcon} />
						</div>
					</div>
				</div>
				<div className={style.buttonWrap}>
					<ButtonCustom
					// onClick={}
					>
						立即放款至信用卡
					</ButtonCustom>
					<ButtonCustom
						outline="true"
						outlinetype="solid"
						outlinecolor="#FFBC00"
						color="#FFBC00"
						className={style.saveBtn}
						onClick={this.savaCredict}
					>
						保留额度稍后借款
					</ButtonCustom>
				</div>
			</div>
		);
	}
}
