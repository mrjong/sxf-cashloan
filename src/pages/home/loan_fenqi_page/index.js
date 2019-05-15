import React, { PureComponent } from 'react';
import { Modal, InputItem, Icon } from 'antd-mobile';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { isMPOS } from 'utils/common';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background'
import { createForm } from 'rc-form';
import { getFirstError, handleClickConfirm, handleInputBlur } from 'utils';
import SXFButton from 'components/ButtonCustom';

// import TabList from './components/TagList';
import style from './index.scss';
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: (e) => e.preventDefault()
  };
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

@fetch.inject()
@createForm()
@setBackGround('#fff')
export default class loan_fenqi_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      purposeModal: false,
      tipModal: true,
      hasPlan: false,
      cardData: false
    }
  }

  selectPurpose = (item) => {
    this.setState({
      purposeModal: false,
      purpose: item.label
    })
  }

  openPurposeModal = () => {
    this.setState({
      purposeModal: true
    })
  }

  closeTipModal = () => {
    this.setState({
      tipModal: false
    })
  }

  render() {
    const { getFieldProps } = this.props.form;
    const { purposeModal, purpose, tipModal, hasPlan, cardData } = this.state
    return (
      <div className={style.fenqi_page}>
        <div className={style.inputWrap}>
          <div className={[style.billInpBox, 'money_input'].join(' ')}>
            <i className={style.moneyUnit}>¥</i>
            <InputItem
              className={style.billInput}
              placeholder="可借金额3000～50000"
              disabled={
                false
              }
              type="number"
              ref={(el) => (this.inputRef = el)}
              {...getFieldProps('cardBillAmt', {
                rules: [
                  { required: true, message: '请输入代偿金额' }
                  // { validator: this.verifyBillAmt }
                ]
              })}
              onBlur={(v) => {
                // handleInputBlur();
                // this.calcLoanMoney(v);
              }}
              onFocus={(v) => {
                // this.updateBillInf();
              }}
              moneykeyboardwrapprops={moneyKeyboardWrapProps}
            />
          </div>
          <p className={style.inputTip}>建议全部借出，借款后剩余额度将不可用</p>
        </div>

        <div className={style.pannel}>
          <ul>
            <li className={style.listItem}>
              <label>借多久</label>
              <span>
              </span>
            </li>
            <li className={style.listItem}>
              <label>借款用途</label>
              <span onClick={this.openPurposeModal} className={style.listValue}>
                {purpose}
                <Icon type="right" className={style.icon} />
              </span>
            </li>
            <li className={style.listItem}>
              <label>还款计划</label>
              <span>
                {
                  hasPlan ? <span className={style.listValue}>
                    点击查看
                <Icon type="right" className={style.icon} />
                  </span> : <span className={style.greyText}>暂无</span>
                }
              </span>

            </li>
            <li className={style.listItem}>
              <label>优惠券</label>
              <span className={style.listValue}>
                <Icon type="right" className={style.icon} />

              </span>
            </li>
            <li className={style.listItem}>
              <label>收款银行卡</label>
              <span>
                <Icon type="right" className={style.icon} />


              </span>
            </li>
            <li className={style.listItem}>
              <label>还款银行卡</label>
              <span>
                {
                  cardData? <span className={style.listValue}>
                  <Icon type="right" className={style.icon} />
  
                </span>: <span className={style.greyText}>绑定储蓄卡 <i className={style.addIcon}>+</i></span>
                }
              </span>
              
            </li>

          </ul>
          <p className={style.protocolLink}>
            点击“签约借款”，表示同意 <em>《借款协议》《金融服务协议》 《补充协议》《代扣协议》《借款确认书》《个人信息授权书》《担保协议》</em>
          </p>
          <SXFButton onClick={this.handleClickConfirm} className={style.modal_btn}>签约借款</SXFButton>
        </div>

        <Modal
          popup
          className="purpose_modal"
          visible={purposeModal}
          animationType="slide-up"
          maskClosable={true}
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
          maskClosable={false}
        // onClose={this.onClose('modal1')}
        >
          <p className={style.tipInfo}>抱歉！还到plus额度无法使用，仍可申请还到基础版。</p>
          <div className={style.tipButton}>申请还到基础版</div>
          <Icon type="cross" className={style.tipCloseIcon} color='#333' onClick={this.closeTipModal} />
        </Modal>

      </div>
    )
  }
}