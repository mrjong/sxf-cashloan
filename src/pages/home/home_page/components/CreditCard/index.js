/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2019-12-24 17:45:21
 */
import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';
import ZButton from 'components/ButtonCustom';
import WhiteCard from '../WhiteCard';

export default class CreditCard extends React.Component {
	constructor(props) {
		super(props);
	}
	static propTypes = {
		children: PropTypes.node
	};

	static defaultProps = {
		children: ''
	};

	render() {
		const { handleClick, btnText, percentData } = this.props;
		const showData = {
			title: '还到-基础版',
			bankNo: '',
			subtitle: '预审额度(元)',
			money: '36000.00',
			btnText: btnText, // mpos中展示文案不同
			color: 'rgba(248, 164, 65, 1)'
		};
		const iconClass = 'logo_ico';
		return (
			<div className="carouselHome">
				<div className={style.title}>
					<i className={['bank_ico', iconClass, `${style.bankLogo}`].join(' ')} />
					<i>{showData.title}</i>
				</div>
				<WhiteCard showData={showData} noLogoBtn={true} handleClick={handleClick}>
					<div className={style.contentBox}>
						<div className={style.box}>
							<div className={style.flex1}>
								<div className={style.subtitle}>
									<i />
									{showData.subtitle}
								</div>
								<div className={style.money} style={{ color: showData.color && showData.color }}>
									{showData.money ? showData.money : '----.--'}
								</div>
								<p className={style.descText}>预审通过，添加收款信用卡</p>
							</div>
						</div>
					</div>
					<div className={style.progressBox}>
						<span>{percentData}</span>%已完成
					</div>
				</WhiteCard>
				<ZButton onClick={handleClick} className={style.submitBtn}>
					{showData.btnText}
				</ZButton>
			</div>
		);
	}
}
