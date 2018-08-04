import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import Panel from 'components/panel/index.js';
import fetch from "sx-fetch";
import SButton from 'components/button';
import sessionStorageMap from 'utils/sessionStorageMap';
import { store } from 'utils/common';
import { Modal } from 'antd-mobile';
import styles from './index.scss';
import qs from 'qs';

const API = {
    'qryDtl': "/bill/qryDtl",
    'payback': '/bill/payback'
}
@fetch.inject()
export default class order_detail_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            billDesc: {},
            showMoudle: false,
            orderList: [],
            money: '',
            bankInfo: {},
            hideBtn: false
        }
    }
    componentWillMount() {
        const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
        this.setState({
            queryData
        }, () => {
            this.getLoanInfo()
        })

        // 选择银行卡回来
        let bankInfo = store.getCardData()
        if (bankInfo && bankInfo !== {}) {
            this.setState({
                bankInfo: bankInfo,
                showMoudle: true
            }, () => {
                store.removeCardData()
            })
        }
    }

    // 获取还款信息
    getLoanInfo = () => {
        if (!this.state.queryData || !this.state.queryData.billNo) {
            this.props.toast.info('订单号不能为空')
            setTimeout(() => {
                this.props.history.goBack()
            }, 3000);
        }
        this.props.$fetch.post(API.qryDtl, {
            billNo: this.state.queryData.billNo
        })
            .then(res => {
                if (res.msgCode === 'PTM0000') {
                    res.data.perdNum !== 999 && this.setState({ money: res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt });
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
        this.setState({
            hideBtn: false
        })
        let perdListArray = []
        let perdList = this.state.perdList
        for (let i = 0; i < perdList.length; i++) {
            if (perdList[i].perdStsNm === '处理中') {
                this.setState({
                    hideBtn: true
                })
            }
            let item = {
                key: i,
                label: {
                    name: `${i + 1}/${perdList.length}期`,
                    brief: perdList[i].perdDueDt
                },
                extra: [{
                    name: perdList[i].perdTotAmt,
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
                item.arrowHide = 'up'
            } else {
                item.showDesc = false
            }
            item.feeInfos.push({
                feeNm: '合计',
                feeAmt: Number(perdList[i].perdTotAmt)
            })
            perdListArray.push(item)
        }
        this.setState({
            orderList: perdListArray
        })
    }
    // 展开隐藏
    clickCb = (item) => {
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
        this.state.orderList[item.key] = item
        this.setState({
            orderList: [...this.state.orderList]
        })

    }
    // 立即还款
    handleClickConfirm = () => {
        const { billDesc } = this.state
        this.props.$fetch.post(API.payback, {
            billNo: this.state.queryData.billNo,
            thisRepTotAmt: this.state.money,
            cardAgrNo: this.state.bankInfo && this.state.bankInfo.agrNo ? this.state.bankInfo.agrNo : billDesc.wthCrdAgrNo,
            repayStsw: billDesc.billPerdStsw,
            usrBusCnl: 'WEB'
        }).then(res => {
            if (res.msgCode === 'PTM0000') {
                this.setState({
                    showMoudle: false
                })
                if (Number(billDesc.perdNum) === Number(billDesc.perdLth)) {
                    this.props.toast.info('还款完成')
                    sessionStorage.removeItem(sessionStorageMap.bill.backData)
                    sessionStorage.setItem(sessionStorageMap.bill.orderSuccess, JSON.stringify({
                        perdLth: billDesc.perdLth,
                        perdUnit: billDesc.perdUnit,
                        billPrcpAmt: billDesc.billPrcpAmt,
                        billRegDt: billDesc.billRegDt
                    }))
                    setTimeout(() => {
                        this.props.history.replace('/order/repayment_succ_page')
                    }, 2000);
                } else {
                    this.props.toast.info('还款成功')
                    // 刷新当前list
                    setTimeout(() => {
                        this.getLoanInfo()
                    }, 3000);
                }
            } else {
                this.setState({
                    showMoudle: false
                })
                this.props.toast.info(res.msgInfo)
            }
        }).catch(err => {
            this.setState({
                showMoudle: false
            })
            console.log(err)
        })
    }
    // 选择银行卡
    selectBank = () => {
        store.setBackUrl('/order/order_detail_page');
        this.props.history.push(`/mine/select_save_page?agrNo=${this.state.bankInfo && this.state.bankInfo.agrNo || this.state.billDesc && this.state.billDesc.wthCrdAgrNo}`);
    }
    render() {
        const { billDesc, money, hideBtn } = this.state
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
                            <span className={styles.item_value}>{billDesc && billDesc.loanDt}</span>
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
                    billDesc.perdNum !== 999 && !hideBtn ? <div className={styles.submit_btn}>
                        <SButton onClick={() => { this.setState({ showMoudle: true }) }}>
                            主动还款
                        </SButton>
                        <div className={styles.message}>此次主动还款，将用于还第<span className={styles.red}>{billDesc && billDesc.perdNum}/{billDesc && billDesc.perdLth}</span>期账单，请保证卡内余额大于该 期账单金额</div>
                    </div> : <div className={styles.mb50}></div>
                }
                <Modal popup visible={this.state.showMoudle} onClose={() => { this.setState({ showMoudle: false }) }} animationType="slide-up">
                    <div className={styles.modal_box}>
                        <div className={styles.modal_title}>付款详情<i onClick={() => { this.setState({ showMoudle: false }) }}></i></div>
                        <div className={styles.modal_flex}>
                            <span className={styles.modal_label}>本次还款金额</span><span className={styles.modal_value}>{money}元</span>
                        </div>
                        <div className={styles.modal_flex}>
                            <span className={styles.modal_label}>还款银行卡</span><span onClick={this.selectBank} className={`${styles.modal_value}`}>
                                {
                                    this.state.bankInfo && this.state.bankInfo.bankName ? <span>{this.state.bankInfo.bankName}({this.state.bankInfo.lastCardNo})</span> : <span>{billDesc && billDesc.wthdCrdCorpOrgNm}({billDesc && billDesc.wthdCrdNoLast})</span>
                                }

                            </span>&nbsp;<i></i>
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

