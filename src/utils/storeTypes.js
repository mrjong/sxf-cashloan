/*
 * @Author: shawn
 * @LastEditTime: 2020-03-02 09:29:35
 */
// 本地local存储 方法名与key值对应表
export const storeTypes = {
	Position: 'sxf_Position', // 定位信息
	ProtocolFinancialData: 'ProtocolFinancialData', // 协议绑卡信息缓存
	OrderSuccess: 'OrderSuccess', // 付款成功信息
	MsgObj: 'MsgObj', // // 消息详情
	MsgBackData: 'MsgBackData', // 消息详情
	HistoryRouter: 'HistoryRouter', // 历史路由
	OutLinkUrl: 'OutLinkUrl', // 去外链标识
	HadShowModal: 'HadShowModal', // 是否开过弹框
	BackFlag: 'BackFlag', // 是否返回的flag
	DisableBack: 'DisableBack', // 禁止返回的标识
	LoginBack: 'LoginBack', // 登录页协议返回
	QueryUsrSCOpenId: 'QueryUsrSCOpenId', // 用户标识
	Version: 'Version', // 版本号
	RewardCount: 'RewardCount', // 抽奖次数
	Token: 'Token', // local-token
	JumpUrl: 'JumpUrl', // 调整的url
	H5Channel: 'H5Channel', // 存储h5Channel
	Address: 'Address', // 常住地址
	Linkman: 'Linkman', // 联系人姓名
	Linkphone: 'Linkphone', // 联系人电话
	Linkman2: 'Linkman2', // 联系人2姓名
	Linkphone2: 'Linkphone2', // 联系人2电话
	ProvCity: 'provCity', //省份城市信息
	RelationValue: 'RelationValue', // 联系人1关系
	RelationValue2: 'RelationValue2', // 联系人2关系
	BindCreditCardNo: 'BindCreditCardNo', // 回显绑卡信用卡卡号
	CouponActivityFlag: 'CouponActivityFlag', // 呈现不同机具页面的标识
	MposToken: 'MposToken', // mpos token 关闭无效问题
	ToggleMoxieCard: 'ToggleMoxieCard', // 新版流程物理返回  借钱还信用卡 切换卡
	CarrierMoxie: 'CarrierMoxie', // 运营商直接返回的问题
	NoLoginUrl: 'NoLoginUrl', // 微信授权失败跳转到那个页面
	OverdueInf: 'OverdueInf', // 逾期进度数据
	RealNameNextStep: 'RealNameNextStep', // 需要下一步
	CashFenQiStoreData: 'CashFenQiStoreData', //现金分期反显的数据
	CashFenQiCardArr: 'CashFenQiCardArr', //现金分期收、还卡数组
	ConfirmAgencyBackHome: 'ConfirmAgencyBackHome', // 签约页控制物理返回到首页标识
	TFDBack1: 'TFDBack1', // call通付盾成功
	TFDBack2: 'TFDBack2', // 通付盾报备给后端成功
	TestABTag: 'TestABTag', // 全局AB测试标志
	CacheBaseInfo: 'CacheBaseInfo', // 缓存基本信息中的数据
	HrefFlag: 'HrefFlag'
};
