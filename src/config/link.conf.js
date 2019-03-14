/**
 * 外链url配置
 */

const { PROJECT_ENV } = process.env;

const envMap = {
  dev: {
    DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP', // 开发环境 MPOS_APP与MPOS_CM渠道不同
  },
  test: {
    DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP',  // 测试环境 MPOS_APP与MPOS_CM渠道不同
  },
  pro: {
    DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_APP',  // 生产地址
  },
};

export default envMap[PROJECT_ENV];
