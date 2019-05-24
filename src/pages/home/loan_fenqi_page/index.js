import React, { PureComponent } from 'react';
import { Modal, InputItem, Icon } from 'antd-mobile';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { loan_fenqi } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background'
import { getDeviceType } from 'utils';
import SXFButton from 'components/ButtonCustom';
import style from './index.scss';
import linkConf from 'config/link.conf';
import Cookie from 'js-cookie';

const API = {
  prodInfo: '/cash/prodList', //产品列表基本信息查询
  prodInfoByMoney: '/cash/prodInfo', //根据用户金额获取产品信息 
  loanUsage: '/cash/loanUsage',  //借款用途
  couponSupport: '/cash/couponSupport', //最佳优惠券获取
  contractList: '/fund/info', //合同列表
  repayPlan: '/bill/prebill', //还款计划查询
  agentRepay: '/bill/agentRepay', // 借款申请接口
  qryContractInfo: '/fund/qryContractInfo', // 合同数据流获取
  doCouponCount: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
}

let isFetching = false

@fetch.inject()
@setBackGround('#fff')
export default class loan_fenqi_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputClear: false,
      usageModal: false,
      planModal: false,
      tipModal: false,
      prdId: '',
      loanDate: '',
      loanMoney: '',
      usageList: [],
      couponInfo: {},
      resaveBankCardAgrNo: '',
      resaveBankCardLastNo: '',
      resaveBankCardName: '',
      payBankCardAgrNo: '',
      payBankCardLastNo: '',
      payBankCardName: '',
      perdRateList: [],
      contractList: [],
      repayPlanInfo: {
        perd: []
      }
    }
  }

  componentWillMount() {
    let storeData = store.getCashFenQiStoreData() // 代提交的借款信息
    let cashFenQiCardArr = store.getCashFenQiCardArr() // 收、还款卡信息
    let couponInfo = store.getCouponData() //优惠券数据

    if (storeData && cashFenQiCardArr) {
      this.handleDataDisplay(storeData, cashFenQiCardArr)
    } else {
      this.queryProdInfo()
      this.queryLoanUsageList()
    }

    if (couponInfo && couponInfo.coupVal === -1) {
      this.setState({
        couponInfo,
        deratePrice: ''
      })
    }

    if (couponInfo && storeData && couponInfo.coupVal !== -1) {
      this.dealMoney(couponInfo, storeData.prdId)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { loanMoney, loanDate } = this.state
    if (loanMoney && loanDate && (loanMoney !== prevState.loanMoney || loanDate.perdCnt !== prevState.loanDate.perdCnt)) {
      this.queryContractList()
    }
  }

  //查询产品基本信息
  queryProdInfo = () => {
    this.props.$fetch.get(API.prodInfo, {
      channelType: 'h5'
    }).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        const {
          resaveBankCardAgrNo,
          resaveBankCardLastNo,
          resaveBankCardName,
          payBankCardAgrNo,
          payBankCardLastNo,
          payBankCardName,
          perdRateList,
          priceMax,
          priceMin
        } = res.data
        this.setState({
          resaveBankCardAgrNo,
          resaveBankCardLastNo,
          resaveBankCardName,
          payBankCardAgrNo,
          payBankCardLastNo,
          payBankCardName,
          perdRateList,
          priceMax,
          priceMin
        })
      } else {
        this.props.toast.info('暂无数据');
      }
    })
  }

  //根据用户金额获取产品信息
  queryProdInfoByMoney = () => {
    isFetching = true
    this.props.$fetch.get(API.prodInfoByMoney, {
      price: this.state.loanMoney
    }).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        isFetching = false
        this.setState({
          perdRateList: res.data,
          loanDate: ''
        })
      } else {
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  //查询借款用途列表
  queryLoanUsageList = () => {
    this.props.$fetch.get(API.loanUsage).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          usageList: res.data
        }, () => {
          this.selectLoanUsage(this.state.usageList[0])
        })
      } else {
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  //查询合同列表
  queryContractList = () => {
    const { loanMoney, resaveBankCardAgrNo, loanDate } = this.state
    const { perdCnt, perdLth, perdUnit } = loanDate
    this.props.$fetch.post(API.contractList, {
      loanAmount: loanMoney,
      periodLth: perdLth,
      periodCount: perdCnt,
      periodUnit: perdUnit,
      prodType: '11',
      wtdwTyp: "0",
      agrNo: resaveBankCardAgrNo
    }).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          contractList: res.data,
          prdId: res.data[0].productId  //产品ID
        }, () => {
          this.queryCouponInfo()
        })
      } else {
        this.setState({
          contractList: [],
          prdId: ''
        })
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  //查询优惠券
  queryCouponInfo = () => {
    const { loanMoney, loanDate, prdId } = this.state
    this.props.$fetch.post(API.couponSupport, {
      price: loanMoney,
      type: 'LOAN',
      prodType: '11',
      periodCount: loanDate.perdCnt
    }).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          couponInfo: res.data
        }, () => {
          this.dealMoney(res.data, prdId)
        })
      } else {
        this.setState({
          couponInfo: {}
        })
      }
    })
  }

  //查询还款计划
  queryRepayPlan = () => {
    const { loanMoney, prdId } = this.state
    if (!prdId || !loanMoney) return
    this.props.$fetch.post(API.repayPlan, {
      billPrcpAmt: loanMoney,
      prdId,
      wtdwTyp: "0",
      prodType: '11'
    }).then((res) => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          repayPlanInfo: res.data
        }, () => {
          buriedPointEvent(loan_fenqi.repayPlan)
          this.openModal('plan')
        });
      } else {
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  // 选择优惠劵
  selectCoupon = () => {
    const { couponInfo, loanMoney, loanDate } = this.state
    if (!couponInfo.coupVal) return
    this.storeTempData()
    console.log(couponInfo)
    if (couponInfo && couponInfo.coupId) {
      store.setCouponData(couponInfo);
    }
    this.props.history.push({
      pathname: '/mine/coupon_page',
      search: `?transactionType=fenqi&price=${loanMoney}&perCont=${loanDate.perdUnit === 'M' ? loanDate.perdLth : 1}`,
    });
  }

  // 选择银行卡
  selectBankCard = (agrNo, cardType) => {
    store.setBackUrl('/home/loan_fenqi');
    this.storeTempData()
    this.props.history.push({
      pathname: '/mine/select_save_page',
      search: `?agrNo=${agrNo}&cardType=${cardType}`
    });
    if (cardType === 'resave') {
      buriedPointEvent(loan_fenqi.resaveCard)
    } else {
      buriedPointEvent(loan_fenqi.payCard)
    }
  };

  //绑定银行卡
  bindBankCard = (cardType) => {
    this.storeTempData()
    this.props.history.push({
      pathname: '/mine/bind_save_page',
      search: `?cardType=${cardType}`
    });
  }

  selectLoanDate = (item) => {
    if (isFetching) return
    this.setState({
      loanDate: item
    })
    switch (item.perdCnt) {
      case 30:
        buriedPointEvent(loan_fenqi.day30)
        break;
      case 3:
        buriedPointEvent(loan_fenqi.month3)
        break;
      case 6:
        buriedPointEvent(loan_fenqi.month6)
        break;
      case 9:
        buriedPointEvent(loan_fenqi.month9)
        break;
      case 12:
        buriedPointEvent(loan_fenqi.month12)
        break;
      default:
        break;
    }
  }

  //选择用途
  selectLoanUsage = (item) => {
    this.setState({
      loanUsage: item
    }, () => {
      this.closeModal('usage')
    })
  }

  openModal = (type) => {
    this.setState({
      [type + 'Modal']: true
    })
  }

  closeModal = (type) => {
    this.setState({
      [type + 'Modal']: false
    })
  }

  //阅读合同详情
  readContract = (item) => {
    const { loanMoney, payBankCardAgrNo, resaveBankCardAgrNo } = this.state
    this.props.history.push({
      pathname: '/protocol/pdf_page',
      state: {
        url: `${linkConf.PDF_URL}${API.qryContractInfo}?contractTyep=${item.contractTyep}&contractNo=${item.contractNo}&loanAmount=${loanMoney}&productId=${item.productId}&agreementNo=${resaveBankCardAgrNo}&withholdAgrNo=${payBankCardAgrNo}&fin-v-card-token=${Cookie.get('fin-v-card-token') || store.getToken()}`,
        name: item.contractMdlName
      }
    });
    buriedPointEvent(loan_fenqi.contract, { contractName: item.contractMdlName })
  }

  //暂存页面反显的临时数据
  storeTempData = () => {
    const {
      loanMoney,
      loanDate,
      loanUsage,
      prdId,
      priceMax,
      priceMin,
      couponInfo,
      resaveBankCardAgrNo,
      resaveBankCardLastNo,
      resaveBankCardName,
      payBankCardAgrNo,
      payBankCardLastNo,
      payBankCardName,
      perdRateList,
      contractList,
      usageList,
      deratePrice
    } = this.state
    const resaveCard = {
      agrNo: resaveBankCardAgrNo,
      lastCardNo: resaveBankCardLastNo,
      bankName: resaveBankCardName
    }
    const payCard = {
      agrNo: payBankCardAgrNo,
      lastCardNo: payBankCardLastNo,
      bankName: payBankCardName
    }
    store.setCashFenQiStoreData({ loanMoney, loanDate, loanUsage, prdId, priceMax, priceMin, perdRateList, contractList, usageList, couponInfo, deratePrice })
    store.setCashFenQiCardArr([resaveCard, payCard])
  }

  //处理数据反显
  handleDataDisplay = (storeData = {}, cardArr = []) => {
    let tempResaveCard = cardArr[0] || {}
    let tempPayCard = cardArr[1] || {}
    let perdRateList = []
    let usageList = []
    const { agrNo: resaveBankCardAgrNo, bankName: resaveBankCardName, lastCardNo: resaveBankCardLastNo } = tempResaveCard
    const { agrNo: payBankCardAgrNo, bankName: payBankCardName, lastCardNo: payBankCardLastNo } = tempPayCard
    if (this.state.inputClear || !storeData.perdRateList || !storeData.usageList) {
      perdRateList = this.state.perdRateList
      usageList = this.state.usageList
    } else {
      perdRateList = storeData.perdRateList
      usageList = storeData.usageList
    }
    let data = Object.assign(storeData, {
      resaveBankCardAgrNo,
      resaveBankCardName,
      resaveBankCardLastNo,
      payBankCardAgrNo,
      payBankCardName,
      payBankCardLastNo,
      perdRateList,
      usageList,
    })
    this.setState({ ...data })
  }

  //验证信息是否填写完整
  validateFn = () => {
    const { loanMoney, loanDate, resaveBankCardAgrNo, payBankCardAgrNo, prdId } = this.state
    if (loanMoney && loanDate && resaveBankCardAgrNo && payBankCardAgrNo && prdId) {
      return true
    }
    return false
  }

  // 处理优惠券金额显示
  dealMoney = (couponInfo, prdId) => {
    let storeData = store.getCashFenQiStoreData() || {} // 代提交的借款信息
    this.props.$fetch.get(API.doCouponCount, {
      prodId: prdId,
      couponId: couponInfo.usrCoupNo,
      type: '00', // 00为借款 01为还款
      price: storeData.loanMoney || this.state.loanMoney,
      prodType: '11'
    }).then((result) => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        this.setState({
          couponInfo, // 计算之后更新state的优惠券信息
          deratePrice: result.data.deratePrice
        })
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  }

  //计算待提交的金额
  calcLoanMoney = (m) => {
    if (this.state.loanMoney === m) return
    const { priceMax, priceMin } = this.state
    let loanMoney;
    buriedPointEvent(loan_fenqi.moneyBlur, { loanMoney: m })
    if (m === 0 || m < priceMin) {
      loanMoney = priceMin
    } else if (m > priceMax) {
      loanMoney = priceMax
    } else {
      loanMoney = Math.ceil(Number(m) / 100) * 100 //金额向上100取整
    }
    this.setState({ loanMoney }, () => {
      this.queryProdInfoByMoney()
    })
  }

  //借款申请提交
  loanApplySubmit = () => {
    const {
      loanMoney,
      loanDate,
      loanUsage,
      resaveBankCardAgrNo,
      payBankCardAgrNo,
      prdId,
      couponInfo,
    } = this.state
    if (this.validateFn()) {
      buriedPointEvent(loan_fenqi.clickSubmit, {
        loanMoney,
        loanDate
      })
      this.props.$fetch.post(API.agentRepay, {
        withDrawAgrNo: resaveBankCardAgrNo, // 代还信用卡主键
        withHoldAgrNo: payBankCardAgrNo, // 还款卡号主键
        prdId, // 产品ID
        repayType: '0', // 还款方式
        coupId: couponInfo.coupId || '', // 优惠劵id
        price: loanMoney, // 签约金额
        osType: getDeviceType(), // 操作系统
        prodType: '11',
        channelType: 'h5',
        loanUsage: loanUsage.value
      }).then(res => {
        if (res.msgCode === 'PTM0000') {
          this.props.history.push('/home/home')
          buriedPointEvent(loan_fenqi.submitResult, {
            is_success: true
          })
        } else {
          this.props.toast.info(res.msgInfo);
          buriedPointEvent(loan_fenqi.submitResult, {
            is_success: false,
            fail_cause: res.msgInfo
          })
        }
      }).catch(err => {
        buriedPointEvent(loan_fenqi.submitResult, {
          is_success: false,
          fail_cause: err
        })
      })
    }
  }

  render() {
    const {
      usageModal,
      prdId,
      loanUsage: loanUsageObj,
      usageList,
      tipModal,
      loanDate,
      loanMoney,
      planModal,
      resaveBankCardAgrNo,
      resaveBankCardLastNo,
      resaveBankCardName,
      payBankCardAgrNo,
      payBankCardLastNo,
      payBankCardName,
      perdRateList,
      couponInfo,
      priceMax = '',
      priceMin = '',
      contractList,
      repayPlanInfo,
      deratePrice
    } = this.state
    return (
      <div className={style.fenqi_page}>
        <div className={style.scrollWrap}>
          <div className={style.inputWrap}>
            <div className={style.billInpBox}>
              <i className={style.moneyUnit}>¥</i>
              <InputItem
                className={style.billInput}
                placeholder={`可借金额${priceMin}～${priceMax}`}
                clear={true}
                type="number"
                value={loanMoney}
                maxLength={7}
                onChange={(v) => {
                  if (!v) {
                    this.setState({
                      inputClear: true
                    }, () => {
                      store.removeCashFenQiStoreData()
                      this.queryProdInfo()
                    })
                  }
                  this.setState({
                    loanMoney: v,
                    loanDate: ''
                  })
                }}
                onBlur={(v) => {
                  v && this.calcLoanMoney(Number(v))
                }}
              />
            </div>
            <p className={style.inputTip}>建议全部借出，借款后剩余额度将不可用</p>
          </div>

          <div className={style.pannel}>
            <ul>
              <li className={style.listItem} style={{ alignItems: 'flex-start' }}>
                <label>借多久</label>
                <span className={style.tagListWrap}>
                  {perdRateList.map(item => (
                    <span
                      key={item.perdCnt}
                      className={[style.tagButton, loanDate.perdCnt === item.perdCnt && style.tagButtonActive].join(' ')}
                      onClick={() => { this.selectLoanDate(item) }}
                    >
                      {item.perdPageNm}
                    </span>
                  ))}
                </span>
              </li>
              <li className={style.listItem}>
                <label>借款用途</label>
                <span onClick={() => { this.openModal('usage') }} className={style.listValue}>
                  {loanUsageObj && loanUsageObj.loanUsage}
                  <Icon type="right" className={style.icon} />
                </span>
              </li>
              <li className={style.listItem}>
                <label>还款计划</label>
                <span>
                  {
                    loanMoney && loanDate && prdId ? <span className={style.listValue} onClick={this.queryRepayPlan}>
                      点击查看
                    <Icon type="right" className={style.icon} />
                    </span> : <span className={style.greyText}>暂无</span>
                  }
                </span>
              </li>
              {
                loanMoney && loanDate && <li className={style.listItem}>
                  <label>优惠券</label>
                  <span className={style.listValue} onClick={this.selectCoupon}>
                    <span className={style.redText}>{couponInfo.coupVal ? `${deratePrice ? `${deratePrice}` : '请选择'}` : '无可用优惠券'}</span>
                    <Icon type="right" className={style.icon} />
                  </span>
                </li>
              }
              <li className={style.listItem}>
                <label>收款银行卡</label>
                {
                  resaveBankCardAgrNo ? <span className={style.listValue} onClick={() => { this.selectBankCard(resaveBankCardAgrNo, 'resave') }}>
                    {resaveBankCardName}({resaveBankCardLastNo})
                  <Icon type="right" className={style.icon} />
                  </span> : <span className={style.greyText} onClick={() => { this.bindBankCard('resave') }}>绑定储蓄卡 <i className={style.addIcon}>+</i></span>
                }
              </li>
              <li className={style.listItem}>
                <label>还款银行卡</label>
                {
                  payBankCardAgrNo ? <span className={style.listValue} onClick={() => { this.selectBankCard(payBankCardAgrNo, 'pay') }}>
                    {payBankCardName}({payBankCardLastNo})
                  <Icon type="right" className={style.icon} />
                  </span> : <span className={style.greyText} onClick={() => { this.bindBankCard('pay') }}>绑定储蓄卡 <i className={style.addIcon}>+</i></span>
                }
              </li>
            </ul>
            {
              loanMoney && loanDate && contractList.length > 0 && <p className={style.protocolLink}>
                点击“签约借款”，表示同意 {
                  contractList.map((item, idx) => <em onClick={() => { this.readContract(item) }} key={idx}>《{item.contractMdlName}》</em>)
                }
              </p>
            }
          </div>
        </div>
        <div className={style.buttonWrap}>
          <SXFButton onClick={this.loanApplySubmit} className={this.validateFn() ? style.submitBtn : style.submitBtnDisabled}>签约借款</SXFButton>
        </div>
        <Modal
          popup
          className="purpose_modal"
          visible={usageModal}
          animationType="slide-up"
          transparent
          onClose={() => { this.closeModal('usage') }}
        >
          <h3 className={style.modalTitle}>借款用途</h3>
          <p className={style.modalDesc}>借款资金不得用于购买房产、证券投资等投机经营及其他违法交易</p>
          <ul>
            {
              usageList.map(item => (
                <li className={style.modalItem} key={item.value} onClick={() => {
                  this.selectLoanUsage(item)
                }}>{item.loanUsage}</li>
              ))
            }
          </ul>
        </Modal>

        <Modal
          visible={tipModal}
          className="fenqi_tip_modal"
          transparent
        >
          <p className={style.tipInfo}>抱歉！还到plus额度无法使用，仍可申请还到基础版。</p>
          <div className={style.tipButton} onClick={() => { this.props.history.push('/home/home') }}>申请还到基础版</div>
          <Icon type="cross" className={style.tipCloseIcon} color='#333' onClick={() => { this.closeModal('tip') }} />
        </Modal>

        <Modal visible={planModal} transparent onClose={() => { this.closeModal('plan') }}>
          <div className={style.modal_content}>
            <Icon type="cross" className={style.modal_close_btn} onClick={() => { this.closeModal('plan') }} color='#333' />
            <h2 className={style.modal_title}>还款计划</h2>
            <ul className={style.bill_list}>
              {repayPlanInfo.perd.map((item) => (
                <li className={style.list_item} key={item.perdNum}>
                  <label className={style.item_name}>{`${item.perdNum}/${repayPlanInfo.perdCnt}期`}</label>
                  <span className={style.item_value}>{item.perdTotAmt}</span>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      </div>
    )
  }
}