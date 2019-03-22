// 本地local存储 方法名与key值对应表
export const storeTypes = {
	RepaymentModalData: 'RepaymentModalData', // 保存确认代还信息弹框数据
	HomeCardIndexData: 'HomeCardIndexData', // 保存首页信用卡信息
	BackUrl: 'BackUrl', // 保存跳转的url
	BackUrl2: 'BackUrl2', // 临时缓存
	CardData: 'CardData', // 跳转路由中的银行卡信息
	MoxieBackUrl: 'MoxieBackUrl', // 跳转魔蝎授权页 授权后返回的url
	MoxieBackUrl2: 'MoxieBackUrl2', // 跳转魔蝎授权页 授权后返回的url
	VIPFlag: 'VIPFlag', // 会员卡是否购买的flag
	AuthFlag: 'AuthFlag', // 是否实名认证的flag
	UserPhone: 'UserPhone', // 用户手机号
	UserInfo: 'UserInfo', // 用户信息
	ParamVip: 'ParamVip', // 会员卡参数
	VIPInfo: 'VIPInfo', // 会员卡信息
	VipBackUrl: 'VipBackUrl', // 会员卡入口与出口
	Position: 'Position', // 定位信息
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
	SaveAmt: 'SaveAmt', // 回显代还金额的数据
	BindCardNo: 'BindCardNo', // 回显绑卡卡号
	BindCardPhone: 'BindCardPhone', // 回显绑卡手机号
	OrderDetailData: 'OrderDetailData', // 账单详情页数据
	NewUserActivityFlag: 'NewUserActivityFlag', //拉新运营活动标志
	NewUserActivityModal: 'NewUserActivityModal', // 是否弹出拉新活动弹窗标识
	MessageTag50000: 'MessageTag50000', // 50000
	MessageTagError: 'MessageTagError', // 错误不显示
	MessageTagStep: 'MessageTagStep', // 步骤
	CouponActivityFlag: 'CouponActivityFlag', // 呈现不同机具页面的标识
	MposToken: 'MposToken', // mpos token 关闭无效问题
	NeedNextUrl: 'NeedNextUrl', // 需要调用获取下一步url方法
	CreditExtensionNot: 'CreditExtensionNot', // 未提交授信用户
	ToggleMoxieCard: 'ToggleMoxieCard', // 新版流程物理返回  借钱还信用卡 切换卡
	LoanAspirationHome: 'LoanAspirationHome', // 首页弹窗 填写意愿
    CarrierMoxie: 'CarrierMoxie', // 运营商直接返回的问题
    BankMoxie: 'BankMoxie' // 信用卡直接返回的问题
};
