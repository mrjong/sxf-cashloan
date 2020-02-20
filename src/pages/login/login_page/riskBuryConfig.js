/*
 * @Author: shawn
 * @LastEditTime: 2020-02-20 15:03:52
 */
exports.common = {
	title: '登录',
	pId: 'dl'
};

exports.inputPhoneRiskBury = {
	type: 'input',
	key: 'inputPhone',
	remark: '手机号输入框',
	actContain: ['focus', 'delete', 'blur', 'paste']
};

exports.inputCodeRiskBury = {
	type: 'input',
	key: 'inputCode',
	remark: '验证码输入框',
	actContain: ['focus', 'blur', 'delete', 'paste', 'value']
};

exports.clickCodeRiskBury = {
	type: 'btn',
	key: 'clickCode',
	remark: '获取验证码按钮',
	actContain: ['click']
};

exports.loginBtnRiskBury = {
	type: 'btn',
	key: 'loginBtn',
	remark: '注册/登录',
	actContain: ['click']
};

exports.DC_chkBoxRiskBury = {
	key: 'DC_chkBox',
	remark: '注册协议勾选'
};

exports.inputPhoneRiskBury = {
	key: 'inputPhone',
	remark: '手机号输入框',
	actContain: ['focus', 'blur', 'delete', 'paste']
};
