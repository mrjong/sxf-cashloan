import React from 'react';
import PropTypes from 'prop-types';
import typeConfig from './typeConfig';
import { thousandFormatNum } from 'utils/common';
import ButtonCustom from 'components/ButtonCustom';

import classNM from './SwitchCardItem.scss';

export default class ActivityEntry extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	static propTypes = {
		cardType: PropTypes.string // 卡片类型 是新手版 还是 plus 版 或者是其他版本
	};

	static defaultProps = {
		cardType: 'basic'
	};

	buildCardWrapStyle() {
		const { cardType } = this.props;
		return {
			backgroundColor: typeConfig[cardType].colorMain,
			boxShadow: `0px 9px 15px -13px ${typeConfig[cardType].colorMain}`
		};
	}

	buildHeaderStyle() {
		const { cardType } = this.props;
		return {
			borderBottom: `1px dashed ${typeConfig[cardType].colorTextMainOpacity}`
		};
	}

	buildCardNameStyle() {
		const { cardType } = this.props;
		return {
			color: typeConfig[cardType].colorTextMain
		};
	}

	buildCardNameSubStyle() {
		const { cardType, titleSubIsBankNo } = this.props;
		let cardNameSubStyleFinal = {
			color: typeConfig[cardType].colorTextSub
		};
		if (titleSubIsBankNo) {
			cardNameSubStyleFinal.fontFamily = 'DINMitAlt';
			cardNameSubStyleFinal.fontWeight = 'bold';
			cardNameSubStyleFinal.color = typeConfig[cardType].colorTextMain;
		}
		return cardNameSubStyleFinal;
	}

	buildProgressTextStyle() {
		const { cardType } = this.props;
		return {
			color: typeConfig[cardType].colorTipBg
		};
	}

	buildProgressNumStyle() {
		const { cardType } = this.props;
		return {
			color: typeConfig[cardType].colorTipBg
		};
	}

	buildDetailLinkTextStyle() {
		const { cardType } = this.props;
		return {
			color: typeConfig[cardType].colorTextSub
		};
	}

	buildDetailLinkArrowStyle() {
		const { cardType } = this.props;
		return {
			tintColor: typeConfig[cardType].colorTextSub
		};
	}

	buildTipTextStyle() {
		const { cardType } = this.props;
		return {
			color: typeConfig[cardType].colorTipText,
			backgroundColor: typeConfig[cardType].colorTipBg
		};
	}

	buildLoanTextStyle() {
		const { cardType } = this.props;
		return {
			color: typeConfig[cardType].colorTextSub
		};
	}

	buildLoanAmoutStyle() {
		const { cardType } = this.props;
		return {
			color: typeConfig[cardType].colorTextMain
		};
	}

	buildBottomTipTextStyle(color) {
		const { cardType } = this.props;
		return {
			color: color || typeConfig[cardType].colorTipBg
		};
	}

	renderTopTip() {
		const { topTip } = this.props;
		if (topTip) {
			return (
				<span className={classNM.tipText} style={this.buildTipTextStyle()}>
					{topTip}
				</span>
			);
		}
		return null;
	}

	renderBottomTip() {
		const { bottomTip, bottomTip2 } = this.props;
		let myColor = '';
		if (bottomTip2) {
			myColor = '#b69254';
		}
		if (bottomTip) {
			return (
				<div className={classNM.bottomTipWrap}>
					<div className={classNM.bottomTipText} style={this.buildBottomTipTextStyle(myColor)}>
						{bottomTip}
					</div>
					<div className={classNM.bottomTipText} style={this.buildBottomTipTextStyle(myColor)}>
						{bottomTip2}
					</div>
				</div>
			);
		}
		return null;
	}

	renderProgress() {
		const { progress } = this.props;
		if (progress) {
			return (
				<div className={classNM.progressWrap}>
					<span className={classNM.progressText} style={this.buildProgressTextStyle()}>
						已完成
					</span>
					<span className={classNM.progressNum} style={this.buildProgressNumStyle()}>
						{progress}%
					</span>
				</div>
			);
		}
		return null;
	}

	renderDetailLink() {
		const { cardType, isShowDetailLink, handleDetailClick } = this.props;

		if (isShowDetailLink) {
			return (
				<div className={classNM.detailLinkWrap} onClick={handleDetailClick}>
					<span className={classNM.detailLinkText} style={this.buildDetailLinkTextStyle()}>
						了解详情
					</span>
					<span
						className={classNM.additionArrow}
						style={{ borderLeftColor: typeConfig[cardType].colorTextSub }}
					></span>
				</div>
			);
		}
		return null;
	}

	renderLoanContent() {
		const { loanText, loanAmont, loanAmontUnit } = this.props;
		if (loanText) {
			let loanAmontStyle = {
				...this.buildLoanAmoutStyle(),
				fontSize: !isNaN(Number(loanAmont)) ? '.8rem' : '.54rem',
				fontFamily: !isNaN(Number(loanAmont)) ? 'DINMitAlt' : 'PingFangSC-Regular'
			};
			return (
				<div className={classNM.loanWrap}>
					<p className={classNM.loanText} style={this.buildLoanTextStyle()}>
						{loanText}
					</p>
					<p className={classNM.loanAmout} style={loanAmontStyle}>
						{thousandFormatNum(loanAmont)}
						{loanAmontUnit ? <span style={{ fontSize: '.3rem' }}>{loanAmontUnit}</span> : null}
					</p>
				</div>
			);
		}
		return null;
	}

	renderStatusContent() {
		const { statusTitle, statusTitleSub } = this.props;
		if (statusTitle) {
			return (
				<div className={classNM.statusWrap}>
					<p className={classNM.statusTitle}>{statusTitle}</p>
					<p className={classNM.statusTitleSub}>{statusTitleSub}</p>
				</div>
			);
		}
		return null;
	}

	buildBtnStyle() {
		const { cardType } = this.props;
		const myConfig = typeConfig[cardType];

		return {
			color: myConfig.colorMain,
			backgroundColor: myConfig.colorTextMain
		};
	}

	renderBtn() {
		const { btnText, handleClick } = this.props;
		return (
			<ButtonCustom
				size="lg"
				className={classNM.myBtn}
				long="false"
				style={this.buildBtnStyle()}
				onClick={handleClick}
			>
				{btnText}
			</ButtonCustom>
			// <div className={classNM.myBtn} style={this.buildBtnStyle()} onClick={handleClick}>
			// 	{btnText}
			// </div>
		);
	}

	render() {
		const { myIndex, activeIndex, title, titleSub } = this.props;
		return (
			<div
				className={[
					classNM.cardWrap,
					myIndex === activeIndex && classNM.cardWrapActive,
					myIndex < activeIndex && classNM.cardWrapBehidInLeft,
					myIndex > activeIndex && classNM.cardWrapBehidInRight
				].join(' ')}
				style={this.buildCardWrapStyle()}
			>
				<div className={classNM.header} style={this.buildHeaderStyle()}>
					<div className={classNM.cardNameWrap}>
						<span className={classNM.cardName} style={this.buildCardNameStyle()}>
							{title}
						</span>
						<span className={classNM.cardNameSub} style={this.buildCardNameSubStyle()}>
							{titleSub}
						</span>
					</div>
					{this.renderProgress()}
					{this.renderDetailLink()}
				</div>

				{this.renderTopTip()}

				{this.renderStatusContent() || this.renderLoanContent()}

				{this.renderBottomTip()}

				{this.renderBtn()}
			</div>
		);
	}
}
