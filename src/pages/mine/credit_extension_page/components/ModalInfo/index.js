import { store } from 'utils/store';
// import { Slider } from 'antd-mobile';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import icon_arrow_right_default from 'assets/images/home/icon_arrow_right_default@2x.png';
import React, { Component } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import SXFButton from 'components/ButtonCustom';
import TabList from '../TagList';
import { createForm } from 'rc-form';

const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
      overlayStyle={{zIndex: 1000}}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

import style from './index.scss';

const API = {
  qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
  isBankCard: '/my/chkCard', // 是否绑定信用卡和储蓄卡
  submitState: '/bill/apply', // 提交代还金申请
};

@fetch.inject()
@createForm()
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
      applyAmt: '', // 选择的可申请金额
      minAmt: '', // 可申请金额的最小值
      maxAmt: '', // 可申请金额的最大值
      repaymentAmt: '', // 预计每期约还款
    };
  }

  static propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    autId: PropTypes.string,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    children: '',
    history: {},
    autId: '',
    onClose: () => {

    },
  };

  componentWillMount() {
    this.requestGetRepaymentDateList();
  }

  componentDidMount() {}

  // 代扣 Tag 点击事件
  handleRepaymentTagClick = data => {
    this.setState({
      repaymentDate: data.value,
      repaymentIndex: data.index,
      // cardBillAmt: data.value.cardBillAmt,
    });
  };

  // 处理最大值与最小值
  dealMinMax = (data) => {
    const { repayInfo } = this.state;
    const cardBillAmt = repayInfo && repayInfo.cardBillAmt;
    if (cardBillAmt<=data.factLmtLow) {
      this.setState({
        minAmt: data.factLmtLow, // 可申请金额的最小值
        maxAmt: data.factLmtLow, // 可申请金额的最大值
      })
    }else if (cardBillAmt>data.factLmtLow && cardBillAmt<data.factAmtHigh) {
      this.setState({
        minAmt: data.factLmtLow, // 可申请金额的最小值
        maxAmt: Math.ceil(cardBillAmt/100)*100, // 可申请金额的最大值 账单金额向上取整100元
      })
    } else if (cardBillAmt>=data.factAmtHigh) {
      this.setState({
        minAmt: data.factLmtLow, // 可申请金额的最小值
        maxAmt: data.factAmtHigh, // 可申请金额的最大值
      })
    }
  }

  // 计算预计每期约还款
  calcRepayAmt = (data) => { // “预计每期约还款”：=借款金额*3%+借款金额/期限
    const { applyAmt } = this.state;
    const perdCnt = data && data.perdCnt; // 期限/期数
    const repaymentAmt = Number(applyAmt*3%+applyAmt/perdCnt).toFixed(2); // 保留两位小数
    this.setState({
      repaymentAmt,
    })
  }

  // 按钮点击事件
  _handleClick = (callback, e) => {
    e && e.preventDefault && e.preventDefault();
    callback && callback();
  };

  // 确认按钮点击事件 提交到风控
  handleClickConfirm = () => {
    const { onClose } = this.props;
		const address = store.getPosition();
		const params = {
			location: address
		};
		this.props.$fetch.post(`${API.submitState}`, params).then((res) => {
			// 提交代还申请埋点
			buriedPointEvent(mine.creditExtensionConfirm);
			if (isMPOS) {
				getAppsList();
				getContactsList();
			}
			// 提交风控返回成功
			if (res && res.msgCode === 'PTM0000') {
        onClose();
				this.props.toast.info(res.msgInfo, 3, () => {
					this.checkIsBandCard();
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
  };

  // 判断是否绑卡
	checkIsBandCard = () => {
		this.props.$fetch.get(`${API.isBankCard}`).then((result) => {
			// 跳转至储蓄卡
			if (result && result.msgCode === 'PTM2003') {
				store.setCheckCardRouter('checkCardRouter');
				this.props.toast.info(result.msgInfo);
				store.setBackUrl('/mine/credit_extension_page');
				setTimeout(() => {
					this.props.history.replace({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.msgCode === 'PTM2002') {
				store.setCheckCardRouter('checkCardRouter');
				this.props.toast.info(result.msgInfo);
				store.setBackUrl('/mine/credit_extension_page');
				setTimeout(() => {
					this.props.history.replace({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
				}, 3000);
			} else {
				this.props.history.push('/home/home');
			}
		});
	};

  // 获取代还期限列表 还款日期列表
  requestGetRepaymentDateList = () => {
    // const { autId } = this.props;
    const autId = '582e316701464f5092b3db592ae0666d';
    this.props.$fetch.get(`${API.qryPerdRate}/${autId}`).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        // const diff = dayjs(result.data.cardBillDt).diff(dayjs(), 'day');
        this.setState({
          repayInfo: result.data,
          repaymentDateList: result.data.perdRateList && result.data.perdRateList.length && result.data.perdRateList.map(item => ({
            name: item.perdPageNm,
            value: item.prdId,
            factLmtLow: item.factLmtLow,
            factAmtHigh: item.factAmtHigh,
          })),
          dateDiff: diff,
        });
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  render() {
    const {
      repayInfo,
      repaymentDateList,
      repaymentIndex,
      dateDiff,
      cardBillAmt,
      applyAmt,
      repaymentAmt,
    } = this.state;
    const minAmt = Number(this.state.minAmt);
    const maxAmt = Number(this.state.maxAmt);
    const { onClose } = this.props;

    return (
      <div className={style.modal_content}>
        <button className={style.modal_cancel_btn} onClick={event => this._handleClick(onClose, event)}>
          取消
        </button>
        <h1 className={style.modal_title}>申请金额和期限确认</h1>
        <ul className={style.modal_list}>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>本期信用卡账单</label>
              <span className={style.item_value}>{repayInfo && repayInfo.cardBillAmt}元</span>
            </div>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>可申请金额</label>
              <div className={`${style.item_value} ${style.silderBox}`}>
                <Slider
                  min={minAmt}
                  max={maxAmt}
                  step={100}
                  // disabled
                  onChange={(val)=>{ this.setState({ applyAmt: val})}}
                  onAfterChange={(val)=>{console.log(val,'onAfterChange')}}
                  // marks={{minAmt: minAmt, maxAmt: maxAmt}}
                  handle={handle}
                />
                {/* <i>{3000}</i>
                <i>{applyAmt}</i>
                <i>{5000}</i> */}
                <p className={style.billTips}>金额3000-{100000}元，且为100整数倍</p>
              </div>
              {/* <span className={style.item_value}>{cardBillAmt}</span> */}
            </div>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info_special}>
              <label className={style.item_name}>可申请期限</label>
              <TabList
                tagList={repaymentDateList}
                defaultindex={repaymentIndex}
                onClick={this.handleRepaymentTagClick}
              />
            </div>
            <p className={style.item_tip} style={{ marginTop: '0' }}>（审核通过后，期限不可修改）</p>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>预计每期约还款</label>
              <div className={style.item_value}>
                <span>{repaymentAmt}元</span>
                <p className={style.billTips}> （以最终借款合同为准）</p>
              </div>
            </div>
          </li>
        </ul>
        <SXFButton onClick={this.handleClickConfirm} className={style.modal_btn}>
          确定
        </SXFButton>
      </div>
    );
  }
}
