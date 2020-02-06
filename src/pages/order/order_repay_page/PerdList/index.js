import React, { Component } from 'react';
import { List } from 'antd-mobile';
import styles from './index.scss';
import Image from 'assets/image';

class PerdList extends Component {
	/**
	 * @description 切换子账单详情展示
	 */
	togglePerdDetailShow = (index) => {
		const { perdList, onPerdDetailShow } = this.props;
		for (let i = 0; i < perdList.length; i++) {
			const item = perdList[i];
			if (i === index) {
				item.showDetail = !item.showDetail;
			} else {
				item.showDetail = false;
			}
		}
		onPerdDetailShow(perdList);
	};

	showSubTextDesc = (name) => {
		if (name === '服务费') {
			return '（由平台方收取）';
		} else if (name === '本金' || name === '利息') {
			return '（由出借方收取）';
		}
	};

	/**
	 * @description 渲染子账单详情面板
	 */
	renderPerdDetail = (arr) => {
		return arr.map((item, index) => (
			<div key={index}>
				{item.feeAmt ? (
					<div
						key={index}
						className={[styles.list_detail_item, index === arr.length - 1 && styles.list_detail_total]}
					>
						<div style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
							<span
							// style={[
							// 	styles.textDesc,
							// 	index === arr.length - 1
							// 		? styles.list_detail_total_text
							// 		: this.showSubTextDesc(item.feeNm)
							// 		? { width: px(100) }
							// 		: {}
							// ]}
							>
								{item.feeNm}
							</span>
							<span style={styles.sub_textDesc}>{this.showSubTextDesc(item.feeNm)}</span>
						</div>

						{item.feeNm === '优惠金额' || item.feeNm === '减免金额' ? (
							<div style={styles.red_box}>
								<span style={[styles.textDesc, styles.red_text]}>-优惠{item.feeAmt.toFixed(2)}</span>
							</div>
						) : (
							<span style={[styles.textDesc, index === arr.length - 1 && styles.list_detail_total_text]}>
								{item.feeAmt.toFixed(2)}
							</span>
						)}
					</div>
				) : null}
			</div>
		));
	};

	render() {
		const { perdList, perdLth } = this.props;
		console.log(perdList, 'perd-item');
		const iconChecked = <img src={Image.icon.checked} />;
		const iconCheckedNo = <img src={Image.icon.checked_no} />;

		return (
			<List>
				{/* 账单列表 */}
				{perdList &&
					perdList.map((item, index) => {
						return (
							<div key={index}>
								<List.Item
									// className={[
									// 	item.label.className ? styles.hasIcon : isCheckbox ? styles.checkList : null,
									// 	!item.isShowCheck && styles.nocheckbox_list_desc
									// ].join(' ')}
									arrow={'horizontal'}
									onClick={() => {
										// this.props.onCheckboxClick(item);
										this.togglePerdDetailShow(index);
									}}
									extra={
										<div className={styles.extraWrap}>
											<span>{item.perdTotAmt.toFixed(2)}</span>
											<span style={{ color: item.color }}>{item.perdStsNm}</span>
										</div>
									}
									thumb={true ? iconChecked : iconCheckedNo}
								>
									{/* {isCheckbox && item.isShowCheck && (
										<span
											onClick={(e) => {
												e.stopPropagation();
												checkClickCb(item);
											}}
											className={
												item.isChecked
													? `${styles.checkBoxStyle} ${styles.checkBoxActiveStyle}`
													: styles.checkBoxStyle
											}
										/>
									)} */}
									{`${item.perdNum}/${perdLth}期`}
									<List.Item.Brief>{`应支付日：${item.perdDueDt}`}</List.Item.Brief>
								</List.Item>

								{item.showDetail ? <div>{this.renderPerdDetail()}</div> : null}
							</div>
						);
					})}
			</List>
		);
	}
}

export default PerdList;
