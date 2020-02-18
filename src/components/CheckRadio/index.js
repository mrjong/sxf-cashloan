/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-02-18 16:54:21
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
			type,
			long,
			size,
			shape,
			borderradius,
			icononright,
			children,
			onClick,
			iconsource,
			iconStyle,
			iconClassName,
			loading,
			...restProps
		} = this.props;
		return <i className={this.buildClassNames()} style={this.buildStyles()} {...restProps} />;
	}
}
