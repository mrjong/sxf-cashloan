import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import noOrderIco from 'assets/images/order/no_order_ico.png';
import styles from './index.scss';

export default class order_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // orderList: [],
            orderList: [
                {
                    extra: {
                        name: '已逾期',
                        color: '#F44258',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
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
                    extra: {
                        name: '放款中',
                        color: '#34A6FF',
                    },
                    label: {
                        name: '5000.00',
                        brief: '2018年01月11日'
                    },
                },
                {
                    arrowHide: true,
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
            <div className={styles.order_page}>
                {
                    this.state.orderList.length ?
                    <Lists listsInf={this.state.orderList} className={styles.order_list} />
                    :
                    <div className={styles.no_data}>
                        <img src={noOrderIco} alt="" />
                        <p>暂无账单</p>
                    </div>
                }
            </div>
        )
    }
}

