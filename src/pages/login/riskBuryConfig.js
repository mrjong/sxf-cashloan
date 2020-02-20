/*
 * @Author: shawn
 * @LastEditTime: 2020-02-20 17:26:58
 */
exports.common = {
	title: '登录',
	pId: 'dl'
};

exports.dlinputPhoneRiskBury = {
	key: 'dlinputPhone',
	remark: '登录手机号输入框',
	actContain: ['focus', 'delete', 'blur', 'paste']
};

exports.dlinputCodeRiskBury = {
	key: 'dlinputCode',
	remark: '登录验证码输入框',
	actContain: ['focus', 'delete', 'blur', 'paste', 'value']
};

exports.dl_chkBoxRiskBury = {
	key: 'dl_chkBox',
	remark: '协议勾选框'
};

exports.dlgoLoginRiskBury = {
	key: 'dlgoLogin',
	remark: '去登录按钮'
};

exports.dlsmsCodeBtnRiskBury = {
	key: 'dlsmsCodeBtn',
	remark: '获取验证码按钮'
};
