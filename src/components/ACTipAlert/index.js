import React from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';
import btn from './img/btn.png';
class ACTipAlert extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { ACTipAlertShow, resetProps } = this.props;
		const { title, desc, closeBtnFunc } = resetProps;
		return (
			<Modal wrapClassName="ACTipAlert" visible={ACTipAlertShow} transparent>
				{title ? <div className={styles.title}>{title}</div> : null}
				{desc ? <div className={styles.desc}>{desc}</div> : null}
				<img onClick={closeBtnFunc} src={btn} className={styles.btn} />
			</Modal>
		);
	}
}

export default ACTipAlert;
