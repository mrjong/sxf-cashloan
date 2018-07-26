import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import Panel from 'components/panel/index.js';
import noOrderIco from 'assets/images/order/no_order_ico.png';
import styles from './index.scss';

export default class order_detail_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // orderList: [],
            orderList: [
                {
                    clickCb: () => {

                    },
                    extra: {
                        name: '已逾期',
                        color: '#F44258',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                    showDesc: true,
                    listdesc: {
                        value: [{
                            extra: {
                                name: '已逾期',
                                color: '#F44258',
                            },
                            label: {
                                name: '5000.00',
                                brief: '2018年01月11日'
                            },
                        }, {
                            extra: {
                                name: '已逾期',
                                color: '#F44258',
                            },
                            label: {
                                name: '5000.00',
                                brief: '2018年01月11日'
                            },
                        }, {
                            extra: {
                                name: '已逾期',
                                color: '#F44258',
                            },
                            label: {
                                name: '5000.00',
                                brief: '2018年01月11日'
                            },
                        }]
                    }
                },
                {
                    extra: {
                        name: '还款中',
                        color: '#34A6FF',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                },
                {
                    extra: {
                        name: '已结清',
                        color: '#C7C7CC',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                },
                {
                    extra: [{
                        name: '放款中',
                        color: '#34A6FF'
                    }, {
                        name: '放款中',
                        color: '#333'
                    }],
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                },
                {
                    arrowHide: 'empty',
                    extra: {
                        name: '放款失败',
                        color: '#F44258',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                },
            ]
        }
    }

    render() {
        return (
            <div className={styles.order_detail_page}>
                <Panel title="借款信息">
                    <ul className={styles.panel_conten}>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>借款本金</label>
                            <span className={styles.item_value}>¥5000.00</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>
                                借款期限
                            </label>
                            <span className={styles.item_value}>1个月</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>还款方式</label>
                            <span className={styles.item_value}>等额本息</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>放款时间</label>
                            <span className={styles.item_value}>2018-1-1</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>收款银行卡</label>
                            <span className={styles.item_value}>工商银行(5231)</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>还款银行卡</label>
                            <span className={styles.item_value}>工商银行(5231)</span>
                        </li>
                    </ul>
                </Panel>
                <Panel title="还款计划" className={styles.mt24}>
                    <Lists listsInf={this.state.orderList} className={styles.order_list} />
                </Panel>

            </div>
        )
    }
}

