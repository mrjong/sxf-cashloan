import { store } from 'utils/store';
import icon_arrow_right_default from 'assets/images/home/icon_arrow_right_default@2x.png';

import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import { buriedPointEvent } from 'utils/Analytins';
import { home } from 'utils/AnalytinsType';
import SButton from 'components/button';
import TabList from '../tag_list';

import style from './style.scss';

const API = {
  QUERY_REPAY_INFO: '/bill/queryRepayInfo', // 0105-确认代还信息查询接口
  CONFIRM_REPAYMENT: '/bill/agentRepay', // 0109-代还申请接口
  CHECK_WITH_HOLD_CARD: '/bill/checkWithHoldCard', // 储蓄卡是否支持代扣校验接口
  CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
};

@fetch.inject()
export default class ModalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardBillAmt: 0,
      dateDiff: 0,
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

  componentDidMount() {}

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
      cardBillAmt: data.value.cardBillAmt,
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
    store.setBackUrl('/home/home?showModal=true');
    this.props.history.push({
      pathname: '/mine/select_save_page',
      search: `?agrNo=${repayInfo.withHoldAgrNo}`,
    });
  };

  // 确认按钮点击事件
  handleClickConfirm = () => {
    this.requestBindCardState();
  };

  // 请求用户绑卡状态
  requestBindCardState = () => {
    this.props.$fetch.get(API.CHECK_CARD).then(result => {
      if (result && result.msgCode === 'PTM0000') {
        // 有风控且绑信用卡储蓄卡
        this.requestCheckWithHoldCard();
      } else if (result && result.msgCode === 'PTM2003') {
        // 有风控没绑储蓄卡 跳绑储蓄卡页面
        store.setBackUrl('/home/home');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          // this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
          this.props.history.push({ pathname: '/mine/bind_save_page',});
        }, 3000);
      } else if (result && result.msgCode === 'PTM2002') {
        // 有风控没绑信用卡 跳绑信用卡页面
        store.setBackUrl('/home/home');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          // this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
          this.props.history.push({ pathname: '/mine/bind_credit_page',});
        }, 3000);
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 储蓄卡是否支持代扣校验接口
  requestCheckWithHoldCard = () => {
    const { repayInfo } = this.state;
    const agrNo = repayInfo.withHoldAgrNo;
    this.props.$fetch.get(`${API.CHECK_WITH_HOLD_CARD}/${agrNo}`).then(res => {
      if (res && res.msgCode === 'PTM0000') {
        this.beforeJump();
      } else {
        Toast.info(res.msgInfo);
      }
    });
  };

  // 如果当前还款卡支持代扣 则跳转确认页面
  beforeJump() {
    // 埋点-选择借款要素弹框页-点击确认按钮
    buriedPointEvent(home.borrowingPreSubmit);
    const { lendersDate, repayInfo, repaymentDate, cardBillAmt } = this.state;
    const { indexData } = this.props;
    const search = `?prdId=${repaymentDate.value}&cardId=${indexData.autId}&wtdwTyp=${lendersDate.value}&billPrcpAmt=${cardBillAmt}`;
    // 跳转确认代还页面之前 将当前弹框数据保存下来
    store.setRepaymentModalData(this.state);
    // 跳转确认代还页面之前 将当前信用卡信息保存下来
    store.setHomeCardIndexData(indexData);
    this.props.history.push({ pathname: '/home/agency', search });
  }

  // 获取代还期限列表 还款日期列表
  requestGetRepaymentDateList = () => {
    this.props.$fetch.get(`${API.QUERY_REPAY_INFO}/${this.props.indexData.autId}`).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        // const diff = dayjs(result.data.cardBillDt).diff(dayjs(), 'day');
        const diff = result.data.overDt;
        let lendersDateListFormat = this.state.lendersDateList;
        if (!result.data.cardBillDt || diff <= 2) {
          lendersDateListFormat[0].disable = true;
        }
        this.setState({
          repayInfo: result.data,
          repaymentDateList: result.data.prdList.map(item => ({
            name: item.prdName,
            value: item.prdId,
            cardBillAmt: item.cardBillAmt,
          })),
          dateDiff: diff,
          lendersIndex: !result.data.cardBillDt || diff <= 2 ? 1 : 0,
          lendersDateList: lendersDateListFormat,
        });
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  render() {
    const {
      repayInfo,
      repaymentDateList,
      repaymentIndex,
      lendersDateList,
      lendersIndex,
      dateDiff,
      cardBillAmt,
    } = this.state;
    const { onClose } = this.props;

    let lendersTip = '';
    if (dateDiff > 2 && lendersIndex === 0) {
      lendersTip = (
        <p className={style.item_tip}>
          选择还款日前一天（{dayjs(repayInfo.cardBillDt)
            .subtract(1, 'day')
            .format('YYYY-MM-DD')}）放款，将最大成本节约您代资金
        </p>
      );
    }

    if (dateDiff <= 2 && lendersIndex === 1) {
      lendersTip = <p className={style.item_tip}>选择立即放款，将最大程度节约您的成本</p>;
    }
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
              <span className={style.item_value}>{cardBillAmt}</span>
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
            {lendersTip}
          </li>
          <li className={style.list_item} onClick={this.handleClickChoiseBank}>
            <div className={style.item_info}>
              <label className={style.item_name}>还款银行卡</label>
              <span className={[style.item_value, style.item_value_bank].join(' ')}>
                {repayInfo.bankName}
                ({repayInfo.cardNoHid})
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
