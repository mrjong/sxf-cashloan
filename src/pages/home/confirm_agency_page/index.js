import React, { PureComponent } from 'react';
import { Modal, Progress, InputItem } from 'antd-mobile';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { getFirstError } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import icon_arrow_right_default from 'assets/images/home/icon_arrow_right_default@2x.png';
import TabList from './components/TagList';
import style from './index.scss';

const API = {
  QUERY_REPAY_INFO: '/bill/queryRepayInfo', // 0105-确认代还信息查询接口
  CONFIRM_REPAYMENT: '/bill/agentRepay', // 0109-代还申请接口
  CHECK_WITH_HOLD_CARD: '/bill/checkWithHoldCard', // 储蓄卡是否支持代扣校验接口
  CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
  checkApplyProdMemSts: '/bill/checkApplyProdMemSts', // 校验借款产品是否需要会员卡
};

let indexData = null;  // 首页带过来的信息

@fetch.inject()
@createForm()
export default class confirm_agency_page extends PureComponent {
  constructor(props) {
    super(props);
    if (this.props.history.location.state && this.props.history.location.state.indexData) {
      indexData = this.props.history.location.state.indexData
    }
    this.state = {
      cardBillAmt: 0,
      dateDiff: 0,
      repayInfo: {},
      repaymentDate: '',
      repaymentIndex: 0,
      lendersDate: '',
      lendersIndex: 0,
      defaultIndex: 0,
      repaymentDateList: [
        {
          name: '30天'
        },
        {
          name: '3个月'
        },
        {
          name: '6个月'
        },
        {
          name: '12个月'
        }
      ],
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
      isShowTipModal: false,
    };
  }

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
      // cardBillAmt: data.value.cardBillAmt,
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
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          cardBillAmt: values.cardBillAmt,
        }, () => {
          this.requestBindCardState();
        });
      } else {
				this.props.toast.info(getFirstError(err));
			}
    })
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
        this.props.toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
        }, 3000);
      } else if (result && result.msgCode === 'PTM2002') {
        // 有风控没绑信用卡 跳绑信用卡页面
        store.setBackUrl('/home/home');
        this.props.toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
        }, 3000);
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  // 储蓄卡是否支持代扣校验接口
  requestCheckWithHoldCard = () => {
    const { repayInfo } = this.state;
    const agrNo = repayInfo.withHoldAgrNo;
    this.props.$fetch.get(`${API.CHECK_WITH_HOLD_CARD}/${agrNo}`).then(res => {
      if (res && res.msgCode === 'PTM0000') {
        this.checkMemSts();
      } else {
        this.props.toast.info(res.msgInfo);
      }
    });
  };

  // 如果当前还款卡支持代扣 则跳转确认页面
  beforeJump() {
    // 埋点-选择借款要素弹框页-点击确认按钮
    buriedPointEvent(home.borrowingPreSubmit);
    const { lendersDate, repayInfo, repaymentDate, cardBillAmt } = this.state;
    const search = `?prdId=${repaymentDate.value}&cardId=${indexData.autId}&wtdwTyp=${lendersDate.value}&billPrcpAmt=${cardBillAmt}`;
    // 跳转确认代还页面之前 将当前弹框数据保存下来
    store.setRepaymentModalData(this.state);
    // 跳转确认代还页面之前 将当前信用卡信息保存下来
    store.setHomeCardIndexData(indexData);
    this.props.history.push({ pathname: '/home/agency', search });
  }

  // 获取代还期限列表 还款日期列表
  requestGetRepaymentDateList = () => {
    this.props.$fetch.get(`${API.QUERY_REPAY_INFO}/${indexData.autId}`).then(result => {
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
            // cardBillAmt: item.cardBillAmt,
            minAmt: item.minAmt,
            maxAmt: item.maxAmt,
          })),
          dateDiff: diff,
          lendersIndex: !result.data.cardBillDt || diff <= 2 ? 1 : 0,
          defaultIndex: !result.data.cardBillDt || diff <= 2 ? 1 : 0,
          lendersDateList: lendersDateListFormat,
        });
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  // 校验代还金额
  verifyBillAmt = (rule, value, callback) => {
    const { minAvailableCreditAmt, maxAvailableCreditAmt } = this.state;
    if (!(/\d/.test(value) && value % 100 == 0 && minAvailableCreditAmt < 3000 && maxAvailableCreditAmt > parseInt(value))) {
      callback(`可代还金额为3000~${maxAvailableCreditAmt}，且要为100整数倍`);
    } else {
      callback();
    }
  };

  // 关闭弹框
  handleCloseTipModal = () => {
    this.setState({
      isShowTipModal: false,
    })
  }

  // 跳转到会员卡
  goVIP = () => {
    this.handleCloseTipModal();
    this.props.history.push('/mine/membership_card_page');
  }

  // 校验借款产品是否需要会员卡
  checkMemSts = () => {
    const { repaymentDate } = this.state;
    this.props.$fetch.get(`${API.checkApplyProdMemSts}/${repaymentDate.value}`).then(result => {
      if (result && result.msgCode === "PTM3014") {
        this.setState({
          isShowTipModal: true,
        })
      } else if (result && result.msgCode === "PTM0000") {
        this.beforeJump();
      } else {
        this.props.toast.info(result.msgInfo);
      }
    })
  }

  render() {
    const { getFieldProps } = this.props.form;
    const {
      repayInfo,
      repaymentDateList,
      repaymentIndex,
      lendersDateList,
      lendersIndex,
      defaultIndex,
      repaymentDate,
      isShowTipModal,
    } = this.state;

    return (
      <div className={style.confirm_agency_page}>
        <ul className={style.modal_list}>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>代还金额</label>
              <div>
                <div className={style.billInpBox}>
                  <i className={style.moneyUnit}>¥</i>
                  <InputItem
                    className={style.billInput}
                    placeholder=""
                    // maxLength="11"
                    type="number"
                    {...getFieldProps('cardBillAmt', {
                      rules: [{ required: true, message: '请输入代还金额' }, { validator: this.verifyBillAmt }],
                    })}
                  />
                </div>
                <p className={style.billTips}>金额{repaymentDate.minAmt}-{repaymentDate.maxAmt}元，且为100整数倍</p>
              </div>
            </div>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>代还期限</label>
              <div className={style.tagList}>
                <TabList
                  tagList={repaymentDateList}
                  defaultindex={repaymentIndex}
                  onClick={this.handleRepaymentTagClick}
                />
              </div>
            </div>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>放款日期</label>
              <div className={style.tagList}>
                <TabList burientype="lenders" tagType="lenders" tagList={lendersDateList} defaultindex={defaultIndex} activeIndex={lendersIndex} onClick={this.handleLendersTagClick} />
              </div>
            </div>
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
        <div className={style.tipsBox}>
          <p>温馨提示</p>
          <p>代还期限：我们根据您信用卡账单情况为您推荐最佳代还金额。</p>
          <div className={style.dateTips}>
            <p className={style.dateTipsLabel}>放款日期：</p>
            <div>
              <p>a.选择代还信用卡账单还款日前一天{dayjs(repayInfo.cardBillDt).subtract(1, 'day').format('YYYY-MM-DD')}放款，将最大程度节约您的成本。</p>
              <p>b.选择立即放款，代还金额将于当日汇入您的还款账户</p>
            </div>
          </div>
        </div>
        <SXFButton onClick={this.handleClickConfirm} className={style.modal_btn}>
          确定
        </SXFButton>
        <Modal
          wrapClassName="modal_VIPTip_warp"
          visible={isShowTipModal}
          closable
          transparent
          onClose={this.handleCloseTipModal}
          footer={[{ text: '立即开通', onPress: this.goVIP }]}
        >
          <h2 className={style.modalTitle}>仅限VIP使用</h2>
          <ul className={style.modalUl}>
            <li>
              <i className={style.vipIco1} />极速放款通道
            </li>
            <li>
              <i className={style.vipIco2} />精彩活动优先通知
            </li>
            <li>
              <i className={style.vipIco3} />30天明星产品专享
            </li>
            <li>
              <i className={style.vipIco4} />刷卡优惠超值套餐
            </li>
          </ul>
        </Modal>
      </div>
    );
  }
}
