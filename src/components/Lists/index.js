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
				<span key={index} style={{ color: item.color, fontSize: '0.34rem' }}>
					{item.name}
				</span>
			);
		});
		return extraList;
	};

	render() {
		const { listsInf, className, insureFee } = this.props;
		const Item = List.Item;
		const Brief = Item.Brief;
		return (
			<div className={`${styles.listsContainer} ${className} list_box`}>
				<List>
					{insureFee && (
						<Item
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
							{insureFee.label.name}
						</Item>
					)}
					{listsInf.map((item, index) => {
						const icon = <i className={item.label.className} />;
						return (
							<div key={index}>
								<Item
									className={item.label.className ? styles.hasIcon : null}
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
									{item.label.name}
									{item.label.brief ? <Brief>{item.label.brief}</Brief> : null}
									{
										<Consumer>
											{({ footerTipIcon }) => {
												return (
													footerTipIcon &&
													item.label.name === '优惠劵' &&
													footerTipIcon && (
														<div className={styles.rightIcon}>
															<span className={styles.redBag}></span>
															5个可用
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
