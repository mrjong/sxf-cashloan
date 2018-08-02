import React, { PureComponent } from 'react';
import { Modal, Toast } from 'antd-mobile';
import { store, getParamsFromUrl, getDeviceType } from 'utils/common';
import fetch from 'sx-fetch';
import ZButton from 'components/button/index.js';
import Panel from 'components/panel/index.js';
import iconQuestion from 'assets/images/confirm_agency/icon_question.png';
import iconClose from 'assets/images/confirm_agency/icon_close.png';

import style from './style.scss';

const API = {
  REPAY_INFO: '/bill/prebill', // 0208-代还确认页面
  CONFIRM_REPAYMENT: '/bill/agentRepay', // 0109-代还申请接口
};

@fetch.inject()
export default class ConfirmAgencyPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowModal: false,
      repayInfo: {
        perd: [],
      },
    }
  }

  componentWillMount() {
    this.requestGetRepayInfo();
  }

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

  // 获取确认代还信息
  requestGetRepayInfo = () => {
    // this.setState({
    //   repayInfo: {
    //     billPrcpAmt: '805.9',
    //     perdTotAmt: '230',
    //     loanDt: '2018-09-12',
    //     perdCnt: '4',
    //     perd: [
    //       {
    //         perdNum: '1/3',
    //         perdTotAmt: '200',
    //       },
    //       {
    //         perdNum: '2/3',
    //         perdTotAmt: '200',
    //       },
    //       {
    //         perdNum: '3/3',
    //         perdTotAmt: '200',
    //       },
    //     ],
    //   },
    // });
    // const params = {
    //   prdId: '', // 申请产品id
    //   cardId: '', // 信用卡id
    //   wtdwTyp: '', // 提现方式
    //   billPrcpAmt: '', // 账单本金
    // };
    const urlParams = getParamsFromUrl(window.location.search);
    const requestParams = { ...urlParams };
    this.props.$fetch.post(API.REPAY_INFO, requestParams).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        console.log(result, '000');
        this.setState({
          repayInfo: result.data
        });
      }
    });
  };

  // 确认代还信息
  requestConfirmRepaymentInfo = () => {
    const modalData = store.getRepaymentModalData();
    const homeCardIndexData = store.getHomeCardIndexData();
    const storeCardData = store.getCardData();
    const { lendersDate, repayInfo, repaymentDate } = modalData;
    const params = {
      withDrawAgrNo: repayInfo.withDrawAgrNo, // 代还信用卡主键
      withHoldAgrNo: storeCardData && storeCardData.agrNo ? storeCardData.agrNo : repayInfo.withHoldAgrNo, // 还款卡号主键
      prdId: repaymentDate.value, // 产品ID
      autId: homeCardIndexData.autId, // 信用卡账单ID
      repayType: lendersDate.value, // 还款方式
      usrBusCnl: '', // 操作渠道
      osType: getDeviceType(), // 操作系统
    };
    this.props.$fetch.post(API.CONFIRM_REPAYMENT, params).then(result => {
      if (result && result.msgCode === 'PTM0000') {
        // 清除卡信息
        store.removeCardData();
        // 清除上个页面中的弹框数据
        store.removeRepaymentModalData();
        store.removeHomeCardIndexData();
        this.props.history.push('/home/home');
      } else {
        Toast.info(result.msgInfo)
      }
    });
  };

  render() {
    const { isShowModal, repayInfo } = this.state;
    console.log(repayInfo, 'repayInfo')
    return (
      <div className={style.confirm_agency_page}>
        <Panel title="代还签约信息">
          <ul className={style.panel_conten}>
            <li className={style.list_item}>
              <label className={style.item_name}>签约金额(元)</label>
              <span className={style.item_value}>{repayInfo.billPrcpAmt}</span>
            </li>
            <li className={style.list_item}>
              <label className={style.item_name}>
                每期应还金额(元)
                <button className={style.item_action} onClick={this.handleShowModal}>
                  <img className={style.item_action_icon} src={iconQuestion} alt="" />
                </button>
              </label>
              <span className={style.item_value}>{repayInfo.perdTotAmt}</span>
            </li>
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
          <a className={style.protocol_link} href=" ">
            《借款合同》
          </a>
          <a className={style.protocol_link} href=" ">
            《委托扣款协议》
          </a>
        </p>

        <Modal visible={isShowModal} transparent onClose={this.handleCloseModal}>
          <div className={style.modal_content}>
            <img className={style.modal_close_btn} onClick={this.handleCloseModal} src={iconClose} alt="" />
            <h2 className={style.modal_title}>每期应还</h2>
            <ul className={style.bill_list}>
              {repayInfo.perd.map(item => (
                <li className={style.list_item} key={item.perdNum}>
                  <label className={style.item_name}>{item.perdNum}/{repayInfo.perdCnt}期</label>
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
