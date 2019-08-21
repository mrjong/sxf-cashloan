import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';

export default class Panel extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		title: PropTypes.string,
		children: PropTypes.node,
		extra: PropTypes.object
	};

	static defaultProps = {
		className: '',
		title: '面板标题',
		children: '面板内容。。。。',
		extra: {}
	};

	render() {
		const { className, title, children, extra, ...restProps } = this.props;
		console.log(this.props);
		return (
			<div className={`${style.panel_wrap} ${className}`} {...restProps}>
				<h2 className={style.panle_title}>
					{title}
					{extra && (
						<span style={extra.style} onClick={extra.clickCb}>
							{extra.text} {extra.icon}
						</span>
					)}
				</h2>
				<div className={style.panle_content}>{children}</div>
			</div>
		);
	}
}
