export default {
	LN0001: {
		indexSts: 'LN0001',
		indexMsg: '信用卡未授权',
		indexData: {}
	},
	LN0002: {
		indexSts: 'LN0002',
		indexMsg: '账单爬取中',
		indexData: {}
	},
	LN0003: {
		indexSts: 'LN0003',
		indexMsg: '一键还卡',
		indexData: {
			autSts: '2', // 1 中, 2,成功  3失败  1更新中
			bankName: '招商银行',
			bankNo: 'ICBC',
			cardNoHid: '6785 **** **** 6654',
			cardBillDt: '2018-07-17',
			cardBillAmt: '',
			billRemainAmt: null,
            overDt: '7',
            minApplAmt:'',
            maxApplAmt:'10',
			cardBillSts: '01',
			buidSts: '00'
		}
	},
	LN0004: {
		indexSts: 'LN0004',
		indexMsg: '代还资格审核中',
		indexData: {
			bankName: '招商银行',
			bankNo: 'ICBC',
			cardNoHid: '6785 **** **** 6654',
			cardBillDt: '2018-07-17',
			cardBillAmt: '786.45',
			overDt: '7'
		}
	},
	LN0005: {
		indexSts: 'LN0005',
		indexMsg: '暂无代还资格',
		indexData: {
			bankName: '招商银行',
			bankNo: 'ICBC',
			cardNoHid: '6785 **** **** 6654',
			cardBillDt: '2018-07-17',
			cardBillAmt: '786.45',
			overDt: '7'
		}
	},
	LN0006: {
		indexSts: 'LN0006',
		indexMsg: '一键代还',
		indexData: {
			autId: 'PRC00611020190416162458496298599',
			autSts: '2',
			bankName: '招商银行',
			bankNo: 'CMB',
			cardNoHid: '3568********6163',
			cardBillDt: '2019-04-04',
			cardBillAmt: 13256.41,
			overDt: -12,
			netAppyDate: null,
			last: null,
			agrNo: null,
			repayDt: null,
			billNo: null,
			billDt: '2019-04-17',
			minPayment: 13256.41,
			billRemainAmt: 13256.41,
			billPaidAmt: 13256.41,
			sxfPaidAmt: null,
			cardBillSts: '01',
			acOverDt: '20190416'
		}
	},
	LN0007: {
		indexSts: 'LN0007',
		indexMsg: '放款准备中',
		indexData: {
			bankName: '招商银行',
			bankNo: 'ICBC',
			cardNoHid: '6785 **** **** 6654',
			cardBillDt: '2018-07-17',
			cardBillAmt: '786.45',
			overDt: '7'
		}
	},
	LN0008: {
		indexSts: 'LN0008',
		indexMsg: '一键还卡',
		indexData: {
			autSts: '2',
			bankName: '招商银行',
			bankNo: 'ICBC',
			cardNoHid: '6785 **** **** 6654',
			cardBillDt: '2018-07-17',
			cardBillAmt: '786.45',
			overDt: '7'
		}
	},
	LN0009: {
		indexSts: 'LN0009',
		indexMsg: '查看代还订单',
		indexData: {
			bankName: '招商银行',
			bankNo: 'ICBC',
			cardNoHid: '6785 **** **** 6654',
			cardBillDt: '2018-07-17',
			cardBillAmt: '786.45',
			overDt: '7'
		}
	},
	LN0010: {
		indexSts: 'LN0010',
		indexMsg: '爬取失败/老用户',
		indexData: {
			bankName: '招商银行',
			bankNo: 'ICBC',
			cardNoHid: '6785 **** **** 6654',
			cardBillDt: '2018-07-17',
			cardBillAmt: '786.45',
			overDt: '7'
		}
	}
};
