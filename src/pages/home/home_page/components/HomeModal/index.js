/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-03-19 16:03:35
 */
import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import { AgreementModal, WelfareModal } from 'components';
import { setHomeModalAction } from 'reduxes/actions/commonActions';
import { connect } from 'react-redux';
import { recordContract } from 'utils';
import { store } from 'utils/store';
import OverDueModal from '../OverDueModal';
import './index.scss';

@connect(
	(state) => ({
		homeModal: state.commonState.homeModal,
		homeData: state.commonState.homeData,
		userInfo: state.staticState.userInfo
	}),
	{ setHomeModalAction }
)
export default class HomeModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			DataList: []
		};
	}
	componentDidMount() {}
	UNSAFE_componentWillReceiveProps(nextProps) {
		//逾期>活动>福利专区
		this.getOpenType(nextProps);
	}

	closeWelfareModal = () => {
		const { DataList = [] } = this.state;
		this.closeOverdueModal();
		setTimeout(() => {
			this.props.setHomeModalAction({
				DataList: DataList.slice(1)
			});
		}, 300);
	};
	/**
	 * 点击按钮跳转落地页
	 * @param 无
	 * @return {void}
	 */
	jumpLand = (item) => {
		if (item) {
			switch (item.skipType) {
				case '1':
					this.setState(
						{
							visible: false
						},
						() => {
							store.setOutLinkUrl(item.skip);
							window.location.href = item.skip;
						}
					);

					break;
				case '2':
					if (item.skip === '1') {
						if (this.props.homeModal && this.props.homeModal.mPosition === '还款结果页') {
							this.setState(
								{
									visible: false
								},
								() => {
									this.props.history.replace({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
								}
							);
						} else {
							this.setState(
								{
									visible: false
								},
								() => {
									this.props.history.push({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
								}
							);
						}
					} else {
						// 暂时不作处理 只关闭弹框
						this.closeWelfareModal();
						if (this.props.homeModal && this.props.homeModal.mPosition === '账单结清页') {
							this.props.history.push('/home/home');
						}
					}
					break;
				default:
					this.closeWelfareModal();
					break;
			}
		}
	};
	getOpenType = (nextProps) => {
		if (nextProps.homeData) {
			const dcDataInfo = nextProps.homeData.dcDataInfo || {};
			const cashDataInfo = nextProps.homeData.cashDataInfo || {};
			const preApprDataInfo = nextProps.homeData.preApprDataInfo || {};
			this.billNo = dcDataInfo.billNo || cashDataInfo.billNo || preApprDataInfo.billNo;
		}
		if (nextProps.userInfo) {
			this.tokenId = nextProps.userInfo.tokenId;
		}
		if (
			nextProps &&
			nextProps.homeModal &&
			nextProps.homeModal.DataList &&
			nextProps.homeModal.DataList.length > 0
		) {
			this.setState(
				{
					DataList: nextProps.homeModal.DataList
				},
				() => {
					// 订单页不需要显示问题
					if (
						!nextProps.homeModal ||
						!nextProps.homeModal.routeName ||
						nextProps.homeModal.routeName !== 'Order'
					) {
						setTimeout(() => {
							this.open();
						}, 300);
					}
				}
			);
		} else {
			this.homeModalRef && this.homeModalRef.close();
		}
	};

	open = () => {
		this.setState({
			visible: true
		});
	};

	closeOverdueModal = () => {
		this.setState({
			visible: false
		});
	};
	render() {
		const { fetch } = this.props;
		const { DataList = [], visible } = this.state;
		const currProgress =
			DataList &&
			DataList[0] &&
			DataList[0].olpSts === '1' &&
			DataList[0].progressInfos &&
			DataList[0].progressInfos.length > 0 &&
			DataList[0].progressInfos.filter((item) => item.hasProgress);
		const overDueInf = currProgress && currProgress.length > 0 && currProgress[currProgress.length - 1];

		return (
			<div>
				{DataList && DataList[0] && DataList[0].plpSts === '1' ? (
					<Modal visible={visible} transparent wrapClassName="agreement_modal_warp" maskClosable={false}>
						<AgreementModal
							visible={visible}
							handleClick={() => {
								this.closeWelfareModal();
								recordContract({
									contractType: '02'
								});
							}}
						/>
					</Modal>
				) : (
					<Modal visible={visible} transparent className="welfareModal" maskClosable={false}>
						{DataList &&
						DataList[0] &&
						DataList[0].olpSts === '1' &&
						this.billNo &&
						location.pathname === '/home/home' ? (
							<OverDueModal
								overDueInf={overDueInf}
								decreaseCoupExpiryDate={DataList[0].decreaseCoupExpiryDate}
								tokenId={this.tokenId}
								handleClick={() => {
									this.setState(
										{
											visible: false
										},
										() => {
											this.props.history.push({
												pathname: `/order/order_detail_page`,
												state: {
													billNo: this.billNo
												}
											});
										}
									);
								}}
								openModal={this.open}
								closeModal={this.closeOverdueModal}
							/>
						) : (
							<div>
								{
									<div>
										<WelfareModal
											welfareModalBtn={this.jumpLand}
											closeWelfareModal={this.closeWelfareModal}
											welfareModalInf={DataList[0]}
											fetch={fetch}
										/>
									</div>
								}
							</div>
						)}
					</Modal>
				)}
			</div>
		);
	}
}
