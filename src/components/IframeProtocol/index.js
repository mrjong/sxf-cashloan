/*
 * @Author: shawn
 * @LastEditTime: 2020-03-10 17:39:43
 */
import React from 'react';
import { Modal, Icon } from 'antd-mobile';
import { connect } from 'react-redux';
import styles from './index.scss';
import { setIframeProtocolShow } from 'reduxes/actions/commonActions';
import { sxfburiedPointEvent } from 'utils/analytins';
@connect(
	(state) => ({
		iframeProtocolData: state.commonState.iframeProtocolData
	}),
	{
		setIframeProtocolShow
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
			nextProps.iframeProtocolData.pId &&
				sxfburiedPointEvent(`protocolModalOpen`, {
					pageCode: nextProps.iframeProtocolData.pId
				});
		} else {
			document.body.style.overflow = 'scroll';
			document.body.style.position = 'relative';
		}
	}
	onClose = () => {
		const { iframeProtocolData = {} } = this.props;
		iframeProtocolData &&
			iframeProtocolData.pId &&
			sxfburiedPointEvent(`protocolModalClose`, {
				pageCode: iframeProtocolData.pId
			});
		this.props.setIframeProtocolShow({
			url: ''
		});
	};

	render() {
		const { iframeProtocolData = {} } = this.props;
		return (
			<div>
				{iframeProtocolData.url ? (
					<Modal
						popup
						visible={iframeProtocolData.url ? true : false}
						className={styles.antModal}
						onClose={this.onClose}
						animationType="slide-up"
					>
						<Icon type="cross" className={styles.closeIcon} onClick={this.onClose} />
						<div className={styles.iframeContainer}>
							<iframe
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
				) : null}
			</div>
		);
	}
}
