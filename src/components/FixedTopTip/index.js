import React from 'react';
import PropTypes from 'prop-types';
import classNM from './index.scss';

export default class FixedTopTip extends React.PureComponent {
	static propTypes = {
		title: PropTypes.string,
		tip: PropTypes.string
	};

	static defaultProps = {
		title: '温馨提示：',
		tip: '学生禁止使用还到'
	};

	render() {
		const { className, style, top, title, tip } = this.props;

		return (
			<div style={{ ...style, top }} className={[classNM.fixed_top_tip_wrap, className].join(' ')}>
				<span className={classNM.top_tip_title}>{title}</span>
				<span className={classNM.top_tip_text}>{tip}</span>
			</div>
		);
	}
}
