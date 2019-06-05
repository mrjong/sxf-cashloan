// 配置活动id等公共变量
const { PROJECT_ENV } = process.env;
const activeConfig = {
    activeId: PROJECT_ENV === 'pro' || PROJECT_ENV === 'rc' ? 'MMS00107220190604114342204927560' : 'MMS00107720190423133905084228254', // 活动uuid
};

export default activeConfig;