import React, { PureComponent } from 'react';
import { List } from 'antd-mobile';
import ListDesc from '../ListDesc';
import styles from './index.scss';
import { Consumer } from 'pages/common/routerPage/context';

export default class Lists extends PureComponent {
	constructor(props) {
		super(props);
	}

	componentWillMount() {}
	getExtra = (list) => {
		let extraList = [];
		list.forEach((item, index) => {
			extraList.push(
				<span
					key={index}
					style={{
						color: item.color,
						fontWeight: '500',
						fontSize: item.fontSize ? item.fontSize : '0.26rem'
					}}
				>
					{item.name}
				</span>
			);
		});
		return extraList;
	};

	render() {
		const {
			listsInf,
			className,
			insureFee,
			isCheckbox,
			checkClickCb,
			penaltyInfo,
			isShowPenaltyCheck
		} = this.props;
		const Item = List.Item;
		const Brief = Item.Brief;
		return (
			<div className={`${styles.listsContainer} ${className} list_box`}>
				<List>
					{insureFee && (
						<Item
							className={styles.checkList}
							// className={insureFee.label.className ? styles.hasIcon : null}
							arrow={'empty'}
							extra={
								Object.prototype.toString.call(insureFee.extra) === '[object Array]' ? (
									this.getExtra(insureFee.extra)
								) : (
									<span style={{ color: insureFee.extra && insureFee.extra.color }}>
										{insureFee.extra && insureFee.extra.name}
									</span>
								)
							}
						>
							{isCheckbox && (
								<span
									className={
										true ? `${styles.checkBoxStyle} ${styles.checkBoxActiveStyle}` : styles.checkBoxStyle
									}
								/>
							)}
							{insureFee.label.name}
							{insureFee.label.brief ? <Brief>{insureFee.label.brief}</Brief> : null}
						</Item>
					)}
					{penaltyInfo && (
						<Item
							className={styles.checkList}
							arrow={'empty'}
							extra={
								Object.prototype.toString.call(penaltyInfo.extra) === '[object Array]' ? (
									this.getExtra(penaltyInfo.extra)
								) : (
									<span style={{ color: insureFee.extra && insureFee.extra.color }}>
										{insureFee.extra && insureFee.extra.name}
									</span>
								)
							}
						>
							{isCheckbox && (
								<span
									onClick={(e) => {
										e.stopPropagation();
										checkClickCb({ isChecked: false });
									}}
									className={
										true ? `${styles.checkBoxStyle} ${styles.checkBoxActiveStyle}` : styles.checkBoxStyle
									}
								/>
							)}
							{penaltyInfo.label.name}
							{penaltyInfo.label.brief ? (
								<Brief style={{ fontWeight: '500', color: '#121C32', fontSize: '0.3rem' }}>
									{penaltyInfo.label.brief}
								</Brief>
							) : null}
						</Item>
					)}
					{listsInf &&
						listsInf.map((item, index) => {
							const icon = <i className={item.label.className} />;
							return (
								<div key={index}>
									<Item
										className={item.label.className ? styles.hasIcon : isCheckbox ? styles.checkList : null}
										arrow={item.arrowHide ? item.arrowHide : 'horizontal'}
										onClick={() => {
											this.props.clickCb(item);
										}}
										extra={
											Object.prototype.toString.call(item.extra) === '[object Array]' ? (
												this.getExtra(item.extra)
											) : (
												<span style={{ color: item.extra && item.extra.color }}>
													{item.extra && item.extra.name}
												</span>
											)
										}
										thumb={icon}
									>
										{isCheckbox && item.isShowCheck && (
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
										)}
										{item.label.name}
										{item.label.brief ? <Brief>{item.label.brief}</Brief> : null}
										{
											<Consumer>
												{({ footerTipIcon }) => {
													return (
														footerTipIcon &&
														item.label.name === '优惠劵' && (
															<div className={styles.rightIcon}>
																{footerTipIcon === 'yhq7' ? '7折免息券' : '50元免息券'}
															</div>
														)
													);
												}}
											</Consumer>
										}
									</Item>
									{item.feeInfos && item.showDesc ? (
										<div>
											<ListDesc isClear={item.isClear} listdescinfo={item.feeInfos} />
										</div>
									) : null}
								</div>
							);
						})}
				</List>
			</div>
		);
	}
}
