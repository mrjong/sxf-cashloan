import React, { Component } from 'react';
import styles from './index.scss';
export default class RuleShow extends Component {
	componentWillMount() {}
	closeModal = () => {
		const { onCloseCb } = this.props;
		onCloseCb();
	};
	render() {
		const { ruleTit, ruleDesc } = this.props;
		// ruleDesc = ruleDesc.replace(/\r\n/g, '<br/>');
		return (
			<div className={styles.ruleModal}>
				<div className={styles.mask} />
				<div className={styles.modalWrapper}>
					<div>
						<div className={styles.title}>{ruleTit}</div>
						<div className={styles.content}>
							<div dangerouslySetInnerHTML={{ __html: ruleDesc }} />
							{/* {this.props.ruleDesc} */}
						</div>
						<div className={styles.closeBtn} onClick={this.closeModal} />
					</div>
				</div>
			</div>
		);
	}
}
