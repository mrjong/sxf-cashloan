// DC 对外
// XDC mpos入口=>对内
import { isMPOS } from './common';
let prefix = `DC`;
// dc 多
// xdc少

if (isMPOS() || JSON.parse(sessionStorage.getItem('isMPOS'))) {
	prefix = 'XDC';
}
// console.log(JSON.parse(sessionStorage.getItem('isMPOS')),'test')
const sxflogin = {
	chkBox: `${prefix}_chkBox`, // 注册登录页-点击获取验证码
	chkBox_dw: `${prefix}_chkBox_dw` // 注册登录页-点击获取验证码
};
const sxfhome = {
	idCardF: `${prefix}_idCardF`, // 正面
	idCardB: `${prefix}_idCardB`, // 反面
	idCardOutF: `${prefix}_idCardOutF`, // 正面
	idCardOutB: `${prefix}_idCardOutB`, // 反面
	cntRelTypOut1: `${prefix}_cntRelTypOut1`, // 联系人关系点击
	cntRelTyp1: `${prefix}_cntRelTyp1`, // 联系人停留
	resident_city: `${prefix}_resident_city`, // 点击居住城市
	resident_cityOut: `${prefix}_resident_cityOut`, // 居住城市停留
	isShowCreditModal_out: `${prefix}_isShowCreditModal_out`, //选择期限退出
	isShowCreditModal_in: `${prefix}_isShowCreditModal_in` // 选择期限进入
};

export { sxfhome, sxflogin };
