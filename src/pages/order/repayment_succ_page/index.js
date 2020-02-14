/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-25 15:36:19
 */
import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { msg_popup_list } from 'fetch/api.js';
import { setHomeModalAction } from 'reduxes/actions/commonActions';
import { connect } from 'react-redux';
import Images from 'assets/image';

@connect(
	() => ({}),
	{ setHomeModalAction }
)
@fetch.inject()
export default class repayment_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			orderSuccess: {
				billPrcpAmt: '--',
				perdUnit: '--',
				billRegDt: '--'
			}
		};
	}
	componentWillMount() {
		let test = store.getOrderSuccess();
		if (test) {
			let orderSuccess = test;
			this.setState({
				orderSuccess
			});
		}
		this.requestGetConfigModal();
	}

	// 返回首页
	backHome = (type) => {
		buriedPointEvent(type);
		this.props.history.push('/home/home');
	};

	/**
	 * 结清页弹框是否显示
	 * @param 无
	 * @return {void}
	 */
	requestGetConfigModal = () => {
		// site 0:首页 1:结清页
		this.props.$fetch.get(`${msg_popup_list}/1`, {}, { hideLoading: true }).then((res) => {
			if (res.code === '000000' && res.data && res.data.popups && res.data.popups.length > 0) {
				this.props.setHomeModalAction({
					DataList: res.data.popups,
					mPosition: '账单结清页'
				});
			}
		});
	};

	render() {
		return (
			<div className={styles.repayment_succ_page}>
				<div className={styles.tips}>
					<img className={styles.success_ico} src={Images.adorn.success} />
					<p>还款成功</p>
				</div>
				<div className={styles.details}>
					<p>借款金额：{this.state.orderSuccess.billPrcpAmt}元</p>
					<p>
						借款期限：{this.state.orderSuccess.perdLth}
						{this.state.orderSuccess.perdUnit === 'M' ? '个月' : '天'}
					</p>
					<p>申请借款日期：{this.state.orderSuccess.billRegDt}</p>
				</div>
				<ButtonCustom
					onClick={() => {
						this.backHome(order.returnHome);
					}}
					className={styles.back_btn}
				>
					返回首页
				</ButtonCustom>
			</div>
		);
	}
}
