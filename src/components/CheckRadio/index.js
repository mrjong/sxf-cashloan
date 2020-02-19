/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-02-18 17:24:14
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNM from './index.scss';

export default class CheckRadio extends React.PureComponent {
	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		isSelect: PropTypes.bool
	};

	static defaultProps = {
		style: {},
		className: '',
		isSelect: false
	};

	buildClassNames = () => {
		const { className, isSelect } = this.props;
		return [classNM.selectStyle, isSelect ? '' : classNM.unselectStyle, className].join(' ');
	};

	buildStyles = () => {
		const { style } = this.props;
		let btnStyle = { ...style };
		return btnStyle;
	};

	render() {
		/*eslint-disable*/
		let {
			style,
			className,
			isSelect,
			...restProps
		} = this.props;
		return <i className={this.buildClassNames()} style={this.buildStyles()} {...restProps} />;
	}
}
