import React, { PureComponent } from 'react';
import { Modal, InputItem, Icon } from 'antd-mobile';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background'
import { } from 'utils';
import SXFButton from 'components/ButtonCustom';
import style from './index.scss';


const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: (e) => e.preventDefault()
  };
}
const API = {
  prodListInfo: '/cash/prodList', //产品列表基本信息查询
  loanUsage: '/cash/loanUsage',  //借款用途
  couponSupport: '/cash/couponSupport', //最佳优惠券获取
  contractList: '/cash/qryContractList', //合同列表
  repayPlan: '/bill/prebill' //还款计划查询
}
const purposeList = [
  {
    label: '个人日常消费',
    value: 1
  },
  {
    label: '旅游',
    value: 2
  }, {
    label: '租房',
    value: 3
  }, {
    label: '教育',
    value: 4
  }, {
    label: '装修',
    value: 5
  },
]

const tagList = [
  {
    name: '3期',
    value: 3
  },
  {
    name: '6期',
    value: 6
  },
  {
    name: '9期',
    value: 9
  },
  {
    name: '12期',
    value: 12
  }
];

@fetch.inject()
@setBackGround('#fff')
export default class loan_fenqi_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      purposeModal: false,
      planModal: false,
      tipModal: false,
      cardData: false,
      loanDate: '',
      loanMoney: '',
      resaveBankCard: 1,
      payBankCard: 1,
      prodListData: {},
      submitData: {
        loanMoney: '',
        loanDate: '',
        usage: '',
        resaveBankCard: '',
        payBankCard: ''
      }
    }
  }

  componentWillMount() {
    this.setState({
      purpose: purposeList[0].label
    })
    let submitData = store.getCashFenQiSubmitData() // 代提交的借款信息
    let cashFenQiCardArr = store.getCashFenQiCardArr() // 收、还款卡信息
    // Object.assign(submitData, {})
    this.setState({submitData})
  }

  componentDidUpdate(prevProps, prevState) {
    const { loanMoney, loanDate } = this.state
    if (loanMoney !== prevState.loanMoney) {
    }
    if (loanMoney && loanDate) {
      console.log('请求还款计划')
    }

  }

  //查询产品列表基本信息
  queryProdListInfo = () => {
    this.props.$fetch.post(API.prodListInfo, {
      channelType: 'h5'
    }).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          prodListData: res.data
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
        })
      } else {
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  //查询合同列表
  queryContractList = () => {
    this.props.$fetch.post(API.contractList, {
      loanAmount: '',
      periodLth: '',
      periodCount: '',
      periodUnit: '',
      agrNo: ''
    }).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          contractList: res.data
        })
      } else {
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  //查询优惠券
  queryCouponInfo = () => {
    this.props.$fetch.post(API.couponSupport, {
      price: '',
      type: 'LOAN',
      prodType: '11',
      periodCount: ''
    }).then(res => {
      if (res.msgCode === 'PTM0000') {
        this.setState({
          couponInfo: res.data
        })
      } else {
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  //查询还款计划
  queryRepayPlan = () => {
    this.props.$fetch.post(API.repayPlan, {
      billPrcpAmt: "20000",
      cardId: "PRC00609120190514135632947441938",
      prdId: "1284",
      wtdwTyp: "0"
    }).then((res) => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          repayPlanList: res.data.perd
        });
      } else {
        this.props.toast.info(res.msgInfo);
      }
    })
  }

  // 选择优惠劵
  selectCoupon = () => {
    if (!this.state.coupId) return
    this.props.history.push({
      pathname: '/mine/coupon_page',
      search: ``,
      // state: { nouseCoupon: true }
    });
  }
  // 选择银行卡
  selectBankCard = (agrNo, cardType) => {
    const { prodListData } = this.state;
    store.setBackUrl('/home/loan_fenqi');
    this.storeData()
    this.props.history.push({
      pathname: '/mine/select_save_page',
      search: `?agrNo=${agrNo}&cardType=${cardType}`
    });
  };

  //绑定银行卡
  bindBankCard = (cardType) => {
    this.storeData()
    this.props.history.push({
      pathname: '/mine/bind_save_page',
      search: `?cardType=${cardType}`
    });
  }

  storeData = () => {
    let data= {}
    store.setCashFenQiSubmitData(data)
  }

  selectPurpose = (item) => {
    this.setState({
      purpose: item.label
    }, () => {
      this.closeModal('purpose')
    })
  }

  toggleTag = (item) => {
    this.setState({
      loanDate: item.value
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

  //验证信息是否填写完整
  validateFn = () => {
    const { loanMoney, loanDate, resaveBankCard, payBankCard } = this.state
    if (loanMoney && loanDate && resaveBankCard && payBankCard) {
      return true
    }
    return false
  }

  placeholderText = () => {
    // const { fetchBillSucc, activeTag, usrIndexInfo } = this.state;
    return `可借金额3000～50000`;
  };

  handleSubmit = () => {
    if (this.validateFn()) {
      console.log('提交借款')
    }
  }

  render() {
    const {
      purposeModal,
      purpose,
      tipModal,
      cardData,
      loanDate,
      loanMoney,
      planModal,
      prodListData
    } = this.state
    const {
      resaveBankCardAgrNo,
      resaveBankCardLastNo,
      resaveBankCardName,
      payBankCardAgrNo,
      payBankCardLastNo,
      payBankCardName
    } = prodListData
    return (
      <div className={style.fenqi_page}>
        <div className={style.scrollWrap}>
          <div className={style.inputWrap}>
            <div className={style.billInpBox}>
              <i className={style.moneyUnit}>¥</i>
              <InputItem
                className={style.billInput}
                placeholder={this.placeholderText()}
                disabled={false}
                clear={true}
                type="number"
                ref={(el) => (this.inputRef = el)}
                value={loanMoney}
                onChange={(v) => {
                  this.setState({
                    loanMoney: v,
                    loanDate: ''
                  }, () => {

                  })
                }}
                onBlur={(v) => {
                  loanMoney && console.log('请求期限')
                  // handleInputBlur();
                  // this.calcLoanMoney(v);
                }}
                moneykeyboardwrapprops={moneyKeyboardWrapProps}
              />
            </div>
            <p className={style.inputTip}>建议全部借出，借款后剩余额度将不可用</p>
          </div>

          <div className={style.pannel}>
            <ul>
              <li className={style.listItem} style={{ alignItems: 'flex-start' }}>
                <label>借多久</label>
                <span className={style.tagListWrap}>
                  {tagList.map(item => (
                    <span
                      key={item.value}
                      className={[style.tagButton, loanDate === item.value && style.tagButtonActive].join(' ')}
                      onClick={() => {
                        this.toggleTag(item);
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                </span>
              </li>
              <li className={style.listItem}>
                <label>借款用途</label>
                <span onClick={() => { this.openModal('purpose') }} className={style.listValue}>
                  {purpose}
                  <Icon type="right" className={style.icon} />
                </span>
              </li>
              <li className={style.listItem}>
                <label>还款计划</label>
                <span>
                  {
                    loanMoney && loanDate ? <span className={style.listValue} onClick={() => { this.openModal('plan') }}>
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
                    <span className={style.redText}>{this.state.coupId ? `${true ? '-10元' : '请选择'}` : `无可用优惠券`}</span>
                    <Icon type="right" className={style.icon} />
                  </span>
                </li>
              }
              <li className={style.listItem}>
                <label>收款银行卡</label>
                {
                  !cardData ? <span className={style.listValue} onClick={() => { this.selectBankCard(resaveBankCardAgrNo, 'resave') }}>
                    招商银行(1234)
                  <Icon type="right" className={style.icon} />
                  </span> : <span className={style.greyText} onClick={() => { this.bindBankCard('resave') }}>绑定储蓄卡 <i className={style.addIcon}>+</i></span>
                }
              </li>
              <li className={style.listItem}>
                <label>还款银行卡</label>
                {
                  !cardData ? <span className={style.listValue} onClick={() => { this.selectBankCard(payBankCardAgrNo, 'pay') }}>
                    招商银行(1234)
                  <Icon type="right" className={style.icon} />
                  </span> : <span className={style.greyText} onClick={() => { this.bindBankCard('pay') }}>绑定储蓄卡 <i className={style.addIcon}>+</i></span>
                }
              </li>
            </ul>
            <p className={style.protocolLink}>
              点击“签约借款”，表示同意 <em>《借款协议》《金融服务协议》 《补充协议》《代扣协议》《借款确认书》《个人信息授权书》《担保协议》</em>
            </p>
          </div>
        </div>
        <div className={style.buttonWrap}>
          <SXFButton onClick={this.handleSubmit} className={this.validateFn() ? style.submitBtn : style.submitBtnDisabled}>签约借款</SXFButton>
        </div>
        <Modal
          popup
          className="purpose_modal"
          visible={purposeModal}
          animationType="slide-up"
          transparent
          onClose={() => { this.closeModal('purpose') }}
        >
          <h3 className={style.modalTitle}>借款用途</h3>
          <p className={style.modalDesc}>借款资金不得用于购买房产、证券投资等投机经营及其他违法交易</p>
          <ul>
            {
              purposeList.map(item => (
                <li className={style.modalItem} key={item.value} onClick={() => {
                  this.selectPurpose(item)
                }}>{item.label}</li>
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
          <div className={style.tipButton}>申请还到基础版</div>
          <Icon type="cross" className={style.tipCloseIcon} color='#333' onClick={() => { this.closeModal('tip') }} />
        </Modal>

        <Modal visible={planModal} transparent onClose={() => { this.closeModal('plan') }}>
          <div className={style.modal_content}>
            <Icon type="cross" className={style.modal_close_btn} onClick={() => { this.closeModal('plan') }} color='#333' />
            <h2 className={style.modal_title}>还款计划</h2>
            <ul className={style.bill_list}>
              {[{ perdNum: 1, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 2, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 3, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 4, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 5, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 6, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 7, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 7, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 7, perdCnt: 12, perdTotAmt: 1234 }, { perdNum: 7, perdCnt: 12, perdTotAmt: 1234 }].map((item) => (
                <li className={style.list_item} key={item.perdNum}>
                  <label className={style.item_name}>{`${item.perdNum}/${item.perdCnt}期`}</label>
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