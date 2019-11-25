/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-11-25 15:36:19
 */
import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import { Modal } from 'antd-mobile';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import fetch from 'sx-fetch';
import WelfareModal from 'components/WelfareModal';

const API = {
	POP_MODAL: '/popup/list' // 结清弹框
};
@fetch.inject()
export default class repayment_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			orderSuccess: {
				billPrcpAmt: '--',
				perdUnit: '--',
				billRegDt: '--'
			},
			// isShowTipsModal: true
			isShowTipsModal: false,
			configModalInf: [] // 结清页弹框信息
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

	// 关闭弹窗
	closeModal = () => {
		buriedPointEvent(order.closeModal);
		this.setState({
			isShowTipsModal: false
		});
	};

	/**
	 * 结清页弹框是否显示
	 * @param 无
	 * @return {void}
	 */
	requestGetConfigModal = () => {
		// site 0:首页 1:结清页
		this.props.$fetch.get(`${API.POP_MODAL}/1`, {}, { hideLoading: true }).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data && result.data.length) {
				result.data.map((item) => (item.hadShow = false));
				setTimeout(() => {
					this.setState({
						isShowTipsModal: true,
						configModalInf: result.data
					});
				}, 200);
			} else {
				this.setState({
					isShowTipsModal: false,
					configModalInf: []
				});
			}
		});
	};

	/**
	 * 关闭结清页弹框
	 * @param 无
	 * @return {void}
	 */
	closeWelfareModal = (modalInf) => {
		const { configModalInf } = this.state;
		configModalInf.length &&
			configModalInf.map((item) => {
				if (modalInf && item.code === modalInf.code) {
					return (item.hadShow = true);
				}
			});
		this.setState(
			{
				isShowTipsModal: !this.state.isShowTipsModal,
				configModalInf
			},
			() => {
				let filterModalInf =
					configModalInf.length &&
					configModalInf.filter((ele) => {
						return ele.hadShow === false;
					});
				if (filterModalInf.length) {
					setTimeout(() => {
						this.setState({
							isShowTipsModal: !this.state.isShowTipsModal
						});
					}, 200);
				}
			}
		);
	};

	/**
	 * 点击按钮跳转落地页
	 * @param 无
	 * @return {void}
	 */
	jumpLand = (modalInf) => {
		if (modalInf) {
			const { configModalInf } = this.state;
			let filterModalInf = configModalInf.filter((ele) => {
				return ele.hadShow === false && ele.code === modalInf.code;
			});
			if (filterModalInf[0].skipType === '1') {
				window.location.href = filterModalInf[0].skip;
			} else if (filterModalInf[0].skipType === '2') {
				// skip 0 代表跳转首页 1代码跳转优惠券列表页面
				if (filterModalInf[0].skip === '1') {
					this.props.history.push({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
				} else {
					// 关闭弹框 跳转首页
					this.props.history.push('/home/home');
				}
			} else {
				// 无跳转
				// 暂时不作处理 只关闭弹框
				this.closeWelfareModal(modalInf);
			}
		}
	};

	render() {
		const { isShowTipsModal, configModalInf } = this.state;
		let configeFilterModalInf = configModalInf.filter((ele) => {
			return ele.hadShow === false;
		});
		return (
			<div className={styles.repayment_succ_page}>
				<div className={styles.tips}>
					<i className={styles.success_ico} />
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
				<Modal wrapClassName={styles.success_modal_warp} visible={isShowTipsModal} transparent>
					{isShowTipsModal && (
						<WelfareModal
							welfareModalInf={configeFilterModalInf.length ? configeFilterModalInf[0] : {}}
							fetch={this.props.$fetch}
							closeWelfareModal={this.closeWelfareModal}
							welfareModalBtn={this.jumpLand}
							closeBtnStyle={styles.close_btn}
							wrapperStyle={styles.wrapperStyle}
						/>
					)}
				</Modal>
			</div>
		);
	}
}
