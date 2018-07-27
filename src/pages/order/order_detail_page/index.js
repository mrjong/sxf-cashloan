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
                    key: 0,
                    arrowHide: 'up',
                    extra: {
                        name: '已逾期',
                        color: '#F44258',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                    showDesc: true,
                    listDesc: [{
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
                },
                {
                    key: 1,
                    extra: {
                        name: '还款中',
                        color: '#34A6FF',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                    showDesc: false,
                    arrowHide: 'down',
                    listDesc: [{
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
                },
                {
                    key: 2,
                    arrowHide: 'up',
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
                    key: 3,
                    arrowHide: 'empty',
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
                    key: 4,
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
    clickCb = (item) => {
        console.log(item)
        switch (item.arrowHide) {
            case 'empty':
                break;
            case 'up':
                item = {
                    ...item,
                    arrowHide: 'down',
                    showDesc: false
                }
                break;
            case 'down':
                item = {
                    ...item,
                    arrowHide: 'up',
                    showDesc: true
                }

                break;
            default:
                break;
        }
        for (let i = 0; i < this.state.orderList.length; i++) {
            if (i !== item.key) {
                this.state.orderList[i].showDesc = false
                this.state.orderList[i].arrowHide = 'down'
            }
        }
        console.log(item)
        this.state.orderList[item.key] = item
        this.setState({
            orderList: [...this.state.orderList]
        })

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
                    <Lists listsInf={this.state.orderList} clickCb={this.clickCb} className={styles.order_list} />
                </Panel>

            </div>
        )
    }
}

