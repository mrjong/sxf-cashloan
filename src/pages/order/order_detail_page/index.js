import React, { PureComponent } from 'react';
import Lists from 'components/Lists';
import Panel from 'components/Panel';
import fetch from "sx-fetch";
import SXFButton from 'components/ButtonCustom';
import { store } from 'utils/store';
import { Modal } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import{getH5Channel}from 'utils/common'
import qs from 'qs';
import SmsModal from './components/SmsModal'

const API = {
  qryDtl: "/bill/qryDtl",
  payback: '/bill/payback',
  couponCount: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
  protocolSms: '/withhold/protocolSms', // 校验协议绑卡
  protocolBind: '/withhold/protocolBink'//协议绑卡接口
}
let entryFrom = '';
@fetch.inject()
export default class order_detail_page extends PureComponent {
  constructor(props) {
    super(props);
    entryFrom = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }).entryFrom;
    this.state = {
      billDesc: {},
      showModal: false,
      orderList: [],
      money: '',
      sendMoney: '',
      bankInfo: {},
      couponInfo: {},
      hideBtn: false,
      isPayAll: false, // 是否一键结清
      // showItrtAmt: false, // 优惠劵金额小于利息金额 true为大于
      // ItrtAmt: 0, // 每期利息金额
      deratePrice: '',
      isShowSmsModal: false //是否显示短信验证码弹窗
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
          // const calcMoney = res.data.perdNum !== 999 && ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt*100 - res.data.perdList[res.data.perdNum - 1].deductionAmt*100)/100).toFixed(2);
          res.data.perdNum !== 999 && this.setState({ money: res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt });
          // res.data.perdNum !== 999 && this.setState({ money: calcMoney });                    
          res.data.perdNum !== 999 && this.setState({ sendMoney: res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt });
          // res.data.perdNum !== 999 && this.setState({ ItrtAmt: res.data.perdList[res.data.perdNum - 1].perdItrtAmt })
          // if (res.data.data && res.data.data.coupVal && res.data.perdNum !== 999) {
          //     // 优惠劵最大不超过每期利息
          //     if (parseFloat(res.data.data.coupVal) > parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt)) {
          //         res.data.perdNum !== 999 && this.setState({ money: ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - res.data.perdList[res.data.perdNum - 1].perdItrtAmt * 100) / 100).toFixed(2) });
          //         res.data.perdNum !== 999 && this.setState({ showItrtAmt: true });

          //     } else {
          //         res.data.perdNum !== 999 && this.setState({ showItrtAmt: false });
          //         res.data.perdNum !== 999 && this.setState({ money: ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - res.data.data.coupVal * 100) / 100).toFixed(2) });
          //     }
          // }
          this.setState({
            billDesc: res.data,
            perdList: res.data.perdList
          }, () => {
            // 选择银行卡回来
            let bankInfo = store.getCardData();
            // let couponInfo = store.getCouponData();
            if (bankInfo && JSON.stringify(bankInfo) !== '{}') {
              this.setState({
                showModal: true
              }, () => {
                this.setState({
                  bankInfo: bankInfo,
                  // couponInfo: couponInfo,
                })
                store.removeCardData();
                if (res.data && res.data.data && res.data.perdNum !== 999) {
                  this.dealMoney(res.data);
                }
                // // 前端计算优惠劵减免金额
                // if (couponInfo && couponInfo !== {}) {
                //     this.setState({
                //         money: couponInfo.coupVal && parseFloat(couponInfo.coupVal) > parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt) ?
                //             ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - res.data.perdList[res.data.perdNum - 1].perdItrtAmt * 100) / 100).toFixed(2) :
                //             couponInfo.coupVal && parseFloat(couponInfo.coupVal) <= parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt) ?
                //                 ((res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt * 100 - couponInfo.coupVal * 100) / 100).toFixed(2) :
                //                 res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt, // 优惠劵最大不超过每期利息
                //     })
                //     if (couponInfo.coupVal && parseFloat(couponInfo.coupVal) > parseFloat(res.data.perdList[res.data.perdNum - 1].perdItrtAmt)) {
                //         this.setState({ showItrtAmt: true });
                //     } else {
                //         this.setState({ showItrtAmt: false });
                //     }
                // }
              })
            } else {
              if (res.data && res.data.data && res.data.perdNum !== 999) {
                this.dealMoney(res.data);
              }
              // this.setState({ couponInfo: null });
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

  // 后台计算优惠券减免金额以及本次还款金额
  dealMoney = (result) => {
    let couponInfo = store.getCouponData();
    store.removeCouponData();
    let params = {};
    // 如果没有coupId直接不调用接口
    if (couponInfo && (couponInfo.usrCoupNo === 'null' || couponInfo.coupVal === -1)) {
      // 不使用优惠劵的情况
      this.setState({
        couponInfo,
      });
      return;
    }
    if (couponInfo && JSON.stringify(couponInfo) !== '{}') {
      params = {
        billNo: this.state.billNo,
        couponId: couponInfo.usrCoupNo, // 优惠劵id
        type: '01', // 00为借款 01为还款
        currentStage: result.perdNum,
        price: result.perdList[result.perdNum - 1].perdWaitRepAmt,
        totalStage: result.perdLth,
      };
    } else {
      params = {
        billNo: this.state.billNo,
        couponId: result.data.usrCoupNo, // 优惠劵id
        type: '01', // 00为借款 01为还款
        currentStage: result.perdNum,
        price: result.perdList[result.perdNum - 1].perdWaitRepAmt,
        totalStage: result.perdLth,
      };
    }
    this.props.$fetch.get(API.couponCount, params).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        this.setState({
          couponInfo,
          deratePrice: result.data.deratePrice,
          money: result.data.resultPrice,
        });
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
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
      // 已还金额-减免金额
      // let perdTotRepAmt = 0;
      // 暂时把优惠劵的金额加在利息上，改变后台返回的利息数量
      // for(let j=0; j < item.feeInfos.length; j++){
      //     if(item.feeInfos[j].feeNm === '利息'){
      //         item.feeInfos[j].feeAmt = (item.feeInfos[j].feeAmt * 100 + perdList[i].deductionAmt * 100)/100
      //     }
      //     if(item.feeInfos[j].feeNm === '减免金额'){
      //         perdTotRepAmt = item.feeInfos[j].feeAmt;
      //     }
      // }

      item.feeInfos.push({
        feeNm: '优惠劵',
        feeAmt: '-' + perdList[i].deductionAmt,
      });
      // 判断是否结清
      if (perdList[i].perdSts === '4') {
        item.isClear = true;
      } else {
        item.isClear = false;
        item.feeInfos.push({
          feeNm: '已还金额',
          feeAmt: perdList[i].perdTotRepAmt,
          // feeAmt: (perdList[i].perdTotRepAmt*100 + perdTotRepAmt*100)/100,
        });
        item.feeInfos.push({
          feeNm: '剩余应还',
          feeAmt: Number(perdList[i].perdWaitRepAmt)
          // feeAmt: ((perdList[i].perdWaitRepAmt*100 - perdList[i].deductionAmt*100)/100).toFixed(2),
          // feeAmt: perdList[i].perdSts === '4' ? Number(perdList[i].perdTotAmt) : Number(perdList[i].perdWaitRepAmt)
        })
      }
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
  // 处理输入的验证码
  handleSmsCodeChange = (smsCode) => {
    this.setState({
      smsCode,
    })
  }
  // 跳过验证直接执行代扣逻辑
  skipProtocolBindCard = () => {
    this.setState({
      isShowSmsModal: false,
      smsCode: ''
    })
    this.repay()
  }
  // 确认协议绑卡
  confirmProtocolBindCard = () => {
    if (!this.state.smsCode) {
      this.props.toast.info('请输入正确的验证码')
      return
    }
    this.props.$fetch.post(API.protocolBind, {
      cardNo: this.state.wthCrdAgrNo,
      smsCd: this.state.smsCode
    }).then((res) => {
      isFetching = false;
      if (res.msgCode === 'PTM0000') {
        this.setState({
          isShowSmsModal: false,
          smsCode: ''
        })
        this.repay()
      } else if (res.msgCode === 'PTM9901') {
        this.props.toast.info(res.data);
        this.setState({ smsCode: '' });
      } else {
        this.setState({
          isShowSmsModal: false,
          smsCode: ''
        })
        this.repay()
      }
    })
  }
  // 协议绑卡校验接口
  checkProtocolBindCard = () => {
    const params = {
      cardNo: this.state.bankInfo && this.state.bankInfo.agrNo ? this.state.bankInfo.agrNo : this.state.billDesc.wthCrdAgrNo,
      bankCd: this.state.billDesc.wthdCrdCorpOrg,
      // bnkMblNo: store.getUserPhone(),
      usrSignCnl: getH5Channel(),
      cardTyp: 'D',
      isEntry: '01'
    }
    this.props.$fetch.post(API.protocolSms, params).then((res) => {
      switch (res.msgCode) {
        case 'PTM0000':
          //协议绑卡校验成功提示（走协议绑卡逻辑）
          this.setState({
            isShowSmsModal: true
          })
          break;
        // case 'PTM9901':
        //   this.props.toast.info(res.data);
        //   break;
        default:
          this.repay()
          break;
      }
    })
  }

  // 立即还款
  handleClickConfirm = () => {
    const { billDesc = {}, billNo, isPayAll, couponInfo = {} } = this.state;
    let couponId = '';
    let sendParams = {}
    if (couponInfo && couponInfo.usrCoupNo) {
      if (couponInfo.usrCoupNo !== 'null') {
        couponId = couponInfo.usrCoupNo;
      } else {
        couponId = '';
      }
    } else {
      if (billDesc.data && billDesc.data.usrCoupNo) {
        couponId = billDesc.data.usrCoupNo
      } else {
        couponId = '';
      }
    }
    //let couponId = couponInfo.usrCoupNo || billDesc.data.usrCoupNo || ''
    // 判断是否为一键结清
    let repayStswStr = '';
    if (isPayAll) {
      if (billDesc.billPerdStsw.indexOf('1') > -1) { // 只适用里面有一个1的情况
        repayStswStr = billDesc.billPerdStsw.split('1')[0] + '1' + billDesc.billPerdStsw.split('1')[1].replace(/0/g, '1')
      } else {
        return;
      }
      sendParams = {
        billNo,
        thisRepTotAmt: billDesc.waitRepAmt,
        cardAgrNo: this.state.bankInfo && this.state.bankInfo.agrNo ? this.state.bankInfo.agrNo : billDesc.wthCrdAgrNo,
        repayStsw: repayStswStr,
        usrBusCnl: 'WEB'
      }
    } else {
      sendParams = {
        billNo,
        thisRepTotAmt: this.state.sendMoney,
        cardAgrNo: this.state.bankInfo && this.state.bankInfo.agrNo ? this.state.bankInfo.agrNo : billDesc.wthCrdAgrNo,
        repayStsw: billDesc.billPerdStsw,
        coupId: couponId,
        usrBusCnl: 'WEB'
      }
    }
    //全局设置还款传递后台的参数
    this.setState({
      repayParams: sendParams
    }, () => {
      //调用协议绑卡接口
      this.checkProtocolBindCard()
    })
  }
  //调用还款接口逻辑
  repay = () => {
    const { billDesc, isPayAll } = this.state;
    this.props.$fetch.post(API.payback, this.state.repayParams).then(res => {
      if (res.msgCode === 'PTM0000') {
        buriedPointEvent(order.repaymentFirst, {
          entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单',
          is_success: true,
        });
        this.setState({
          showModal: false,
          couponInfo: {},
        })
        if (billDesc.perdUnit === 'D' || Number(billDesc.perdNum) === Number(billDesc.perdLth) || isPayAll) {
          this.props.toast.info('还款完成')
          store.removeBackData();
          store.removeCouponData();
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
          this.props.toast.info('申请还款成功');
          store.removeCouponData();
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
          showModal: false,
          couponInfo: {},
        })
        this.props.toast.info(res.msgInfo);
        store.removeCouponData();
        // 刷新当前list
        setTimeout(() => {
          this.getLoanInfo();
        }, 3000);
      }
    }).catch(err => {
      store.removeCouponData();
      this.setState({
        showModal: false,
        couponInfo: {},
      })
    })
  }
  // 选择银行卡
  selectBank = () => {
    const { bankInfo: { agrNo = '' }, billDesc: { wthCrdAgrNo = '' } } = this.state
    store.setBackUrl('/order/order_detail_page');
    this.props.history.push(`/mine/select_save_page?agrNo=${agrNo || wthCrdAgrNo}`);
  }
  // 选择优惠劵
  selectCoupon = (useFlag) => {
    const { billNo, billDesc, couponInfo, bankInfo: { bankName } } = this.state
    if (useFlag) {
      store.removeCouponData(); // 如果是从不可使用进入则清除缓存中的优惠劵数据
      this.props.history.push({
        pathname: '/mine/coupon_page',
        search: `?billNo=${billNo}`,
        state: { nouseCoupon: true, cardData: bankName ? bankInfo : billDesc },
      });
      return;
    }
    store.setBackUrl('/order/order_detail_page');
    if (couponInfo && couponInfo.usrCoupNo) {
      store.setCouponData(couponInfo);
    } else {
      store.setCouponData(billDesc.data);
    }
    this.props.history.push({
      pathname: '/mine/coupon_page',
      search: `?billNo=${billNo}`,
      state: { cardData: bankName ? bankInfo : billDesc }
    });
  }
  // 判断优惠劵显示
  renderCoupon = () => {
    const { deratePrice } = this.state;
    if (deratePrice !== '') {
      return (<span>{deratePrice === 0 ? deratePrice : -deratePrice}元</span>)
    } else {
      return (<span>不使用</span>)
    }
    // if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
    //     if (this.state.couponInfo.usrCoupNo !== 'null' && this.state.couponInfo.coupVal) {
    //         if (this.state.showItrtAmt) {
    //             return (<span>-{this.state.ItrtAmt}元/仅可减免当期利息金额</span>)
    //         } else {
    //             return (<span>-{this.state.couponInfo.coupVal}元</span>)
    //         }
    //     } else {
    //         return (<span>不使用</span>)
    //     }

    // } else {
    //     if (this.state.billDesc.data && this.state.billDesc.data.coupVal) {
    //         if (this.state.showItrtAmt) {
    //             return (<span>-{this.state.ItrtAmt}元/仅可减免当期利息金额</span>)
    //         } else {
    //             return (<span>-{this.state.billDesc.data.coupVal}元</span>)
    //         }

    //     }
    // }
  }
  // 一键结清
  payAllOrder = () => {
    this.setState({
      showModal: true,
      isPayAll: true,
    });
  }
  render() {
    const { billDesc = {}, money, hideBtn, isPayAll, isShowSmsModal, smsCode } = this.state
    const {
      billPrcpAmt = '',
      perdLth = '',
      perdUnit = '',
      repayTypNm = '',
      loanDt = '',
      payCrdCorpOrgNm = '',
      payCrdNoLast = '',
      wthdCrdCorpOrgNm = '',
      wthdCrdNoLast = '',
      perdNum = '',
      waitRepAmt = ''
    } = billDesc
    const itemList = [
      {
        name: '借款本金(元)',
        value: billPrcpAmt
      },
      {
        name: '借款期限',
        value: `${perdLth}${perdUnit === 'M' ? '个月' : '天'}`
      },
      {
        name: '还款方式',
        value: repayTypNm
      },
      {
        name: '放款时间',
        value: loanDt
      },
      {
        name: '收款银行卡',
        value: `${payCrdCorpOrgNm}(${payCrdNoLast})`
      },
      {
        name: '还款银行卡',
        value: `${wthdCrdCorpOrgNm}(${wthdCrdNoLast})`
      }
    ]
    return (
      <div className={styles.order_detail_page}>
        <Panel title="借款信息" className={styles.loadInfBox}>
          <ul className={styles.panel_conten}>
            {
              itemList.map(item => (
                <li className={styles.list_item} key={item.name}>
                  <label className={styles.item_name}>{item.name}</label>
                  <span className={styles.item_value}>{item.value}</span>
                </li>
              ))
            }
          </ul>
          {
            perdNum !== 999 && !hideBtn && <span className={styles.payAll} onClick={this.payAllOrder}>一键结清</span>
          }
        </Panel>
        <Panel title="还款计划" className={styles.mt24}>
          <Lists listsInf={this.state.orderList} clickCb={this.clickCb} className={styles.order_list} />
        </Panel>
        {
          perdNum !== 999 && !hideBtn ? <div className={styles.submit_btn}>
            <SXFButton
              onClick={() => {
                this.setState({ showModal: true, isPayAll: false, });
                buriedPointEvent(order.repayment, { entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单' });
              }}>
              主动还款
            </SXFButton>
            <div className={styles.message}>此次主动还款，将用于还第
              <span className={styles.red}>{perdNum}/{perdUnit === 'M' ? perdLth : '1'}</span>
              期账单，请保证卡内余额大于该 期账单金额
            </div>
          </div> : <div className={styles.mb50}></div>
        }
        <Modal popup visible={this.state.showModal} onClose={() => { this.setState({ showModal: false }) }} animationType="slide-up">
          <div className={styles.modal_box}>
            <div className={styles.modal_title}>付款详情
              <i onClick={() => { this.setState({ showModal: false }) }}></i>
            </div>
            <div className={styles.modal_flex}>
              <span className={styles.modal_label}>本次还款金额</span>
              <span className={styles.modal_value}>{isPayAll ? waitRepAmt : money}元</span>
            </div>
            <div className={styles.modal_flex}>
              <span className={styles.modal_label}>还款银行卡</span>
              <span onClick={this.selectBank} className={`${styles.modal_value}`}>
                {
                  this.state.bankInfo && this.state.bankInfo.bankName ? <span>{this.state.bankInfo.bankName}({this.state.bankInfo.lastCardNo})</span>
                    : <span>{wthdCrdCorpOrgNm}({wthdCrdNoLast})</span>
                }
              </span>&nbsp;<i></i>
            </div>
            { // 一键结清不显示优惠劵
              !isPayAll && <div className={`${styles.modal_flex} ${styles.modal_flex2}`}>
                <span className={styles.modal_label}>优惠券</span>
                {
                  this.state.billDesc.data && this.state.billDesc.data.coupVal ?
                    <span onClick={() => { this.selectCoupon(false) }} className={`${styles.modal_value}`}>
                      {this.renderCoupon()}
                    </span>
                    : <span onClick={() => { this.selectCoupon(true) }} className={`${styles.modal_value}`}>无可用优惠券</span>
                }
                &nbsp;<i></i>
              </div>
            }
            <SXFButton onClick={this.handleClickConfirm} className={styles.modal_btn}>立即还款</SXFButton>
          </div>
          {isShowSmsModal && <SmsModal
            onCancel={this.skipProtocolBindCard}
            onConfirm={this.confirmProtocolBindCard}
            onSmsCodeChange={this.handleSmsCodeChange}
            smsCodeAgain={this.checkProtocolBindCard}
            smsCode={smsCode}
          />}
        </Modal>
      </div>
    )
  }
}

