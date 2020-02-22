/*
 * @Author: shawn
 * @LastEditTime: 2020-02-22 15:41:50
 */
import React from 'react';
import { Modal, Icon } from 'antd-mobile';
import { connect } from 'react-redux';
import styles from './index.scss';
import { setIframeProtocolHide } from 'reduxes/actions/commonActions';
@connect(
	(state) => ({
		iframeProtocolData: state.commonState.iframeProtocolData
	}),
	{
		setIframeProtocolHide
	}
)
export default class IframeProtocol extends React.Component {
	constructor(props) {
		super(props);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.iframeProtocolData && nextProps.iframeProtocolData.url) {
			document.body.style.overflow = 'hidden';
			document.body.style.position = 'fixed';
		} else {
			document.body.style.overflow = 'scroll';
			document.body.style.position = 'relative';
		}
		// this.modal.addEventListener(
		// 	'touchmove',
		// 	function(e) {
		// 		e.preventDefault();
		// 	},
		// 	false
		// );
	}
	onClose = () => {
		this.props.setIframeProtocolHide('');
	};

	render() {
		const { iframeProtocolData = {} } = this.props;
		return (
			<Modal
				popup
				visible={iframeProtocolData.url ? true : false}
				className={[styles.antModal, styles.scrollModal].join(' ')}
				onClose={this.onClose}
				animationType="slide-up"
				// ref={(m) => (this.modal = m)}
			>
				<Icon type="cross" className={styles.closeIcon} onClick={this.onClose} />
				<div>
					<iframe
						className={styles.iframeContainer}
						src={`/disting/#/${iframeProtocolData.url}`}
						name={iframeProtocolData.url}
						id={iframeProtocolData.url}
						onLoad={() => {
							iframeProtocolData.contractInf &&
								window.frames[iframeProtocolData.url].setData(iframeProtocolData.contractInf);
						}}
						width="100%"
						height="100%"
						frameBorder="0"
					/>
				</div>
			</Modal>
		);
	}
}
