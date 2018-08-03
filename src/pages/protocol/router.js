export default [
    {
        path: '/protocol/privacy_agreement_page',
        title: '随行付用户隐私协议',
        component: () => import('pages/protocol/privacy_agreement_page'),
    },
    {
        path: '/protocol/register_agreement_page',
        title: '用户注册协议',
        component: () => import('pages/protocol/register_agreement_page'),
    }, {
        path: '/protocol/loan_contract_page',
        title: '借款合同',
        component: () => import('pages/protocol/loan_contract_page'),
    },
    {
        path: '/protocol/delegation_withhold_page',
        title: '委托扣款协议',
        component: () => import('pages/protocol/delegation_withhold_page'),
    }, {
        path: '/protocol/financial_service_page',
        title: '金融服务协议',
        component: () => import('pages/protocol/financial_service_page'),
    }
];
