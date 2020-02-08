/*
 * @Author: sunjiankun
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2020-02-08 15:20:57
 */
import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import { AgreementModal, WelfareModal } from 'components';
import { setHomeModalAction } from 'reduxes/actions/commonActions';
import { connect } from 'react-redux';
import { recordContract } from 'utils';

import OverDueModal from '../OverDueModal';
import style from './index.scss';

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
			const { goHome } = this.props;
			switch (item.skipType) {
				case '1':
					this.setState(
						{
							visible: false
						},
						() => {
							window.location.href = item.skip;
						}
					);

					break;
				case '2':
					if (item.skip === '1') {
						this.setState(
							{
								visible: false
							},
							() => {
								this.props.history.push({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
							}
						);
					} else {
						// 暂时不作处理 只关闭弹框
						this.closeWelfareModal();
						if (goHome) {
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
			this.billNo = dcDataInfo.billNo || cashDataInfo.billNo;
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
		const { fetch, navigation } = this.props;
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
						{DataList && DataList[0] && DataList[0].olpSts === '1' ? (
							<OverDueModal
								overDueInf={overDueInf}
								decreaseCoupExpiryDate={DataList[0].decreaseCoupExpiryDate}
								tokenId={this.tokenId}
								handleClick={() => {
									navigation.navigate('OrderDesc', {
										billNo: this.billNo
									});
									this.homeModalRef && this.homeModalRef.close();
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
