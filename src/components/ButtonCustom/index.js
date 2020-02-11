import React from 'react';
import PropTypes from 'prop-types';
import classNM from './index.scss';
import Images from 'assets/image';

const _handleClick = (onClick, event) => {
	event.preventDefault();
	!!onClick && onClick();
};

export default class ButtonCustom extends React.PureComponent {
	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		color: PropTypes.string,
		type: PropTypes.oneOf(['default', 'yellow', 'gray', 'golden', 'error']),
		backgroundcolor: PropTypes.string,
		iconsource: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.func, PropTypes.string]),
		iconStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
		// icononright: PropTypes.bool,
		long: PropTypes.string,
		size: PropTypes.oneOf(['xl', 'lg', 'md', 'sm', 'xs']),
		// outline: PropTypes.bool,
		outlinecolor: PropTypes.string,
		outlinewidth: PropTypes.string,
		outlinetype: PropTypes.oneOf(['solid', 'dotted', 'dashed']),
		shape: PropTypes.oneOf(['rect', 'radius', 'circle']),
		borderradius: PropTypes.string,
		disabled: PropTypes.bool,
		// loading: PropTypes.bool,
		loadingsize: PropTypes.oneOf(['xl', 'lg', 'md', 'sm', 'xs']),
		children: PropTypes.node,
		interval: PropTypes.number,
		onClick: PropTypes.func
	};

	static defaultProps = {
		className: '',
		disabled: false,
		type: 'yellow',
		size: 'xl',
		long: 'true',
		// loading: false,
		loadingsize: 'xl',
		// icononright: false,
		// outline: false,
		outlinecolor: '#C9CDD5',
		outlinewidth: '1px',
		outlinetype: 'solid',
		shape: 'circle',
		borderradius: '0.1rem',
		children: '去申请',
		interval: 1600,
		onClick: () => {}
	};

	prePressTime = 0;

	handleClick = (event) => {
		const { disabled, loading, interval, onClick } = this.props;
		const now = Date.now();

		if (disabled || loading) return;

		if (interval > 0 || this.prePressTime > 0) {
			if (now - this.prePressTime > interval) {
				this.prePressTime = now;
				_handleClick(onClick, event);
			}
		} else {
			_handleClick(onClick, event);
		}
	};

	// 生成按钮图标
	renderIcon() {
		const { iconsource, loading, icononright } = this.props;
		let iconStyleFinaly = {};
		if (icononright) {
			iconStyleFinaly.marginLeft = '10px';
		} else {
			iconStyleFinaly.marginRight = '10px';
		}
		if (loading) {
			return <img src={Images.gif.btn_loading} className={classNM.sxp_btn_icon} style={iconStyleFinaly} />;
		}
		if (iconsource) {
			return <img src={iconsource} className={classNM.sxp_btn_icon} style={iconStyleFinaly} />;
		}
		return null;
	}

	buildClassNames = () => {
		const { className, type, long, size, shape } = this.props;
		return [
			classNM.sxp_btn,
			className,
			long === 'true' ? classNM.sxp_btn_long : '',
			classNM[`sxp_btn_${size}`],
			classNM[`sxp_btn_${type}`],
			classNM[`sxp_btn_${shape}`]
		].join(' ');
	};

	buildStyles = () => {
		const {
			style,
			color,
			backgroundcolor,
			shape,
			borderradius,
			outline,
			outlinewidth,
			outlinetype,
			outlinecolor
		} = this.props;
		let btnStyle = { ...style };
		if (color) {
			btnStyle.color = color;
		}
		if (backgroundcolor) {
			btnStyle.backgroundColor = backgroundcolor;
		}
		if (shape === 'radius' && borderradius) {
			btnStyle.borderradius = borderradius;
		}
		if (outline) {
			btnStyle.border = `${outlinewidth} ${outlinetype} ${outlinecolor}`;
			btnStyle.backgroundColor = 'transparent';
		}
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
      loading,
			...restProps
		} = this.props;
		return (
			<button
				onClick={(event) => this.handleClick(event)}
				className={this.buildClassNames()}
				style={this.buildStyles()}
				{...restProps}
			>
				{icononright ? children : this.renderIcon()}
				{icononright ? this.renderIcon() : children}
			</button>
		);
	}
}
