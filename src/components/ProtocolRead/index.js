import React from 'react';
import PropTypes from 'prop-types';
import CheckRadio from '../CheckRadio';
import classNM from './index.scss';

export default class ProtaocolRead extends React.Component {
	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		isSelect: PropTypes.bool,
		tip: PropTypes.string,
		offsetH: PropTypes.string
	};

	static defaultProps = {
		style: {},
		className: '',
		isSelect: false,
		tip: '点击按钮，表示同意',
		offsetH: '0.3rem'
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
		const { style, className, isSelect, tip, protocolList, offsetH } = this.props;
		return (
			<div style={style} className={[classNM.protocolReadWrap, className].join(' ')}>
				<div
					className={classNM.checkRadioWrap}
					onClick={this.handleClickRadio}
					style={{ paddingLeft: offsetH }}
				>
					<CheckRadio isSelect={isSelect} style={{ top: '0.04rem' }} />
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
				</p>
			</div>
		);
	}
}
