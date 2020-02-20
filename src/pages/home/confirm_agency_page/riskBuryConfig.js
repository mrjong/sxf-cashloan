/*
 * @Author: shawn
 * @LastEditTime: 2020-02-20 17:38:24
 */
exports.common = {
	title: '签约借款',
	pId: 'qyjk'
};

exports.cardBillAmtRiskBury = {
	type: 'input',
	key: 'cardBillAmt',
	remark: '借款金融输入框',
	actContain: ['focus', 'blur', 'delete', 'paste', 'value']
};

exports.homeLendersOrderRiskBury = {
	key: 'DC_HOME_LENDERS_ORDER',
	remark: '放款日期-还款日前一天'
};

exports.homeLendersRiskBury = {
	key: 'DC_HOME_LENDERS',
	remark: '放款日期-立即放款'
};

exports.showModalPlanOutRiskBury = {
	key: 'ShowModal_planOut',
	remark: '签约借款_还款计划_按钮'
};

exports.showModalPlanRiskBury = {
	key: 'ShowModal_plan',
	remark: '签约借款_还款计划_按钮'
};
