import iconArrowRight from 'assets/images/home/icon_arrow_right_default@3x.png';
import React, { PureComponent } from 'react';
import { Modal, Toast, Progress } from 'antd-mobile';
import { store } from 'utils/store';
import { getDeviceType } from 'utils/common';
import { buriedPointEvent } from 'utils/Analytins';
import { home } from 'utils/AnalytinsType';
import fetch from 'sx-fetch';
import ZButton from 'components/button/index.js';
import Panel from 'components/panel/index.js';
import iconClose from 'assets/images/confirm_agency/icon_close.png';
import qs from 'qs';
import style from './style.scss';
let timer;
let timerOut;
const API = {
  REPAY_INFO: '/bill/prebill', // 0208-代还确认页面
  CONFIRM_REPAYMENT: '/bill/agentRepay', // 0109-代还申请接口
  SAVE_REPAY_CARD: '/bill/saveRepayCard', // 0210-代还的银行卡信息校验缓存
  FINACIAL_SERVIE_PROTOCOL: '/bill/qryContractInfoExtend', // 金融服务协议
  CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
  COUPON_COUNT: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
};

@fetch.inject()
export default class ConfirmAgencyPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowTipModal: false,
      isShowModal: false,
      repayInfo: {
        perd: [],
      },
      visibleLoading: false,
      couponInfo: {}, // 优惠劵信息
      // showItrtAmt: false, // 优惠劵金额小于利息金额 true为大于
      // ItrtAmt: 0, // 首/末期利息金额
      deratePrice: '', // 后台计算的优惠劵减免金额
    };
  }

  componentWillMount() {
    this.requestSendInfoForProtocol();
    // 获取参数
    // eslint-disable-next-line
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    this.setState(
      {
        queryData,
      },
      () => {
        this.requestGetRepayInfo();
      },
    );
  }
  componentWillUnmount() {
    if (timer) {
      clearInterval(timer);
    }
    if (timerOut) {
      clearTimeout(timerOut);
    }
  }

  handleShowTipModal = () => {
    this.setState({
      isShowTipModal: true,
    });
  };

  handleCloseTipModal = () => {
    this.setState({
      isShowTipModal: false,
    });
    this.jumpToHome();
  };

  handleShowModal = () => {
    this.setState({
      isShowModal: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      isShowModal: false,
    });
  };

  // 清除上个页面中的弹框数据
  clearModalPageData = () => {
    store.setRepaymentModalData(null);
  };

  // 设置百分比
  setPercent = (percent) => {
    if (this.state.percent < 90 && this.state.percent >= 0) {
      console.log(Math.random() * 10 + 1)
      this.setState({
        percent: this.state.percent + parseInt(Math.random() * 10 + 1)
      })
    } else {
      clearInterval(timer)
    }
  }

  // 给后台缓存协议接口
  requestSendInfoForProtocol = () => {
    const modalData = store.getRepaymentModalData();
    const { repayInfo } = modalData;
    const params = {
      withDrawAgrNo: repayInfo.withDrawAgrNo, // 代还信用卡主键
      withHoldAgrNo: repayInfo.withHoldAgrNo, // 还款卡号主键
    };
    this.props.$fetch.post(API.SAVE_REPAY_CARD, params).then(result => {
      if (result && result.msgCode === 'PTM0000') {
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 获取确认代还信息
  requestGetRepayInfo = () => {
    this.props.$fetch.post(API.REPAY_INFO, this.state.queryData).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        this.setState({
          repayInfo: result.data,
        });
        if (result.data.data && result.data.data.usrCoupNo) {
          this.dealMoney(result.data);
        }
        this.buriedDucationPoint(result.data.perdUnit, result.data.perdLth);
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 处理优惠券金额显示
  dealMoney = (result) => {
    const { queryData, repayInfo } = this.state;
    let couponInfo = store.getCouponData();
    store.removeCouponData();
    let params = {};
    // 如果没有coupId直接不调用接口
    if (couponInfo && (couponInfo.usrCoupNo === 'null' || !couponInfo.coupVal)) {
      // 不使用优惠劵的情况
      this.setState({
        couponInfo,
      });
      return;
    }
    if (couponInfo && couponInfo !== {}) {
      params = {
        prodId: queryData.prdId,
        couponId: couponInfo.usrCoupNo, // 优惠劵id
        type: '00', // 00为借款 01为还款
        price: repayInfo.billPrcpAmt,
      };
    } else {
      params = {
        prodId: queryData.prdId,
        couponId: result.data.usrCoupNo, // 优惠劵id
        type: '00', // 00为借款 01为还款
        price: repayInfo.billPrcpAmt,
      };
    }
    this.props.$fetch.get(API.COUPON_COUNT, params).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        this.setState({
          couponInfo,
          deratePrice: result.data.deratePrice,
        });
      } else {
        Toast.info(result.msgInfo);
      }
    });
    // let couponInfo = store.getCouponData();
    // this.setState({
    //   couponInfo: couponInfo,
    // }, () => {
    //   store.removeCouponData();
    // });
    // // 首期利息
    // const firstItrt = result.data.perd[0].perdItrtAmt;
    // // 末期利息
    // const lastItrt = result.data.perd[result.data.perd.length - 1].perdItrtAmt;
    // if (result.data.data.useStagTyp === '01') {
    //   this.setState({
    //     ItrtAmt: firstItrt,
    //   })
    //   this.compareMoney(couponInfo, firstItrt, result)
    // } else if (result.data.data.useStagTyp === '00') {
    //   this.setState({
    //     ItrtAmt: lastItrt,
    //   })
    //   this.compareMoney(couponInfo, lastItrt, result)
    // }
  }

  // 比较利息与优惠劵大小
  // compareMoney = (couponInfo, itrt, result) => {
  //   if (couponInfo && couponInfo !== {}) {
  //     if (couponInfo.coupVal && parseFloat(couponInfo.coupVal) > parseFloat(itrt)) {
  //       this.setState({ showItrtAmt: true });
  //     } else {
  //       this.setState({ showItrtAmt: false });
  //     }
  //   } else if (result.data.data && result.data.data.coupVal) {
  //     // 优惠劵最大不超过每期利息
  //     if (parseFloat(result.data.data.coupVal) > parseFloat(itrt)) {
  //       this.setState({ showItrtAmt: true });
  //     } else {
  //       this.setState({ showItrtAmt: false });
  //     }
  //   }
  // }

  // 埋点方法-根据代还期限埋不同的点
  buriedDucationPoint(type, duration) {
    if (type === 'M') {
      buriedPointEvent(home[`durationMonth${duration}`]);
    } else if (type === 'D') {
      buriedPointEvent(home[`durationDay${duration}`]);
    }
  }

  handleButtonClick = () => {
    this.requestBindCardState();
  };

  // 请求用户绑卡状态
  requestBindCardState = () => {
    this.props.$fetch.get(API.CHECK_CARD).then(result => {
      if (result && result.msgCode === 'PTM0000') {
        // 有风控且绑信用卡储蓄卡
        this.requestConfirmRepaymentInfo();
      } else if (result && result.msgCode === 'PTM2003') {
        // 有风控没绑储蓄卡 跳绑储蓄卡页面
        store.setBackUrl('/home/agency');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
        }, 3000);
      } else if (result && result.msgCode === 'PTM2002') {
        // 有风控没绑信用卡 跳绑信用卡页面
        store.setBackUrl('/home/agency');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
        }, 3000);
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 确认代还信息
  requestConfirmRepaymentInfo = () => {
    const modalData = store.getRepaymentModalData();
    const homeCardIndexData = store.getHomeCardIndexData();
    const { lendersDate, repayInfo, repaymentDate } = modalData;
    let couponId = '';
    if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
      if (this.state.couponInfo.usrCoupNo !== 'null') {
        couponId = this.state.couponInfo.usrCoupNo;
      } else {
        couponId = '';
      }

    } else {
      if (this.state.repayInfo.data && this.state.repayInfo.data.coupVal) {
        couponId = this.state.repayInfo.data.usrCoupNo
      }
    }
    const params = {
      withDrawAgrNo: repayInfo.withDrawAgrNo, // 代还信用卡主键
      withHoldAgrNo: repayInfo.withHoldAgrNo, // 还款卡号主键
      prdId: repaymentDate.value, // 产品ID
      autId: homeCardIndexData.autId, // 信用卡账单ID
      repayType: lendersDate.value, // 还款方式
      usrBusCnl: '', // 操作渠道
      coupId: couponId, // 优惠劵id
      price: this.state.repayInfo.billPrcpAmt, // 签约金额
      osType: getDeviceType(), // 操作系统
    };
    timerOut = setTimeout(() => {
      this.setState(
        {
          percent: 0,
          visibleLoading: true,
        },
        () => {
          timer = setInterval(() => {
            this.setPercent();
            ++this.state.time;
          }, 1000);
        },
      );
    }, 300);
    this.props.$fetch.post(API.CONFIRM_REPAYMENT, params, {
        timeout: 100000,
        hideLoading: true,
      })
      .then(result => {
        this.setState(
          {
            percent: 100,
          },
          () => {
            clearInterval(timer);
            clearTimeout(timerOut);
            this.setState({
              visibleLoading: false,
            });
            if (result && result.msgCode === 'PTM0000') {
              this.handleShowTipModal();
              buriedPointEvent(home.borrowingSubmit, {
                is_success: true,
              });
              // 清除卡信息
              store.removeCardData();
              // 清除上个页面中的弹框数据
              store.removeRepaymentModalData();
              store.removeHomeCardIndexData();
            } else if (result && result.msgCode === 'PTM7001') {
              Toast.info(result.msgInfo);
              setTimeout(() => {
                this.props.history.push('/home/home');
              }, 3000);
            } else {
              buriedPointEvent(home.borrowingSubmit, {
                is_success: false,
                fail_cause: result.msgInfo,
              });
              Toast.info(result.msgInfo);
            }
          },
        );
      })
      .catch(err => {
        console.log(err);
        clearInterval(timer);
        clearTimeout(timerOut);
        this.setState(
          {
            percent: 100,
          },
          () => {
            this.setState({
              visibleLoading: false,
            });
          },
        );
      });
  };
  // 查看合同
  read = type => {
    switch (type) {
      // 借款合同
      case 'loan_contract_page':
        this.requestProtocolData();
        break;
      case 'delegation_withhold_page':
        this.requestFinacialService('withhold');
        break;
      case 'financial_service_page':
        this.requestFinacialService('financial');
        break;
      default:
        break;
    }
  };

  // 获取活动
  requestProtocolData = () => {
    this.props.$fetch
      .post('/bill/qryContractInfo', {
        prdId: this.state.queryData.prdId,
        wtdwTyp: this.state.queryData.wtdwTyp,
        billPrcpAmt: this.state.queryData.billPrcpAmt,
      })
      .then(result => {
        if (result && result.msgCode === 'PTM0000') {
          store.setProtocolFinancialData(result);
          this.props.history.push('/protocol/loan_contract_page');
        } else {
          this.props.toast.info(result.msgInfo);
        }
      });
  };

  // 获取金融服务合同请求
  requestFinacialService = type => {
    const params = {
      prdId: this.state.queryData.prdId,
      wtdwTyp: this.state.queryData.wtdwTyp,
      billPrcpAmt: this.state.queryData.billPrcpAmt,
    };
    this.props.$fetch.post(API.FINACIAL_SERVIE_PROTOCOL, params).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        store.setProtocolFinancialData(result.data);
        if (type === 'financial') {
          this.props.history.push('/protocol/financial_service_page');
        } else {
          this.props.history.push('/protocol/delegation_withhold_page');
        }
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  // 选择优惠劵
  selectCoupon = (useFlag) => {
      console.log('1111111111111',useFlag)
    if (useFlag) {
      this.props.history.push({ pathname: '/mine/coupon_page', search: `?price=${this.state.repayInfo.billPrcpAmt}&perCont=${this.state.repayInfo.perdUnit === 'M' ? this.state.repayInfo.perdLth : 1}`, state: { nouseCoupon: true } });
      return;
    }
    if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
      store.setCouponData(this.state.couponInfo);
    } else {
      store.setCouponData(this.state.repayInfo.data);
    }
    this.props.history.push({ pathname: '/mine/coupon_page', search: `?price=${this.state.repayInfo.billPrcpAmt}&perCont=${this.state.repayInfo.perdUnit === 'M' ? this.state.repayInfo.perdLth : 1}` });
  }

  jumpToHome = () => {
    this.props.history.replace('/home/home');
  };

  // 渲染优惠劵
  renderCoupon = () => {
    const { deratePrice } = this.state;
    if (deratePrice) {
      return (<span>-{deratePrice}元</span>)
    } else {
      return (<span>不使用</span>)
    }
    
    // if (couponInfo && couponInfo.usrCoupNo) {
    //   if (couponInfo.usrCoupNo !== 'null' && couponInfo.coupVal) {
    //     // 抵扣金额
    //     const discountMoney = showItrtAmt ? ItrtAmt : couponInfo.coupVal;
    //     if (couponInfo.useStagTyp === '01') {
    //       return (<span>{couponInfo.coupVal}元 / 抵扣首期利息{discountMoney}元</span>)
    //     } else if (couponInfo.useStagTyp === '00') {
    //       return (<span>{couponInfo.coupVal}元 / 抵扣末期利息{discountMoney}元</span>)
    //     }
    //   } else {
    //     return (<span>不使用</span>)
    //   }

    // } else {
    //   // 抵扣金额
    //   const resDiscountMoney = showItrtAmt ? ItrtAmt : repayInfo.data.coupVal;
    //   if (repayInfo.data && repayInfo.data.coupVal) {
    //     if (repayInfo.data.useStagTyp === '01') {
    //       return (<span>{repayInfo.data.coupVal}元 / 抵扣首期利息{resDiscountMoney}元</span>)
    //     } else if (repayInfo.data.useStagTyp === '00') {
    //       return (<span>{repayInfo.data.coupVal}元 / 抵扣末期利息{resDiscountMoney}元</span>)
    //     }
    //   }
    // }
  }

  render() {
    const { isShowModal, repayInfo, isShowTipModal, visibleLoading, percent } = this.state;
    return (
      <div className={style.confirm_agency_page}>
        <Panel title="代还签约信息">
          <ul className={style.panel_conten}>
            <li className={style.list_item}>
              <label className={style.item_name}>签约金额(元)</label>
              <span className={style.item_value}>{repayInfo.billPrcpAmt}</span>
            </li>
            {repayInfo.perdUnit === 'D' ? (
              <li className={style.list_item}>
                <label className={style.item_name}>应还金额(元)</label>
                <span className={style.item_value}>{repayInfo.perdTotAmt}</span>
              </li>
            ) : (
              <li className={style.list_item} onClick={this.handleShowModal}>
                <label className={style.item_name}>还款计划</label>
                <span style={{ color: '#4DA6FF' }} className={style.item_value}>
                  <span style={{ color: '#aaa', marginRight: '.1rem', display: 'inline-block', fontWeight: 'normal' }}>点击查看</span>
                  <img className={style.list_item_arrow} src={iconArrowRight} alt="立即查看" />
                </span>
              </li>
            )}
            <li className={style.list_item}>
              <label className={style.item_name}>借款期限</label>
              <span className={style.item_value}>
                {repayInfo.perdLth} {repayInfo.perdUnit === 'M' ? '个月' : '天'}
              </span>
            </li>
            <li className={style.list_item}>
              <label className={style.item_name}>放款日期</label>
              <span className={style.item_value}>{repayInfo.loanDt}</span>
            </li>
            <li className={style.list_item}>
              <label className={style.item_name}>优惠劵</label>
              {
                repayInfo.data && repayInfo.data.coupVal ?
                  <span onClick={() => { this.selectCoupon(false) }} className={style.item_value}>
                    {
                      this.renderCoupon()
                    }
                    <img style={{ marginLeft: '.1rem', }} className={style.list_item_arrow} src={iconArrowRight} />
                  </span>
                  :
                  <span onClick={() => { this.selectCoupon(true) }} className={style.item_value}>
                    无可用优惠券
                    <img style={{ marginLeft: '.1rem', }} className={style.list_item_arrow} src={iconArrowRight} />
                  </span>
              }
            </li>
          </ul>
        </Panel>
        <ZButton onClick={this.handleButtonClick} className={style.confirm_btn}>
          确定
        </ZButton>
        <p className={style.tip_bottom}>
          点击“确认借款”，表示同意
          <a
            onClick={() => {
              this.read('loan_contract_page');
            }}
            className={style.protocol_link}
          >
            《借款合同》
          </a>
          <a
            onClick={() => {
              this.read('delegation_withhold_page');
            }}
            className={style.protocol_link}
          >
            《委托扣款协议》
          </a>
          <a
            onClick={() => {
              this.read('financial_service_page');
            }}
            className={style.protocol_link}
          >
            《金融服务协议》
          </a>
        </p>
        <Modal
          wrapClassName={style.modalLoading}
          visible={visibleLoading}
          transparent
          maskClosable={false}
        //   onClose={this.onClose('modal1')}

        //   footer={[{ text: 'Ok', onPress: () => { console.log('ok'); this.onClose('modal1')(); } }]}
        //   wrapProps={{ onTouchStart: this.onWrapTouchStart }}
        >
          <div className="show-info">
            <div className={style.modalLoading}>
              借款处理中...
        </div>
            <div className="progress"><Progress percent={percent} position="normal" /></div>
            {/* <div aria-hidden="true">{percent}</div> */}
          </div>
        </Modal>
        <Modal
          wrapClassName={style.modal_tip_warp}
          visible={isShowTipModal}
          transparent
          onClose={this.handleCloseTipModal}
          footer={[{ text: '我知道了', onPress: this.handleCloseTipModal }]}
        >
          <div className={style.modal_tip_content}>
            <h3 className={style.modl_tip_title}>"还到"已接入央行平台，逾期将影响您的个人信用！</h3>
            <p className={style.modl_tip_text}>
              若您在使用"还到"过程中出现逾期，信息将被披露到中国互联网金融协会"信用信息共享平台"。
              这将对您的个人征信产生不利影响。请按时还款，避免出现逾期。
            </p>
          </div>
        </Modal>

        <Modal visible={isShowModal} transparent onClose={this.handleCloseModal}>
          <div className={style.modal_content}>
            <img className={style.modal_close_btn} onClick={this.handleCloseModal} src={iconClose} alt="" />
            <h2 className={style.modal_title}>还款计划</h2>
            <ul className={style.bill_list}>
              {repayInfo.perd.map(item => (
                <li className={style.list_item} key={item.perdNum}>
                  <label className={style.item_name}>{`${item.perdNum}/${repayInfo.perdCnt}期`}</label>
                  <span className={style.item_value}>{item.perdTotAmt}</span>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      </div>
    );
  }
}
