export default {
	CN0003: {
		indexSts: 'CN0003',
		indexMsg: '去借款',
		indexData: {
			credAmt: 3000.0,
			curAmt: 3000.0,
			acOverDt: 10,
			dcBillFlg: '00',
			downloadFlg: '01'
		}
	},
	CN0004: {
		indexSts: 'CN0004',
		indexMsg: '放款中',
		indexData: {
			credAmt: 3000.0,
			orderAmt: 4000,
			curAmt: 1000.0,
			acOverDt: 10,
			dcBillFlg: '00',
			downloadFlg: '01'
		}
	},
	CN0005: {
		indexSts: 'CN0005',
		indexMsg: '去还款',
		indexData: {
			credAmt: 3000.0,
			curAmt: 1500.0,
			acOverDt: 10,
			orderAmt: 4000,
			dcBillFlg: '00',
			downloadFlg: '01',
			billNo: '5674567895678'
		}
	},
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
			cardBillAmt: '100',
			billRemainAmt: '0',
			overDt: '7',
			minApplAmt: '100',
			minPayment: '200',
			maxApplAmt: '10900',
			cardBillSts: '01',
			buidSts: '01'
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
	LN0011: {
		indexSts: 'LN0011', // 人审核
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
			maxApplAmt: '10900',
			acOverDt: '20190416'
		}
	},
	LN0007: {
		indexSts: 'LN0007', // 机审核
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
