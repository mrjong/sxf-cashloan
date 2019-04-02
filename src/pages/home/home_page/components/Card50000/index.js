import React from 'react';
import fetch from 'sx-fetch';
import style from './index.scss';
import SXFButton from 'components/ButtonCustom';
@fetch.inject()
export default class BankCard extends React.PureComponent {
	render() {
		const { children, showDiv,handleApply } = this.props;
		return (
			<div className={style.billBox}>
				<div className={style.billBox2}>
					<div className={style.title}>借钱还信用卡</div>
					<div className={showDiv==='circle'?style.box_height:style.box_50000_height}>{children}</div>
					<SXFButton className={style.smart_button_two} onClick={handleApply}>
						{showDiv === 'circle' ? '继续申请' : '免费申请'}
					</SXFButton>
					<div className={style.bankDesc}>
						<span>
							持牌机构
						</span>
						<span>
							2步认证
						</span>
						<span>
							3秒到账
						</span>
					</div>
				</div>
			</div>
		);
	}
}
