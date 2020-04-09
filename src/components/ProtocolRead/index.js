import React from 'react';
import PropTypes from 'prop-types';
import classNM from './index.scss';

import radioUnSelected from './img/unselected_ico.png';
import radioSelected from './img/selected_ico.png';

export default class ProtaocolRead extends React.Component {
	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		isSelect: PropTypes.bool,
		tip: PropTypes.string,
		tipLast: PropTypes.string,
		offsetH: PropTypes.string,
		radioImg: PropTypes.string,
		radioImgActive: PropTypes.string,
		radioActiveBg: PropTypes.string
	};

	static defaultProps = {
		style: {},
		className: '',
		isSelect: false,
		tip: '点击按钮，表示同意',
		offsetH: '0.3rem',
		radioImg: radioUnSelected,
		radioImgActive: radioSelected,
		radioActiveBg: '#3a4258'
	};

	constructor(props) {
		super(props);
		this.state = {
			activityList: []
		};
	}

	handleClickRadio = () => {
		this.props.clickRadio && this.props.clickRadio();
	};

	handleClickProtocol = (item) => {
		this.props.clickProtocol && this.props.clickProtocol(item);
	};

	render() {
		const {
			style,
			className,
			isSelect,
			tip,
			tipLast,
			protocolList,
			offsetH,
			radioImgActive,
			radioImg,
			radioActiveBg
		} = this.props;
		return (
			<div style={style} className={[classNM.protocolReadWrap, className].join(' ')}>
				<div
					className={classNM.checkRadioWrap}
					onClick={this.handleClickRadio}
					style={{ paddingLeft: offsetH }}
				>
					<img
						src={isSelect ? radioImgActive : radioImg}
						className={classNM.checkRadio}
						style={{ backgroundColor: isSelect ? radioActiveBg : 'transparent' }}
						alt=""
					/>
				</div>
				<p className={classNM.listWrap} style={{ paddingRight: offsetH }}>
					<span className={classNM.protocolTip} onClick={this.handleClickRadio}>
						{tip}
					</span>
					{protocolList.map((item, idx) => (
						<span
							onClick={() => {
								this.handleClickProtocol(item);
							}}
							key={idx}
							className={classNM.listItem}
						>
							《{item.contractMdlName || item.label}》
						</span>
					))}
					{tipLast ? <span className={classNM.protocolTipLast}>{tipLast}</span> : null}
				</p>
			</div>
		);
	}
}
