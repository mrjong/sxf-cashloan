import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';
import loadingImg from './img/loading.gif';
class SXFLoading extends Component {
	static propTypes = {
		mask: PropTypes.bool,
		content: PropTypes.string
	};
	static defaultProps = {
		mask: true,
		content: '数据加载中...'
	};
	render() {
		const { content, mask } = this.props;
		return (
			<div>
				<div>
					{mask ? <div className={style.mask_transparent} /> : null}
					<div className={style.toast}>
						<div>
							<img src={loadingImg} />
						</div>
						{content ? <div className={style.text}>数据加载中...</div> : null}
					</div>
				</div>
			</div>
		);
	}
}

export default SXFLoading;
