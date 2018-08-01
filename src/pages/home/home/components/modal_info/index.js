import { store, getDeviceType } from 'utils/common';
import icon_arrow_right_default from 'assets/images/home/icon_arrow_right_default@2x.png';

import React, { Component } from 'react';
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

const storeCardData = store.getCardData();

@fetch.inject()
export default class ModalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repayInfo: {},
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
    indexData: PropTypes.object,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    children: '',
    history: {},
    indexData: {},
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
  }

  // 数据回显
  recoveryPageData = () => {
    let pageData = store.getRepaymentModalData();
    this.setState({ ...pageData });
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
    const { repayInfo } = this.state;
    store.setRepaymentModalData(this.state);
    store.setBackUrl('/home/home');
    this.props.history.push({
      pathname: '/mine/select_save_page',
      search: `?agrNo=${storeCardData && storeCardData.agrNo ? storeCardData.agrNo : repayInfo.withHoldAgrNo}`,
    });
  };

  // 确认按钮点击事件
  handleClickConfirm = () => {
    const { lendersDate, repayInfo, repaymentDate } = this.state;
    const { indexData } = this.props;
    const search = `?prdId=${repaymentDate.value}&cardId=${indexData.autId}&wtdwTyp=${lendersDate.value}&billPrcpAmt=${repayInfo.cardBillAmt}`;
    // 跳转确认代还页面之前 将当前弹框数据保存下来
    store.setRepaymentModalData(this.state);
    // 跳转确认代还页面之前 将当前信用卡信息保存下来
    store.setHomeCardIndexData(indexData);
    this.props.history.push({ pathname: '/home/agency', search });
  };

  // 获取代还期限列表 还款日期列表
  requestGetRepaymentDateList = () => {
    this.props.$fetch.get(`${API.QUERY_REPAY_INFO}/${this.props.indexData.autId}`).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        this.setState({
          repayInfo: result.data,
          repaymentDateList: result.data.prdList.map(item => ({ name: item.prdName, value: item.prdId })),
        });
      }
    });
  };

  render() {
    const { repayInfo, repaymentDateList, repaymentIndex, lendersDateList, lendersIndex } = this.state;
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
            <div className={style.item_info_special}>
              <label className={style.item_name}>代还期限</label>
              <TabList
                tagList={repaymentDateList}
                defaultindex={repaymentIndex}
                onClick={this.handleRepaymentTagClick}
              />
            </div>
            <p className={style.item_tip} style={{ marginTop: '0' }}>我们根据您信用卡账单情况为您推荐最佳代还金额和代还期限</p>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>放款日期</label>
              <TabList tagList={lendersDateList} defaultindex={lendersIndex} onClick={this.handleLendersTagClick} />
            </div>
            <p className={style.item_tip}>选择还款日前一天（{repayInfo.cardBillDt}）放款，将最大成本节约您代资金</p>
          </li>
          <li className={style.list_item} onClick={this.handleClickChoiseBank}>
            <div className={style.item_info}>
              <label className={style.item_name}>还款银行卡</label>
              <span className={[style.item_value, style.item_value_bank].join(' ')}>
                {storeCardData && storeCardData.bankName ? storeCardData.bankName : repayInfo.bankName}
                ({storeCardData && storeCardData.lastCardNo ? storeCardData.lastCardNo : repayInfo.cardNoHid})
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
