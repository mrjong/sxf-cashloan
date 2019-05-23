import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';
import { Carousel } from 'antd-mobile';
import ZButton from 'components/ButtonCustom';
import plus from './img/plus.png';
import bank from './img/bank.png';
import WhiteCard from '../WhiteCard';
import { isMPOS } from 'utils/common';

export default class carouselHome extends React.Component {
	constructor(props) {
		super(props);
	}
	static propTypes = {
		entryFrom: PropTypes.string,
		autoplay: PropTypes.bool,
		infinite: PropTypes.bool,
		dotStyle: PropTypes.object,
		dotActiveStyle: PropTypes.object,
		children: PropTypes.node,
		swipeSpeed: PropTypes.number,
		cellSpacing: PropTypes.number
	};

	static defaultProps = {
		entryFrom: 'banner',
		autoplay: true,
		infinite: true,
		cellSpacing: 1,
		dotStyle: {
			width: '0.2rem',
			height: '0.04rem',
			borderRadius: '0',
			backgroundColor: '#B7BAC1'
		},
		swipeSpeed: 100,
		dotActiveStyle: {
			width: '0.2rem',
			borderRadius: '0',
			height: '0.04rem',
			backgroundColor: '#121C32'
		},
		children: ''
	};

	render() {
		const { children, handleClick, btnText, ...restProps } = this.props;
		const showData = {
			title: '还到-基础版',
			bankNo: '',
			subtitle: '最高可申请还款金(元)',
			money: '50000.00',
			desc: '还款日：8888/88/88',
			btnText: !isMPOS() && btnText ? btnText : '添加需要还款信用卡' , // mpos中展示文案不同
			color: 'rgba(248, 164, 65, 1)',
		};
		const iconClass = 'logo_ico';
		return (
			<div className="carouselHome">
				<div className={style.title}>
					<i className={[ 'bank_ico', iconClass, `${style.bankLogo}` ].join(' ')} />
					<i>{showData.title}</i>
				</div>
				<WhiteCard showData={showData} noLogoBtn={true} handleClick={handleClick}>
					<Carousel {...restProps}>
						<div className={style.contentBox}>
							{showData.demoTip ? <div className={style.demoTip} /> : null}
							<div className={style.demoTip} />
							<div className={style.box}>
								<div className={style.flex1}>
									<div className={style.subtitle}>
										<i />
										{showData.subtitle}
									</div>
									<div className={style.money} style={{ color: showData.color && showData.color }}>
										{showData.money ? showData.money : '----.--'}
									</div>
								</div>
							</div>
							<div className={style.desc}>{showData.desc}</div>
						</div>
						<div className={style.contentBox}>
							<img src={bank} className={style.bank} />
							<div className={style.desc_b}>支持100+信用卡</div>
						</div>
						<div className={style.contentBox}>
							<img src={plus} className={style.plus} />
							<div className={style.desc_b}>2步操作，极速到账</div>
						</div>
					</Carousel>
				</WhiteCard>
				<ZButton onClick={handleClick} className={style.submitBtn}>
					{showData.btnText}
				</ZButton>
			</div>
		);
	}
}
