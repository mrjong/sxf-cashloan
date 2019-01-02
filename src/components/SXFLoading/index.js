import React, { Component } from 'react';
import PropTypes from 'prop-types';
import loadingImg from './img/loading.gif';
class SXFLoading extends Component {
	static propTypes = {
		mask: PropTypes.bool
	};
	static defaultProps = {
		mask: true
	};
	render() {
		const { mask } = this.props;
		return (
			<div>
				<div>
					{mask ? <div className="sxf_mask_transparent" /> : null}
					<div className="sxf_toast">
						<div>
							<img className="sxf_toast_img" src={loadingImg} />
						</div>
						{/* {content ? <div className="sxf_text">数据加载中...</div> : null} */}
					</div>
				</div>
			</div>
		);
	}
}

export default SXFLoading;
