import React, { PureComponent } from 'react';
import style from './index.scss';
import { setBackGround } from 'utils/background';

@setBackGround('#fff')
export default class payment_notes_page extends PureComponent {
	render() {
		return (
			<dl className={style.page_wrap}>
				<dt>出借人：</dt>
				<dd>以借款合同约定为准。</dd>
				<dt>贷款利率：</dt>
				<dd>
					本金、利息由出借人收取，本次贷款利率为：<em>14.4%/年</em>
					，具体利率标准以借款合同约定为准，贷款利率不超过24%/年
				</dd>
				<dt>还款方式：</dt>
				<dd>等额本息，即您在借款期内每月偿还同等数额的款项（包括本金和利息）</dd>
				<dt>计算公式：</dt>
				<dd>
					每月应还金额=借款本金总金额×［年化利率/12×（1+年化利率/12）ⁿ］/［（1+年化利率/12）n-1］，n为还款期数
				</dd>
				<dt>提前还款规则：</dt>
				<dd>您可以在每期还款日前，偿还当期账单，借款期限届满3个月后，您方能提前结清未到期账单</dd>
				<dt>逾期还款规则：</dt>
				<dd>
					逾期还款的，出借人会收取罚息。罚息按照<em>当期未还本金的0.06%/天计算</em>
					。逾期会影响到您的个人信用，请您珍视信用，及时还款
				</dd>
			</dl>
		);
	}
}
