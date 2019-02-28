/**
 * 外链url配置
 */

const { PROJECT_ENV } = process.env;

const envMap = {
  dev: {
    DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_CM', // 开发环境
  },
  test: {
    DC_URL: 'https://ffp-test.vbillbank.com/lender/common/ServiceAuthorization?MPOS_CM',  // 测试环境
  },
  pro: {
    DC_URL: 'https://ffp.vbillbank.com/lender/common/ServiceAuthorization?MPOS_CM',  // 生产地址
  },
};

export default envMap[PROJECT_ENV];
