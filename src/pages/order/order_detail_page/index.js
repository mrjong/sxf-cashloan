import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import Panel from 'components/panel/index.js';
import fetch from "sx-fetch";
import SButton from 'components/button';
import { store } from 'utils/store';
import { Modal } from 'antd-mobile';
import { buriedPointEvent } from 'utils/Analytins';
import { order } from 'utils/AnalytinsType';
import styles from './index.scss';
import qs from 'qs';

const API = {
    'qryDtl': "/bill/qryDtl",
    'payback': '/bill/payback'
}
let entryFrom = '';
@fetch.inject()
export default class order_detail_page extends PureComponent {
    constructor(props) {
        super(props);
        entryFrom = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }).entryFrom;
        this.state = {
            billDesc: {},
            showMoudle: false,
            orderList: [],
            money: '',
            sendMoney: '',
            bankInfo: {},
            couponInfo: {},
            hideBtn: false,
            showItrtAmt: false, // 优惠劵金额小于利息金额 true为大于
            ItrtAmt: 0, // 每期利息金额
        }
    }
    componentWillMount() {
        if (!store.getBillNo()) {
            this.props.toast.info('订单号不能为空')
            setTimeout(() => {
                this.props.history.goBack()
            }, 3000);
            return
        }
        this.setState({
            billNo: store.getBillNo()
        }, () => {
            this.getLoanInfo()
        })


    }

    componentWillUnmount() {
        store.removeCardData()
    }

    // 获取还款信息
    getLoanInfo = () => {
        this.props.$fetch.post(API.qryDtl, {
            billNo: this.state.billNo
        })
            .then(res => {
                if (res.msgCode === 'PTM0000') {
                    res.data.perdNum !== 999 && this.setState({ money: res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt });
                    res.data.perdNum !== 999 && this.setState({ sendMoney: res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt });
                    res.data.perdNum !== 999 && this.setState({ ItrtAmt: res.data.perdList[res.data.perdNum - 1].perdItrtAmt })
                    if (res.data.data && res.data.data.coupVal) {
                        // 优惠劵最大不超过每期利息
                        if (parseFloat(res.data.data.coupVal) > parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt)) {
                            res.data.perdNum !== 999 && this.setState({ money: ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - res.data.perdList[res.data.perdNum - 1].perdItrtAmt * 100) / 100).toFixed(2) });
                            res.data.perdNum !== 999 && this.setState({ showItrtAmt: true });

                        } else {
                            res.data.perdNum !== 999 && this.setState({ showItrtAmt: false });
                            res.data.perdNum !== 999 && this.setState({ money: ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - res.data.data.coupVal * 100) / 100).toFixed(2) });
                        }
                    }
                    this.setState({
                        billDesc: res.data,
                        perdList: res.data.perdList
                    }, () => {
                        // 选择银行卡回来
                        let bankInfo = store.getCardData();
                        let couponInfo = store.getCouponData();
                        if (bankInfo && bankInfo !== {}) {
                            this.setState({
                                showMoudle: true
                            }, () => {
                                this.setState({
                                    bankInfo: bankInfo,
                                    couponInfo: couponInfo,
                                })
                                if (couponInfo && couponInfo !== {}) {
                                    this.setState({
                                        money: couponInfo.coupVal && parseFloat(couponInfo.coupVal) > parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt) ?
                                            ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - res.data.perdList[res.data.perdNum - 1].perdItrtAmt * 100) / 100).toFixed(2) :
                                            couponInfo.coupVal && parseFloat(couponInfo.coupVal) <= parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt) ?
                                                ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - couponInfo.coupVal * 100) / 100).toFixed(2) :
                                                res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt, // 优惠劵最大不超过每期利息
                                    })
                                    if (couponInfo.coupVal && parseFloat(couponInfo.coupVal) > parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt)) {
                                        this.setState({ showItrtAmt: true });
                                    } else {
                                        this.setState({ showItrtAmt: false });
                                    }
                                }
                                store.removeCardData();
                                store.removeCouponData();
                            })
                        } else {
                            this.setState({ couponInfo: null });
                        }
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
                    brief: perdList[i].perdDueDt + '还款'
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
                feeAmt: perdList[i].perdSts === '4' ? Number(perdList[i].perdTotAmt) : Number(perdList[i].perdWaitRepAmt)
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
        const { billDesc } = this.state;
        let couponId = '';
        if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
            if (this.state.couponInfo.usrCoupNo !== 'null') {
                couponId = this.state.couponInfo.usrCoupNo;
            } else {
                couponId = '';
            }

        } else {
            if (this.state.billDesc.data && this.state.billDesc.data.coupVal) {
                couponId = this.state.billDesc.data.usrCoupNo
            }
        }
        this.props.$fetch.post(API.payback, {
            billNo: this.state.billNo,
            thisRepTotAmt: this.state.sendMoney,
            cardAgrNo: this.state.bankInfo && this.state.bankInfo.agrNo ? this.state.bankInfo.agrNo : billDesc.wthCrdAgrNo,
            repayStsw: billDesc.billPerdStsw,
            coupId: couponId,
            usrBusCnl: 'WEB'
        }).then(res => {
            if (res.msgCode === 'PTM0000') {
                buriedPointEvent(order.repaymentFirst, {
                    entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单',
                    is_success: true,
                });
                this.setState({
                    showMoudle: false
                })
                if (billDesc.perdUnit === 'D' || Number(billDesc.perdNum) === Number(billDesc.perdLth)) {
                    this.props.toast.info('还款完成')
                    store.removeBackData()
                    store.setOrderSuccess({
                        perdLth: billDesc.perdLth,
                        perdUnit: billDesc.perdUnit,
                        billPrcpAmt: billDesc.billPrcpAmt,
                        billRegDt: billDesc.billRegDt
                    })
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
                buriedPointEvent(order.repaymentFirst, {
                    entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单',
                    is_success: false,
                    fail_cause: res.msgInfo,
                });
                this.setState({
                    showMoudle: false
                })
                this.props.toast.info(res.msgInfo);
                // 刷新当前list
                setTimeout(() => {
                    this.getLoanInfo();
                }, 3000);
            }
        }).catch(err => {
            this.setState({
                showMoudle: false
            })
        })
    }
    // 选择银行卡
    selectBank = () => {
        store.setBackUrl('/order/order_detail_page');
        this.props.history.push(`/mine/select_save_page?agrNo=${this.state.bankInfo && this.state.bankInfo.agrNo || this.state.billDesc && this.state.billDesc.wthCrdAgrNo}`);
    }
    // 选择优惠劵
    selectCoupon = (useFlag) => {
        if (useFlag) {
            this.props.history.push({ pathname: '/mine/coupon_page', search: `?billNo=${this.state.billNo}`, state: { nouseCoupon: true, cardData: this.state.bankInfo && this.state.bankInfo.bankName ? this.state.bankInfo : this.state.billDesc }, });
            return;
        }
        store.setBackUrl('/order/order_detail_page');
        if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
            store.setCouponData(this.state.couponInfo);
        } else {
            store.setCouponData(this.state.billDesc.data);
        }
        this.props.history.push({ pathname: '/mine/coupon_page', search: `?billNo=${this.state.billNo}`, state: { cardData: this.state.bankInfo && this.state.bankInfo.bankName ? this.state.bankInfo : this.state.billDesc }, });
    }
    // 判断优惠劵显示
    renderCoupon = () => {
        if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
            if (this.state.couponInfo.usrCoupNo !== 'null' && this.state.couponInfo.coupVal) {
                if (this.state.showItrtAmt) {
                    return (<span>-{this.state.ItrtAmt}元/仅可减免当期利息金额</span>)
                } else {
                    return (<span>-{this.state.couponInfo.coupVal}元</span>)
                }
            } else {
                return (<span>不使用</span>)
            }

        } else {
            if (this.state.billDesc.data && this.state.billDesc.data.coupVal) {
                if (this.state.showItrtAmt) {
                    return (<span>-{this.state.ItrtAmt}元/仅可减免当期利息金额</span>)
                } else {
                    return (<span>-{this.state.billDesc.data.coupVal}元</span>)
                }

            }
        }
    }
    render() {
        const { billDesc, money, hideBtn } = this.state
        return (
            <div className={styles.order_detail_page}>
                <Panel title="借款信息">
                    <ul className={styles.panel_conten}>
                        <li className={styles.list_item}>
                            <label className={styles.item_name}>借款本金(元)</label>
                            <span className={styles.item_value}>{billDesc && billDesc.billPrcpAmt ? `${billDesc.billPrcpAmt}` : ''}</span>
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
                        <SButton onClick={() => { this.setState({ showMoudle: true }); buriedPointEvent(order.repayment, {entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单'}); }}>
                            主动还款
                        </SButton>
                        <div className={styles.message}>此次主动还款，将用于还第<span className={styles.red}>{billDesc && billDesc.perdNum}/{billDesc.perdUnit === 'M' ? billDesc.perdLth : '1'}</span>期账单，请保证卡内余额大于该 期账单金额</div>
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
                        <div className={`${styles.modal_flex} ${styles.modal_flex2}`}>
                            <span className={styles.modal_label}>优惠券</span>
                            {
                                this.state.billDesc.data && this.state.billDesc.data.coupVal ?
                                    <span onClick={() => { this.selectCoupon(false) }} className={`${styles.modal_value}`}>
                                        {
                                            this.renderCoupon()
                                        }
                                    </span>
                                    :
                                    <span onClick={() => { this.selectCoupon(true) }} className={`${styles.modal_value}`}>无可用优惠券</span>
                            }
                            &nbsp;<i></i>
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

