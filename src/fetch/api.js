/**
 * @description: 登录相关
 * @param {type}
 * @return:
 */

// 保存设备指纹信息
export const signup_device = '/signup/device';
// 用户登出
export const signup_logout = '/signup/logout';
// 短信验证码登陆注册
export const signup_sms = '/signup/sms';
// 手机号密码注册
export const signup_pwd_regist = '/signup/pwd/regist';
// 手机号密码登陆
export const signup_pwd_login = '/signup/pwd/login';
// 刷新Token静默登陆
export const signup_refresh = '/signup/refresh';
// 老API的TokenId换成新API的TokenId
export const signup_oldApi = '/signup/oldApi';
// 验证用户是否在mpos实名
export const signup_mpos_validate = '/signup/mpos/validate';
// 检查MPOS授权
export const signup_mpos_check = '/signup/mpos/check';
// MPOS授权
export const signup_mpos_auth = '/signup/mpos/auth';
// 微信静默登录查询是否已授权
export const signup_wx_auth = '/signup/wx/auth';
// 微信静默登录查询是否已授权回调
export const signup_wx_authcb = '/signup/wx/authcb';
// 查询微信jssdk配置
export const signup_wx_jscfg = '/signup/wx/jscfg';
// 协议留痕
export const signup_log = '/signup/log';
// 忘记密码
export const pwd_forgetLoginPwd = '/pwd/forgetLoginPwd';
// 修改密码
export const pwd_modifyLoginPwd = '/pwd/modifyLoginPwd';
// 修改密码获取人脸参数
export const pwd_getFaceData = '/pwd/getFaceData';
// 人脸识别修改密码
export const pwd_updateLoginPwdByFace = '/pwd/updateLoginPwdByFace';
// 刷新前端用户信息
export const signup_refreshClientUserInfo = '/signup/refreshClientUserInfo';

/**
 * @description: 消息短信相关
 * @param {type}
 * @return:
 */

// 未读消息总数查询
export const msg_news_count = '/msg/news/count';
// 默认展示消息栏
export const msg_news_default_table = '/msg/news/default/table';
// 消息列表查询
export const msg_news_list = '/msg/news/list';
// 消息读取
export const msg_news_read = '/msg/news/read';
// 消息一键读取
export const msg_news_readAll = '/msg/news/readAll';
// 获取图片验证码
export const msg_image = '/msg/image';
// 获取指定区域编码的子区域列表
export const msg_area = '/msg/area';
// 保存gps信息
export const msg_gps_save = '/msg/gps/save';
// 获取弹窗列表    弹窗位置, 0:首页;  1:结清页;
export const msg_popup_list = '/msg/popup/list';
// 弹窗已弹出标记
export const msg_popup_done = '/msg/popup/done';
// 获取关系列表
export const msg_relation = '/msg/relation';
// 获取滑动图片验证码
export const msg_slide = '/msg/slide';
// 发送短信验证码
export const msg_sms = '/msg/sms';
// 获取开关  RAS_POINT_SWITCH 埋点开关字典表
export const msg_switch = '/msg/switch';

/**
 * @description: 首页相关
 * @param {type}
 * @return:
 */

// 轮播图查询接口
export const index_queryBannerList = '/index/queryBannerList';
// 获取福利专区/新手活动信息
export const index_queryWelfareList = '/index/queryWelfareList';
// 首页信息查询，整合现金分期+代偿
export const index_queryIndexInfo = '/index/queryIndexInfo';
// 获取下一步操作地址
export const index_getNextStep = '/index/getNextStep';
// 判断用户是否展示隐私协议
export const index_queryPLPShowSts = '/index/queryPLPShowSts';
// 判断逾期弹窗是否展示
export const index_queryOLPShowSts = '/index/queryOLPShowSts';

/**
 * @description: 授信项相关
 * @param {type}
 * @return:
 */

// 实名认证
export const auth_idChk = '/auth/idChk';
// OCR身份认证
export const auth_ocrIdChk = '/auth/ocrIdChk';
// 信用卡账单保存
export const auth_card_sq = '/auth/card/sq';
// 释放授信名额
export const auth_releaseQuotas = '/auth/releaseQuotas';
// 获取第三方授信页面地址
export const auth_operatorAuth = '/auth/operatorAuth';
// 保存通讯录或者app列表信息
export const auth_saveAppOrContactInfo = '/auth/saveAppOrContactInfo';
// 个人资料
export const auth_personalData = '/auth/personalData';
// 获取用户基本信息接口
export const auth_queryUsrBasicInfo = '/auth/queryUsrBasicInfo';
// 人脸识别
export const auth_getTencentFaceData = '/auth/getTencentFaceData';
// 人脸识别保存
export const auth_faceDetect = '/auth/faceDetect';
// 获取OCR sdk切换器状态
export const auth_getOcToggle = '/auth/getOcToggle';
// 补充信息
export const auth_suppleInfo = '/auth/suppleInfo';
//  保存腾讯人脸识别返回码信息接口
export const auth_tencentFaceResultRec = '/auth/tencentFaceResultRec';
/**
 * @description: 授信申请相关
 * @param {type}
 * @return:
 */

// 查询信用卡账单列表
export const cred_queryCredCard = '/cred/queryCredCard';
// 授信申请页信息查询
export const cred_queryApplPageInfo = '/cred/queryApplPageInfo';
// 提交授信申请
export const cred_apply = '/cred/apply';
// 缓存信用卡账单ID
export const cred_cacheCredCard = '/cred/cacheCredCard';
// 按账单ID查询信用卡账单信息接口
export const cred_queryCredCardById = '/cred/queryCredCardById';
/**
 * @description: // 账单查询相关
 * @param {type}
 * @return:
 */
