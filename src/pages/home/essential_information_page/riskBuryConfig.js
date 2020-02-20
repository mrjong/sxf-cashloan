/*
 * @Author: sunjiankun
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-02-20 16:25:19
 */
exports.common = {
	title: '完善信息',
	pId: 'wsxx'
};

exports.resident_addressRiskBury = {
	type: 'input',
	key: 'resident_address',
	remark: '常住地址',
	actContain: ['focus', 'blur', 'delete', 'paste', 'value']
};

exports.contact_name_oneRiskBury = {
	type: 'input',
	key: 'contact_name_one',
	remark: '联系人1姓名',
	actContain: ['focus', 'blur', 'delete', 'paste']
};

exports.contact_name_twoRiskBury = {
	type: 'input',
	key: 'contact_name_two',
	remark: '联系人2姓名',
	actContain: ['focus', 'blur', 'delete', 'paste']
};

exports.contact_name_onePhoneNo = {
	type: 'input',
	key: 'linkphone',
	remark: '联系人1手机号',
	actContain: ['focus', 'blur', 'delete', 'paste']
};

exports.contact_name_twoPhoneNo = {
	type: 'input',
	key: 'linkphone2',
	remark: '联系人2手机号',
	actContain: ['focus', 'blur', 'delete', 'paste']
};

exports.resident_address_click = {
	key: 'DC_resident_city',
	remark: '居住地址打开'
};

exports.resident_address_close = {
	key: 'resident_cityOut',
	remark: '居住地址关闭'
};

exports.contact_relationship_click = {
	key: 'cntRelTyp1',
	remark: '联系人1关系打开'
};

exports.contact_relationship_close = {
	key: 'cntRelTypOut1',
	remark: '联系人1关系关闭'
};

exports.contact_relationship2_click = {
	key: 'cntRelTyp2',
	remark: '联系人2关系打开'
};

exports.contact_relationship2_close = {
	key: 'cntRelTypOut2',
	remark: '联系人2关系关闭'
};
