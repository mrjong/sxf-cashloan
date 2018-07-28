import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import Panel from 'components/panel/index.js';
import styles from './index.scss';
import fetch from "sx-fetch"
import SButton from 'components/button';
import sessionStorageMap from 'utils/sessionStorageMap'
import { Modal } from 'antd-mobile'
const API = {
    'qryDtl': "/bill/qryDtl",
}
@fetch.inject()
export default class order_detail_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            billDesc: {},
            showMoudle: false,
            orderList: []
        }
    }
    componentWillMount() {
        this.getLoanInfo()
    }

    // 获取还款信息
    getLoanInfo = () => {
        let billNo = sessionStorage.getItem(sessionStorageMap.bill.billNo)
        this.props.$fetch.post(API.qryDtl, {
            billNo: JSON.parse(billNo)
        })
            .then(res => {
                if (res.msgCode === 'PTM0000') {
                    this.setState({
                        billDesc: res.data,
                        perdList: res.data.perdList
                    }, () => {
                        this.showPerdList(res.data.perdNum)
                    })
                } else {
                    this.props.toast.info(res.msgInfo)
                }
            }).catch(err => {
                console.log(err)
            })
    }

    // 显示还款计划
    showPerdList = (perdNum) => {
        let perdListArray = []
        let perdList = this.state.perdList
        for (let i = 0; i < perdList.length; i++) {
            let item = {
                key: i,
                label: {
                    name: `${i + 1}/${perdList.length}期`,
                    brief: perdList[i].perdDueDt
                },
                extra: [{
                    name: perdList[i].perdWaitRepAmt,
                    color: '#333'
                }, {
                    name: perdList[i].perdStsNm,
                    color: perdList[i].color
                }],
                arrowHide: 'down',
                feeInfos: perdList[i].feeInfos
            }
            if (perdNum !== 999 && perdList[i].perdNum === perdNum) {
                item.showDesc = true
            } else {
                item.showDesc = false
            }
            item.feeInfos.push({
                feeNm: '合计',
                feeAmt: perdList[i].perdWaitRepAmt
            })
            perdListArray.push(item)
        }
        this.setState({
            orderList: perdListArray
        })
    }
    // 展开隐藏
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
        const { billDesc } = this.state
        return (
            <div className={styles.order_detail_page}>
                <Panel title="借款信息">
                    <ul className={styles.panel_conten}>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>借款本金</label>
                            <span className={styles.item_value}>{billDesc && billDesc.billPrcpAmt ? `¥${billDesc.billPrcpAmt}` : ''}</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>
                                借款期限
                            </label>
                            <span className={styles.item_value}>{billDesc && billDesc.perdLth}{billDesc && billDesc.perdUnit === 'M' ? '个月' : '天'}</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>还款方式</label>
                            <span className={styles.item_value}>{billDesc && billDesc.repayTypNm}</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>放款时间</label>
                            <span className={styles.item_value}>{}</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>收款银行卡</label>
                            <span className={styles.item_value}>{billDesc && billDesc.payCrdCorpOrgNm}({billDesc && billDesc.payCrdNoLast})</span>
                        </li>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>还款银行卡</label>
                            <span className={styles.item_value}>{billDesc && billDesc.wthdCrdCorpOrgNm}({billDesc && billDesc.wthdCrdNoLast})</span>
                        </li>
                    </ul>

                </Panel>
                <Panel title="还款计划" className={styles.mt24}>
                    <Lists listsInf={this.state.orderList} clickCb={this.clickCb} className={styles.order_list} />

                </Panel>

                {
                    billDesc.perdNum !== 999 ? <div className={styles.submit_btn}>
                        <SButton onClick={this.handleClickConfirm}>
                            主动还款
                        </SButton>
                        <div className={styles.message}>此次主动还款，将用于还第<span className={styles.red}>2/3</span>期账单，请保证卡内余额大于该 期账单金额</div>
                    </div> : <div className={styles.mb50}></div>
                }
                <Modal popup visible={this.state.showMoudle} onClose={this.handleCloseModal} animationType="slide-up">
                    <div className={styles.modal_box}>
                        <div className={styles.modal_title}>付款详情<i></i></div>
                        <div className={styles.modal_flex}>
                            <span className={styles.modal_label}>本次还款金额</span><span className={styles.modal_value}>158.00元</span>
                        </div>
                        <div className={styles.modal_flex}>
                            <span className={styles.modal_label}>还款银行卡</span><span className={`${styles.modal_value}`}>158.00元 </span>&nbsp;<i></i>
                        </div>
                        <SButton onClick={this.handleClickConfirm} className={styles.modal_btn}>
                            立即还款
                        </SButton>
                    </div>
                </Modal>

            </div>
        )
    }
}

