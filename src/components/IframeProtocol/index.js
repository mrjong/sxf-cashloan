/*
 * @Author: shawn
 * @LastEditTime: 2019-08-30 15:46:57
 */
import React from 'react';
import { Modal, Icon } from 'antd-mobile';
import { connect } from 'react-redux';
import styles from './index.scss';
import { setIframeProtocolHide } from 'reduxes/actions/commonActions';
@connect(
	(state) => ({
		iframeProtocolUrl: state.commonState.iframeProtocolUrl
	}),
	{
		setIframeProtocolHide
	}
)
export default class IframeProtocol extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			prefix: '/disting/#/'
		};
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.iframeProtocolUrl) {
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
		const { postData, iframeProtocolUrl } = this.props;
		return (
			<Modal
				popup
				visible={iframeProtocolUrl ? true : false}
				className={[styles.antModal, styles.scrollModal].join(' ')}
				onClose={this.onClose}
				animationType="slide-up"
				// ref={(m) => (this.modal = m)}
			>
				<Icon type="cross" className={styles.closeIcon} onClick={this.onClose} />
				<iframe
					className={styles.iframeContainer}
					src={`${this.state.prefix}${iframeProtocolUrl}`}
					name={iframeProtocolUrl}
					id={iframeProtocolUrl}
					onLoad={() => {
						postData && window.frames[iframeProtocolUrl].setData(postData);
					}}
					width="100%"
					height="100%"
					frameBorder="0"
				/>
			</Modal>
		);
	}
}
