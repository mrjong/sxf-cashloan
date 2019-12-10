/*
 * @Author: shawn
 * @LastEditTime: 2019-12-10 10:45:27
 */
// 本地local存储 方法名与key值对应表
export const storeTypes = {
	RepaymentModalData: 'RepaymentModalData', // 保存确认代还信息弹框数据
	BackUrl: 'BackUrl', // 保存跳转的url
	BackUrl2: 'BackUrl2', // 临时缓存
	CardData: 'CardData', // 跳转路由中的银行卡信息
	MoxieBackUrl: 'MoxieBackUrl', // 跳转魔蝎授权页 授权后返回的url
	MoxieBackUrl2: 'MoxieBackUrl2', // 跳转魔蝎授权页 授权后返回的url
	AuthFlag: 'AuthFlag', // 是否实名认证的flag
	UserPhone: 'UserPhone', // 用户手机号
	UserInfo: 'UserInfo', // 用户信息
	ParamVip: 'ParamVip', // 会员卡参数
	VIPInfo: 'VIPInfo', // 会员卡信息
	VipBackUrl: 'VipBackUrl', // 会员卡入口与出口
	Position: 'sxf_Position', // 定位信息
	ProtocolFinancialData: 'ProtocolFinancialData',
	OrderSuccess: 'OrderSuccess', // 付款成功信息
	BackData: 'BackData', // 订单信息
	BillNo: 'BillNo',
	MsgObj: 'MsgObj', // // 消息详情
	MsgBackData: 'MsgBackData', // 消息详情
	HistoryRouter: 'HistoryRouter', // 历史路由
	CheckCardRouter: 'CheckCardRouter', // 保存四项认证进入绑卡页的标识
	BannerData: 'BannerData', // 保存 banner 信息
	OutLinkUrl: 'OutLinkUrl', // 去外链标识
	CouponData: 'CouponData', // 跳转路由中优惠劵的信息
	LandingPageImgUrl: 'LandingPageImgUrl', // 落地页图片
	HadShowModal: 'HadShowModal', // 是否开过弹框
	BackFlag: 'BackFlag', // 是否返回的flag
	DisableBack: 'DisableBack', // 禁止返回的标识
	LoginBack: 'LoginBack', // 登录页协议返回
	QueryUsrSCOpenId: 'QueryUsrSCOpenId', // 用户标识
	FromPage: 'FromPage', // 页面来源
	Consoleshow: 'Consoleshow', // 显示console
	Version: 'Version', // 版本号
	RewardCount: 'RewardCount', // 抽奖次数
	Token: 'Token', // local-token
	JumpUrl: 'JumpUrl', // 调整的url
	H5Channel: 'H5Channel', // 存储h5Channel
	Address: 'Address', // 常住地址
	Linkman: 'Linkman', // 联系人姓名
	Linkphone: 'Linkphone', // 联系人电话
	RelationValue: 'RelationValue', // 亲属关系
	Province: 'Province', // 省份
	City: 'City', // 城市
	ShowActivityModal: 'ShowActivityModal', // 是否显示活动弹窗
	ShowActivityModal2: 'ShowActivityModal2', // 是否显示活动弹窗2
	ShowActivityModal3: 'ShowActivityModal3', // 是否显示活动弹窗3
	SaveAmt: 'SaveAmt', // 回显代还金额的数据
	BindCardNo: 'BindCardNo', // 回显绑卡卡号
	BindCreditCardNo: 'BindCreditCardNo', // 回显绑卡信用卡卡号
	BindCardPhone: 'BindCardPhone', // 回显绑卡手机号
	OrderDetailData: 'OrderDetailData', // 账单详情页数据
	MessageTagError: 'MessageTagError', // 错误不显示
	MessageTagStep: 'MessageTagStep', // 步骤
	CouponActivityFlag: 'CouponActivityFlag', // 呈现不同机具页面的标识
	MposToken: 'MposToken', // mpos token 关闭无效问题
	NeedNextUrl: 'NeedNextUrl', // 需要调用获取下一步url方法
	CreditExtensionNot: 'CreditExtensionNot', // 未提交授信用户
	ToggleMoxieCard: 'ToggleMoxieCard', // 新版流程物理返回  借钱还信用卡 切换卡
	LoanAspirationHome: 'LoanAspirationHome', // 首页弹窗 填写意愿
	CarrierMoxie: 'CarrierMoxie', // 运营商直接返回的问题
	BankMoxie: 'BankMoxie', // 信用卡直接返回的问题
	GoMoxie: 'GoMoxie', // 魔蝎银行列表去魔蝎再返回的两次退出才退出的问题
	CreditSuccessBack: 'CreditSuccessBack', // 信用卡绑卡之后立即去提交页需要提示
	NoLoginUrl: 'NoLoginUrl', // 微信授权失败跳转到那个页面
	MessageTagLimitDate: 'MessageTagLimitDate', // 首页的额度有效期显示标识
	OverdueInf: 'OverdueInf', // 逾期进度数据
	SuccessPay: 'SuccessPay', // 418 活动返回
	IdChkPhotoBack: 'IdChkPhotoBack', // 签约页是否需要补充活体识别标示
	ChkPhotoBackNew: 'ChkPhotoBackNew', // 活体直接返回
	RealNameNextStep: 'RealNameNextStep', // 需要下一步
	CashFenQiStoreData: 'CashFenQiStoreData', //现金分期反显的数据
	CashFenQiCardArr: 'CashFenQiCardArr', //现金分期收、还卡数组
	HomeAutId: 'HomeAutId', // 首页的autId
	AutId: 'AutId', // 接口调用需要的AutId
	FQActivity: 'FQActivity', // 参与现金分期活动
	AutId2: 'AutId2', // 进度页物理返回存储的接口调用需要的AutId
	PercentCount: 'PercentCount', //百分比次数
	HomeConfirmAgency: 'HomeConfirmAgency', // 首页进入到签约借款页面参数
	DepositBankName: 'DepositBankName', // 储蓄卡银行名称
	AC20190618: 'AC20190618', //618
	PayType: 'PayType', // 还款方式
	WxPayEnd: 'WxPayEnd', // 微信返回不刷新
	GotoMoxieFlag: 'GotoMoxieFlag', // 去到魔蝎第三方的标示
	InsuranceFlag: 'InsuranceFlag', // 标识该次绑卡是否要求绑定支持收取保费的卡
	NoLoginToken: 'NoLoginToken', // 设置 图片验证码 noLoginToken
	ProtocolPersonalData: 'ProtocolPersonalData', // 个人信息授权书数据
	TencentBackUrl: 'TencentBackUrl', // 跳转到人脸识别返回的url
	ConfirmAgencyBackHome: 'ConfirmAgencyBackHome', // 签约页控制物理返回到首页标识
	BonusActivity: 'BonusActivity', // 参与100元利息红包限时领活动
	AutIdCard: 'AutIdCard', // 信用卡前置authid
	JFBackUrl: 'JFBackUrl', // 跳转jf授权页 授权后返回的url
	GotoCard: 'GotoCard', // 运营上成功之后 无法返回首页
	TFDBack1: 'TFDBack1', // call通付盾成功
	TFDBack2: 'TFDBack2', // 通付盾报备给后端成功
	ContactList: 'ContactList', // 借款中总的联系人
	SelContactList: 'SelContactList', // 返回联系人不为空的借款选中的五个联系人
	SelEmptyContactList: 'SelEmptyContactList', // 返回联系人为空的借款选中的五个联系人,
	SaveContactList: 'SaveContactList', // 保存联系人不为空的借款选中的五个联系人
	SaveEmptyContactList: 'SaveEmptyContactList' // 保存联系人为空的借款选中的五个联系人
};
