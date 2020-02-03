import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.scss';

export default class ButtonCustom extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		active: PropTypes.bool,
		children: PropTypes.node,
		onClick: PropTypes.func
	};

	static defaultProps = {
		className: '',
		active: false,
		children: '按钮',
		onClick: () => {}
	};

	showSubTextDesc = (name) => {
		if (name === '服务费') {
			return '（由平台方收取）';
		} else if (name === '本金' || name === '利息') {
			return '（由出借方收取）';
		}
	};

	render() {
		const { listdescinfo = [], isClear } = this.props;
		return (
			<div>
				<ul
					className={[styles.list_desc_container_box, isClear && styles.list_desc_container_clearbox].join(
						' '
					)}
				>
					{listdescinfo.length > 0 &&
						listdescinfo.map((item, index) => {
							if (parseFloat(item.feeAmt) !== 0) {
								return (
									<li
										key={index}
										className={
											!isClear
												? `${styles.list_desc_container} ${styles.hasTotal}`
												: styles.list_desc_container
										}
									>
										<div className={styles.list_desc_content}>
											<label
												className={
													index === listdescinfo.length - 1
														? styles.list_desc_container_FW
														: styles.list_desc_container
												}
											>
												{item.feeNm}
												<span className={styles.list_sub_desc}>{this.showSubTextDesc(item.feeNm)}</span>
											</label>
										</div>
										<div
											className={
												index === listdescinfo.length - 1 ? styles.list_desc_extra_FW : styles.list_desc_extra
											}
										>
											{item.feeNm === '优惠金额' || item.feeNm === '减免金额' ? (
												<span className={styles.red_box}>-优惠{parseFloat(item.feeAmt)}</span>
											) : (
												<span>{parseFloat(item.feeAmt).toFixed(2)}</span>
											)}
										</div>
									</li>
								);
							}
						})}
				</ul>
			</div>
		);
	}
}
