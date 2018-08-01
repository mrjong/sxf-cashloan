import React, { PureComponent } from 'react';
import { Modal } from 'antd-mobile';
import fetch from 'sx-fetch';
import ZButton from 'components/button/index.js';
import Panel from 'components/panel/index.js';
import iconQuestion from 'assets/images/confirm_agency/icon_question.png';
import iconClose from 'assets/images/confirm_agency/icon_close.png';

import style from './style.scss';

const API = {
  REPAY_INFO: '/bill/prebill', // 0105-确认代还信息查询接口
};

@fetch.inject()
export default class ConfirmAgencyPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowModal: false,
      repayInfo: {},
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
    console.log('点击按钮');
  };

  // 获取确认代还信息
  requestGetRepayInfo = () => {
    this.setState({
      repayInfo: {
        billPrcpAmt: '805.9',
        perdTotAmt: '230',
        loanDt: '2018-09-12',
        perdCnt: '4',
        perd: [
          {
            perdNum: '1/3',
            perdTotAmt: '200',
          },
          {
            perdNum: '2/3',
            perdTotAmt: '200',
          },
          {
            perdNum: '3/3',
            perdTotAmt: '200',
          },
        ],
      },
    });
    const params = {
      prdId: '', // 申请产品id
      cardId: '', // 信用卡id
      wtdwTyp: '', // 提现方式
      billPrcpAmt: '', // 账单本金
    };
    this.props.$fetch.post(API.REPAY_INFO, params).then(result => {
      if (result && result.code === 'PTM0000' && result.data !== null) {
        console.log(result);
        this.setState({
          repayInfo: result.data
        });
      }
    });
  };

  render() {
    const { isShowModal, repayInfo } = this.state;
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
              <span className={style.item_value}>{repayInfo.perdCnt}</span>
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
                  <label className={style.item_name}>{item.perdNum}</label>
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
