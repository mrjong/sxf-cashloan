import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import SButton from 'components/button';
import TabList from '../tag_list';

import style from './style.scss';

const API = {
  BANNER: '/my/getBannerList',
};

@fetch.inject()
export default class ModalInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static propTypes = {
    children: PropTypes.node,
    repaymentDateList: PropTypes.array,
    lendersDateList: PropTypes.array,
    onClose: PropTypes.func,
  };

  static defaultProps = {
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
    children: '',
    onClose: () => {
      console.log('弹框关闭方法，需要传递进来');
    },
  };

  componentWillMount() {}

  handleRepaymentTagClick = () => {
    console.log('还款Tag');
  };

  handleLendersTagClick = () => {
    console.log('放  款Tag');
  };

  // 按钮点击事件
  _handleClick = (callback, e) => {
    e && e.preventDefault && e.preventDefault();
    callback && callback();
  };

  // 确认按钮点击事件
  handleClickConfirm() {
    console.log('点击确认按钮');
  }

  // 获取代还期限列表
  requestGetRepaymentDateList = () => {
    this.props.$fetch.get(API.BANNER).then(result => {
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
    const { repaymentDateList, lendersDateList, onClose } = this.props;
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
              <span className={style.item_value}>960.77</span>
            </div>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>代还期限</label>
              <TabList tagList={repaymentDateList} onClick={this.handleRepaymentTagClick} />
            </div>
            <p className={style.item_tip}>我们根据您信用卡账单情况为您推荐最佳代还金额和代还期限</p>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>放款日期</label>
              <TabList tagList={lendersDateList} onClick={this.handleLendersTagClick} />
            </div>
            <p className={style.item_tip}>选择还款日前一天（2018-7-12日）放款，将最大成本节 约您代资金</p>
          </li>
          <li className={style.list_item}>
            <div className={style.item_info}>
              <label className={style.item_name}>还款银行卡</label>
              <span className={style.item_value}>工商银行(2222)</span>
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
