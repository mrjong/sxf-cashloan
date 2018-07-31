import { store, getDeviceType } from 'utils/common';
import icon_arrow_right_default from 'assets/images/home/icon_arrow_right_default@2x.png';

import React, { PureComponent } from 'react';
import { Toast } from 'antd-mobile';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import SButton from 'components/button';
import TabList from '../tag_list';

import style from './style.scss';

const API = {
  QUERY_REPAY_INFO: '/bill/queryRepayInfo', // 0105-确认代还信息查询接口
  CONFIRM_REPAYMENT: '/bill/agentRepay', // 0109-代还申请接口
};

@fetch.inject()
export default class ModalInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      repayInfo: {},
      repaymentAmount: '',
      repaymentDate: '',
      repaymentIndex: 0,
      lendersDate: '',
      lendersIndex: 0,
      repaymentDateList: [],
      lendersDateList: [
        {
          name: '还款日前一天',
          value: '1',
        },
        {
          name: '立即放款',
          value: '0',
          style: {
            width: '2.07rem',
          },
        },
      ],
    };
  }

  static propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    children: '',
    history: {},
    onClose: () => {
      console.log('弹框关闭方法，需要传递进来');
    },
  };

  componentWillMount() {
    const pageData = store.getRepaymentModalData();
    if (pageData) {
      this.recoveryPageData();
    } else {
      this.requestGetRepaymentDateList();
    }
    this.getCardDataFromSession();
  }

  componentWillUnmount() {}

  // 数据回显
  recoveryPageData = () => {
    let pageData = store.getRepaymentModalData();
    this.setState({ ...pageData });
  };

  // 保存当前页面数据
  saveCurrentPageData = () => {
    store.setRepaymentModalData(this.state);
  };

  // 清除当前页面数据
  clearCurrentPageData = () => {
    store.setRepaymentModalData(null);
  };

  // 获取 session 中的银行卡信息
  getCardDataFromSession = () => {
    const cardData = store.getCardData();
    if (cardData) {
      this.setState(
        {
          repaymentCardInfo: cardData,
        },
        store.setCardData(null),
      );
    }
  };

  // 代扣 Tag 点击事件
  handleRepaymentTagClick = data => {
    this.setState({
      repaymentDate: data.value,
      repaymentIndex: data.index,
    });
  };

  // 还款 Tag 点击事件
  handleLendersTagClick = data => {
    this.setState({
      lendersDate: data.value,
      lendersIndex: data.index,
    });
  };

  // 按钮点击事件
  _handleClick = (callback, e) => {
    e && e.preventDefault && e.preventDefault();
    callback && callback();
  };

  // 选择银行卡
  handleClickChoiseBank = () => {
    this.saveCurrentPageData();
    store.setBackUrl('/home/home');
    // todo 通过接口判断跳页面
    // this.props.history.push('/mine/select_credit_page');
  };

  // 确认按钮点击事件
  handleClickConfirm = () => {
    this.requestConfirmRepaymentInfo();
  };

  // 获取代还期限列表 还款日期列表
  requestGetRepaymentDateList = () => {
    const demoData = {
      cardBillAmt: '687.67',
      prdList: [
        {
          prdName: '3个月',
          prdId: '432424',
        },
        {
          prdName: '1个月',
          prdId: '4324224',
        },
        {
          prdName: '7天(会员专属)',
          prdId: '4324225',
        },
      ],
      overDt: '7',
      bankName: '招商银行',
      cardNoHid: '6747 **** **** 6654',
      withHoldAgrNo: '332423534534534534535',
      withDrawAgrNo: '034253534564645645645',
      cardBillDt: '2018-07-17',
    };

    this.setState({
      repayInfo: demoData,
      repaymentDateList: demoData.prdList.map(item => ({ name: item.prdName, value: item.prdId })),
    });
    return;
    this.props.$fetch.post(`${API.QUERY_REPAY_INFO}`).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        this.setState({
          repayInfo: result,
          repaymentDateList: result.prdList.map(item => ({ name: item.prdName, value: item.prdId })),
        });
      }
    });
  };

  // 获取还款日期列表
  requestGetLendersDateList = () => {
    this.props.$fetch.get(API.BANNER).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        console.log(result);
      }
    });
  };

  // 确认代还信息
  requestConfirmRepaymentInfo = () => {
    const { lendersDate } = this.state;
    const params = {
      withDrawAgrNo: '', // 代还信用卡主键
      withHoldAgrNo: '', // 还款卡号主键
      prdId: '', // 产品ID
      autId: '', // 信用卡账单ID
      repayType: lendersDate.value, // 还款方式
      usrBusCnl: '', // 操作渠道
      osType: getDeviceType(), // 操作系统
    };
    this.props.$fetch.post(API.CONFIRM_REPAYMENT, params).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        console.log(result);
        this.clearCurrentPageData();
        this.props.history.push('/home/agency');
      } else {
        Toast.info(result.msgInfo)
      }
    });
  };

  render() {
    const { repayInfo, repaymentAmount, repaymentDateList, repaymentIndex, lendersDateList, lendersIndex } = this.state;
    const { onClose } = this.props;
    return (
      <div className={style.modal_content}>
        <button className={style.modal_cancel_btn} onClick={event => this._handleClick(onClose, event)}>
          取消
        </button>
        <h1 className={style.modal_title}>确认代还信息</h1>
        <ul className={style.modal_list}>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>代还金额</label>
              <span className={style.item_value}>{repayInfo.cardBillAmt}</span>
            </div>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>代还期限</label>
              <TabList
                tagList={repaymentDateList}
                defaultindex={repaymentIndex}
                onClick={this.handleRepaymentTagClick}
              />
            </div>
            <p className={style.item_tip}>我们根据您信用卡账单情况为您推荐最佳代还金额和代还期限</p>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>放款日期</label>
              <TabList tagList={lendersDateList} defaultindex={lendersIndex} onClick={this.handleLendersTagClick} />
            </div>
            <p className={style.item_tip}>选择还款日前一天（2018-7-12日）放款，将最大成本节 约您代资金</p>
          </li>
          <li className={style.list_item} onClick={this.handleClickChoiseBank}>
            <div className={style.item_info}>
              <label className={style.item_name}>还款银行卡</label>
              <span className={[style.item_value, style.item_value_bank].join(' ')}>
                工商银行(2222)
                <img className={style.icon} src={icon_arrow_right_default} alt="" />
              </span>
            </div>
          </li>
        </ul>
        <SButton onClick={this.handleClickConfirm} className={style.modal_btn}>
          确定
        </SButton>
      </div>
    );
  }
}
