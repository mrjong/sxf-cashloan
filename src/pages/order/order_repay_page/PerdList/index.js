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
						className={[styles.detailItem, index === arr.length - 1 && styles.detailItemTotal].join(' ')}
					>
						<div>
							<span className={styles.detailLabel}>{item.feeNm}</span>
							<span className={styles.detailLabelSub}>{this.showSubTextDesc(item.feeNm)}</span>
						</div>

						{item.feeNm === '优惠金额' || item.feeNm === '减免金额' ? (
							<div className={styles.red_box}>
								<span>-优惠{item.feeAmt.toFixed(2)}</span>
							</div>
						) : (
							<span className={styles.detailValue}>{item.feeAmt.toFixed(2)}</span>
						)}
					</div>
				) : null}
			</div>
		));
	};

	render() {
		const { perdList, perdLth, onCheckboxClick } = this.props;

		return (
			<List className={styles.antListItem}>
				{perdList &&
					perdList.map((item, index) => {
						return (
							<div key={index}>
								<List.Item
									arrow={item.showDetail ? 'up' : 'down'}
									onClick={() => {
										this.togglePerdDetailShow(index);
									}}
									extra={
										<div className={styles.extraWrap}>
											<span className={styles.perdTotAmt}>{item.perdTotAmt.toFixed(2)}</span>
											<span style={{ color: item.color, fontSize: '0.24rem' }}>{item.perdStsNm}</span>
										</div>
									}
									thumb={
										item.isShowCheck ? (
											<img
												className={styles.checkboxIcon}
												src={item.isChecked ? Image.icon.checked : Image.icon.checked_no}
												onClick={(e) => {
													e.stopPropagation();
													onCheckboxClick(item);
												}}
											/>
										) : null
									}
								>
									{`${item.perdNum}/${perdLth}期`}
									<List.Item.Brief>{`应支付日：${item.perdDueDt}`}</List.Item.Brief>
								</List.Item>
								{item.showDetail ? (
									<div className={styles.perdDetailWrap}>{this.renderPerdDetail(item.fees)}</div>
								) : null}
							</div>
						);
					})}
			</List>
		);
	}
}

export default PerdList;