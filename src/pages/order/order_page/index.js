import React, { PureComponent } from 'react';
import { Toast } from 'antd-mobile'
import Lists from 'components/lists';
import fetch from 'sx-fetch';
import noOrderIco from 'assets/images/order/no_order_ico.png';
import styles from './index.scss';

@fetch.inject()
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
    componentWillMount() {
        //账单列表
        // -2放款中 -1放款失败  0还款中 1已逾期  2还款登记中 4已结清
        //自账单： sts: -2放款中 -1放款失败 0 未到期（还款中）  1 已逾期  2处理中 3已撤销 4 已结清
        // this.props.init('spread',null)
        this.props.$fetch.post('/bill/list', { startRow: "0", limitRow: '10', qryType: '0' }).then(result => {
            let billList = [];
            if (result.msgCode !== 'PTM0000') {
                Toast.info(result.msgInfo, 1)
            }
            for (var i = 0; i < result.billList.length; i++) {
                billList.push({
                    extra: {
                        name: result.billList[i].billStsNm,
                        color: result.billList[i].color,
                    },
                    label: {
                        name: result.billList[i].billAmt,
                        brief: result.billList[i].billDt,  // '2018年01月11日'
                    },
                })
            }
            this.setState({ orderList: billList });
        }, error => {
            console.log(error)
        })
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

