export const validators = {
  number: val => /^[0-9]*$/.test(val),
  bankCardNumber: val => /^\d{16}|\d{24}$/.test(val), // 银行卡号 val.replace(/\s+/g, "")
  phone: val => /^1\d{10}$/.test(val), // 手机为以1开头的11位数字
  iDCardNumber: val => /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(val), // 身份证 中国的身份证号，一代身份证号是15位的数字，二代身份证都是18位的，最后一位校验位除了可能是数字还可能是‘X‘或‘x‘，所以有四种可能性：a.15位数字 b.18位数字 c.17位数字，第十八位是‘X‘ d.17位数字，第十八位是‘x‘
  enLength: (val, min, max) => {
    // 英文字符长度校验
    if (val.replace(/(^\s*)|(\s*$)/g, '') === '') {
      // /^(?!(\s+$))/
      return false;
    } else if (min) {
      if (val.length < min) {
        return false;
      } else if (max) {
        if (val.length > max) {
          return false;
        }
        return true;
      }
      return true;
    }
  },
  name: val => /^([\u4e00-\u9fa5])|(\\.)|(\\·){1,10}$/.test(val),
  chLength: (val, min, max) => {
    // 中文字符长度校验
    let minNum = min || 1;
    let maxNum = max || 100000;
    let chReg = new RegExp(`^(([\u4e00-\u9fa5])|(\\.)|(\\·)){${minNum},${maxNum}}$`);
    return chReg.test(val);
  },
};
