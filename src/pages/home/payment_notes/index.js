import React, { PureComponent } from 'react';
import style from './index.scss';
import { NoticeBar } from 'antd-mobile';
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
					本金、利息由出借人收取，本次贷款利率不超过<em>24%/年</em>
					，具体利率标准以借款合同约定为准，您也可通过《借款确认书》进行查询。
				</dd>
				<dt>还款方式：</dt>
				<dd>等本等息，即您在借款期内每月偿还同等数额的本金和同等数额的利息。</dd>
				<dt>计算公式：</dt>
				<dd>每月应还款金额=（借款总利息+借款本金）/还款期数。</dd>
				<dt>提前还款规则：</dt>
				<dd>您可以在每期还款日前，偿还当期账单，经出借人同意，您可以提前结清未到期账单。</dd>
				<dt>逾期还款规则：</dt>
				<dd>
					逾期还款的，出借人会收取罚息。罚息按照借款<em>本金*0.1%/日计算。</em>
					同时，您在借款时使用的逾期当期优惠将被撤回作为逾期利息。逾期会影响您的个人信用，请您珍视信用，及时还款。
				</dd>
				<dt>收费规则：</dt>
				<dd>
					本金、利息、罚息（如有）、逾期利息（如有）由出借人收取。 风险保障金（如有）由融资担保公司收取。
				</dd>

				<div className={style.fix_bottom}>
					<NoticeBar
						marqueeProps={{
							loop: true,
							leading: 1000,
							trailing: 1000,
							style: { color: '#C9CDD5', fontSize: '0.22rem' }
						}}
						icon={null}
					>
						'出借人仅收取本金、利息、罚息（如有），其他费用以您与平台的约定为准'
					</NoticeBar>
				</div>
			</dl>
		);
	}
}
