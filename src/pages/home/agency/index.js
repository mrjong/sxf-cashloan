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
import iconArrowRight from 'assets/images/home/icon_arrow_right_default@3x.png';
let timer
let timerOut
const API = {
  REPAY_INFO: '/bill/prebill', // 0208-代还确认页面
  CONFIRM_REPAYMENT: '/bill/agentRepay', // 0109-代还申请接口
  SAVE_REPAY_CARD: '/bill/saveRepayCard', // 0210-代还的银行卡信息校验缓存
  FINACIAL_SERVIE_PROTOCOL: '/bill/qryContractInfoExtend', // 金融服务协议
};

const tipText =
  '若您在使用"还到"过程中出现逾期，信息将被披露到中国互联网金融协会"信用信息共享平台"。这将对您的个人征信产生不利影响。请按时还款，避免出现逾期。';

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
      visibleLoading: false
    };
  }

  componentWillMount() {
    this.requestSendInfoForProtocol();
    // 获取参数
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
  componentWillUnmount(){
      if(timer){
          clearInterval(timer)
      }
      if(timerOut){
          clearTimeout(timerOut)
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

  handleButtonClick = () => {
    this.requestConfirmRepaymentInfo();
  };

  // 清除上个页面中的弹框数据
  clearModalPageData = () => {
    store.setRepaymentModalData(null);
  };
  
  // 设置百分比
  setPercent=(percent)=>{
    if(this.state.percent<90&&this.state.percent>=0){
        console.log(Math.random()*10+1)
        this.setState({
            percent:this.state.percent + parseInt(Math.random()*10+1)
        })
}else{
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
        this.buriedDucationPoint(result.data.perdUnit, result.data.perdLth);
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 埋点方法-根据代还期限埋不同的点
  buriedDucationPoint(type, duration) {
    if (type === 'M') {
      buriedPointEvent(home[`durationMonth${duration}`]);
    } else if (type === 'D') {
      buriedPointEvent(home[`durationDay${duration}`]);
    }
  }

  // 确认代还信息
  requestConfirmRepaymentInfo = () => {
    const modalData = store.getRepaymentModalData();
    const homeCardIndexData = store.getHomeCardIndexData();
    const { lendersDate, repayInfo, repaymentDate } = modalData;
    const params = {
      withDrawAgrNo: repayInfo.withDrawAgrNo, // 代还信用卡主键
      withHoldAgrNo: repayInfo.withHoldAgrNo, // 还款卡号主键
      prdId: repaymentDate.value, // 产品ID
      autId: homeCardIndexData.autId, // 信用卡账单ID
      repayType: lendersDate.value, // 还款方式
      usrBusCnl: '', // 操作渠道
      osType: getDeviceType(), // 操作系统
    };
    timerOut = setTimeout(()=>{
    this.setState({
        percent: 0,
        visibleLoading: true
    },()=>{
        timer = setInterval(()=>{
            this.setPercent()
            ++this.state.time 
        },1000)
    })
},300)
    this.props.$fetch.post(API.CONFIRM_REPAYMENT, params,{
        timeout:100000,
        hideLoading: true
    }).then(result => {
        this.setState({
            percent: 100
        },()=>{
            clearInterval(timer)
            clearTimeout(timerOut)
            this.setState({
                visibleLoading: false
            })
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
              }else if(result && result.msgCode === 'PTM7001'){
                Toast.info(result.msgInfo);
                  setTimeout(()=>{
                    this.props.history.push('/home/home')
                  },3000)
              } else {
                buriedPointEvent(home.borrowingSubmit, {
                  is_success: false,
                  fail_cause: result.msgInfo,
                });
                Toast.info(result.msgInfo);
              }
        })
    }).catch(err=>{
        console.log(err)
        clearInterval(timer)
        clearTimeout(timerOut)
        this.setState({
            percent: 100
        },()=>{
            this.setState({
                visibleLoading: false
            })
        })
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

  jumpToHome = () => {
    this.props.history.replace('/home/home');
  };

  render() {
    const { isShowModal, repayInfo, isShowTipModal, visibleLoading,percent } = this.state;
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
