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
													item.feeNm === '合计' ? styles.list_desc_container_FW : styles.list_desc_container
												}
											>
												{item.feeNm}
											</label>
										</div>
										<div
											className={item.feeNm === '合计' ? styles.list_desc_extra_FW : styles.list_desc_extra}
										>
											<span>{parseFloat(item.feeAmt).toFixed(2)}</span>
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