// 查询用户账单列表
export const bill_queryBillList = '/bill/queryBillList';
// 查询用户账单详情
export const bill_queryBillDetail = '/bill/queryBillDetail';

/**
 * @description: // 借款申请相关
 * @param {type}
 * @return:
 */

// 代偿借款申请页信息查询
export const loan_queryLoanApplInfo = '/loan/queryLoanApplInfo';
// 查询用户现金分期借款申请页信息
export const loan_queryCashLoanApplInfo = '/loan/queryCashLoanApplInfo';
// 用户借款合同预览
export const loan_queryContractInfo = '/loan/queryContractInfo';
// 借款试算
export const loan_loanPlan = '/loan/loanPlan';
// 合同文件流获取接口
export const loan_contractPreview = '/loan/contractPreview';
// 借款提交
export const loan_loanSub = '/loan/loanSub';
/**
 * @description: // 优惠券相关
 * @param {type}
 * @return:
 */

// 个人中心-优惠券列表查询
export const coup_queryUsrCoupBySts = '/coup/queryUsrCoupBySts';
// 查询用户借款可用优惠券
export const coup_queyUsrLoanUsbCoup = '/coup/queyUsrLoanUsbCoup';
// 查询用户还款可用优惠券
export const coup_queryUsrRepayUsbCoup = '/coup/queryUsrRepayUsbCoup';
// 发送借款可用优惠券
export const coup_sendLoanCoup = '/coup/sendLoanCoup';
/**
 * @description: // 还款相关
 * @param {type}
 * @return:
 */

// 还款收银台（试算）
export const repay_queryCashRegisterDetail = '/repay/queryCashRegisterDetail';
// 还款提交
export const repay_paySubmit = '/repay/paySubmit';
// 还款结果查询
export const repay_payNotify = '/repay/payNotify';
/**
 * @description: // 银行卡相关
 * @param {type}
 * @return:
 */

// 银行卡BIN查询接口
export const bank_card_bin = '/bank/card/bin';
// 已绑定的银行卡列表查询接口
export const bank_card_list = '/bank/card/list';
// 是否绑定了一张信用卡一张储蓄卡，且是否为授信信用卡
export const bank_card_check = '/bank/card/check';
// 支持银行列表查询接口
export const bank_card_valid = '/bank/card/valid';
// 绑定信用卡接口
export const bank_card_bind_credit = '/bank/card/bind/credit';
// 协议支付绑定储蓄卡发送短信接口
export const bank_card_protocol_sms = '/bank/card/protocol/sms';
// 协议支付绑定储蓄卡短信验证码校验
export const bank_card_protocol_bind = '/bank/card/protocol/bind';
// 用户协议支付合同预览信息查询接口
export const bank_card_protocol_info = '/bank/card/protocol/info';
/**
 * @description: // 红包账户相关
 * @param {type}
 * @return:
 */

// 查询用户红包账户信息
export const redAccount_myRedAccount = '/redAccount/myRedAccount';
// 查询用户红包券列表
export const redAccount_queryRedCoupon = '/redAccount/queryRedCoupon';
// 查询用户提现订单
export const redAccount_queryCashOrd = '/redAccount/queryCashOrd';
// 提现申请
export const redAccount_cashApply = '/redAccount/cashApply';
// 查询订单付款状态
export const redAccount_queryOrdSts = '/redAccount/queryOrdSts';
/**
 * @description: // 帮助中心相关
 * @param {type}
 * @return:
 */

// 解决&amp;amp;amp;未解决(问题)接口
export const question_solvedCount = '/question/solvedCount';
// 意见类型列表接口
export const question_opinionList = '/question/opinionList';
// TOP7 + 问题类型列表接口
export const question_questionInfo = '/question/questionInfo';
// 存储意见接口
export const question_addOpinion = '/question/addOpinion';
// 通过类型分页获取问题列表
export const question_questionListByType = '/question/questionListByType';
/**
 * @description: // idfa相关
 * @param {type}
 * @return:
 */

// 存储IDFA接口
export const idfa_storageIdfa = '/idfa/storageIdfa';
// 关联IDFA和用户接口
export const idfa_relateIdfaWithUser = '/idfa/relateIdfaWithUser';
/**
 * @description: // 手机号变更/注销账号相关
 * @param {type}
 * @return:
 */

// 校验销户白名单 （校验是否可以销户）
export const account_sales_check_white = '/account/sales/check/white';
// 校验用户是否可以销户 （检验走手机号销户 还是人脸销户）
export const account_sales_check_user = '/account/sales/check/user';
// 确认销户
export const account_sales = '/account/sales';
// 修改手机号之检查旧手机号与身份号
export const account_mobile_check = '/account/mobile/check';
// 合并账户之人脸识别
export const account_merge_face_data = '/account/merge/face/data';
// 修改手机号之人脸识别结果校验
export const account_mobile_face = '/account/mobile/face';
// 确认修改手机号
export const account_mobile_change = '/account/mobile/change';
// 合并账户
export const account_merge = '/account/merge';
/**
 * @description: // 通话详单上传
 * @param {type}
 * @return:
 */
// 判断用户是否采集过通话记录数据
export const calllog_isStoraged = '/calllog/isStoraged';
// 上传数据
export const calllog_uploadData = '/calllog/uploadData';
