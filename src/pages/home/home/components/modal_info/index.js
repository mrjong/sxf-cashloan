import { store } from 'utils/common';
import icon_arrow_right_default from 'assets/images/home/icon_arrow_right_default@2x.png';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import SButton from 'components/button';
import TabList from '../tag_list';

import style from './style.scss';

const API = {
  QUERY_REPAY_INFO: '/bill/queryRepayInfo', // 0105-确认代还信息查询接口
};

@fetch.inject()
export default class ModalInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      repaymentAmount: '',
      repaymentDate: '',
      repaymentIndex: 0,
      lendersDate: '',
      lendersIndex: 0,
      repaymentDateList: [
        {
          name: '30天',
          value: '30天',
        },
        {
          name: '3个月',
          value: '3个月',
        },
        {
          name: '7天(会员专属)',
          value: '7天(会员专属)',
        },
      ],
      lendersDateList: [
        {
          name: '还款日前一天',
          value: '还款日前一天',
        },
        {
          name: '立即放款',
          value: '立即放款',
          style: {
            width: '2.07rem',
          },
        },
      ],
    };
  }

  static propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    children: '',
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

  componentWillUnmount() {}

  // 数据回显
  recoveryPageData = () => {
    let pageData = store.getRepaymentModalData();
    pageData.repaymentAmount = 8299.89;
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
    // this.props.history.push('/mine/select_credit_page');
  };

  // 确认按钮点击事件
  handleClickConfirm = () => {
    console.log('点击确认按钮');
    this.clearCurrentPageData();
  }

  // 获取代还期限列表 还款日期列表
  requestGetRepaymentDateList = () => {
    this.props.$fetch.post(`${API.QUERY_REPAY_INFO}`).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        console.log(result);
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
    this.props.$fetch.get(API.BANNER).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        console.log(result);
      }
    });
  };

  render() {
    const { repaymentAmount, repaymentDateList, repaymentIndex, lendersDateList, lendersIndex } = this.state;
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
              <span className={style.item_value}>{repaymentAmount}</span>
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
