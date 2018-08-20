# 还到2.0

## 启动

 ```sh
 # 安装依赖
 npm install
 # 或者
 yarn install


 ## 构建开发
 npm run dev

 # 构建生产
 npm run build

 # 构建测试
 npm run test
 ```

v
## 目录结构v

### 根目录说明

<!-- 目录生成命令 tree -Fa -L 2 -I node_modules -->

```sh
.
├── src/                 源码目录
├── build/               项目构建配置 webpack
├── deployment_hooks/    脚本目录
├── .git/                git目录
├── .babelrc             语法编译器
├── .editorconfig        编辑器配置
├── .eslintrc.js         校验规则
├── .gitignore           忽略文件
├── .lintstagedrc        暂存（stage）前校验
├── .prettierrc          代码风格格式化
├── .stylelintrc         css 审查工具
├── antd-theme.json
├── postcss.config.js    css 转换工具配置
├── appspec.yml          部署配置
├── assembly.xml         部署配置
├── pom.xml              部署配置
├── pom-prod.xml         部署配置
├── settings.xml         部署配置
├── README.md            项目说明
├── package.json         node包配置文件
└── yarn.lock            包锁定
```

### src目录说明

```sh
src
├── assets/             静态资源目录
├── components/         公共组件目录
├── config/             ？
├── example/            demo 目录
├── pages/              页面
├── routers/            路由
├── utils/              工具方法
├── favicon.ico         图标icon
├── app.js              项目入口
└── index.html          模板
```

### 页面目录说明
```sh
src/pages
├── common/                        公用目录
│   ├── err_page/                    错误页面
│   ├── index.js                     空？
│   ├── loading_page/                loading
│   ├── middle_page/                 中转页 第三方回跳页面
│   ├── routerPage/                  路由控制组件
│   └── router.js                    分离的router配置文件
├── home/                          首页
│   ├── agency/                      首页-确认签约页面
│   ├── essential_information/       首页-基本信息认证页面
│   ├── home/                        首页-首页
│   ├── message_detail_page/         首页-消息详情页面
│   ├── message_page/                首页-消息页面
│   ├── real_name/                   首页-实名认证页面
│   └── router.js                    分离的router配置文件
├── login/                        登录
│   ├── login_page/                  登录页面
│   └── router.js                    分离的router配置文件
├── mine/                         我的
│   ├── bind_bank_card/              我的-绑定银行卡（会员购买）
│   ├── bind_credit_page/            我的-绑定信用卡
│   ├── bind_save_page/              我的-绑定储蓄卡
│   ├── confirm_purchase_page/       我的-确认购买（会员卡）
│   ├── credit_extension_page/       我的-四项认证页/信用加分页
│   ├── credit_list_page/            我的-选择授权卡页面
│   ├── fqa_page/                    我的-常见问题
│   ├── membership_card_page/        我的-会员卡购买
│   ├── mine_page/                   我的-我的页面
│   ├── select_credit_page/          我的-选择信用卡
│   ├── select_save_page/            我的-选择储蓄卡
│   ├── support_credit_page/         我的-信用卡支持银行类型
│   ├── support_save_page/           我的-储蓄卡支持银行类型
│   └── router.js                    分离的router配置文件
├── order/                        订单
│   ├── order_detail_page/           订单-详情页
│   ├── order_page/                  订单-列表页
│   ├── repayment_succ_page/         订单-还款完成页
│   └── router.js                    分离的router配置文件
├── protocol/                     协议
│   ├── club_vip_service_page/           随行付VIP俱乐部会员服务协议
│   ├── delegation_withhold_page/        委托扣款协议
│   ├── financial_service_page/          金融服务协议
│   ├── financial_service_page_sxpay/    随行付金融服务协议
│   ├── loan_contract_page/              借款合同
│   ├── privacy_agreement_page/          随行付用户隐私协议
│   ├── register_agreement_page/         用户注册协议
│   ├── shortcut_bind_card_page/         随行付快捷绑卡支付协议
│   └── router.js                        分离的router配置文件
└── router.js                    总路由页面
```

## TODO

* [x] 封装本地存储 store.js
* [x] 拦截页面后退功能 基本完成
* [x] 提取表单正则校验 validator.js
* [x] 封装请求 统一处理错误提示，token获取等。FetchInit.js
* [x] 提取公用方法 common.js
* [ ] 文件 Eslint 统一风格 （部分文件eslint）

## 注意事项

1、页面目录文件夹与路由相对应，做到看到目录大概就知道是什么路由的目的。
2、表单校验页的校验规则统一使用 validator.js中的，如果没有，请添加。
3、本地存储统一使用store.js
4、在编辑器中注意打开eslint配置
