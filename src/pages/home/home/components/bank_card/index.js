import React from 'react';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import dayjs from 'dayjs';
import { store } from 'utils/common';
import { Toast } from 'antd-mobile';
import style from './index.scss';

const _handleClick = (onClick, event) => {
  console.log(event, 'event');
  event.preventDefault();
  !!onClick && onClick();
};

const API = {
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
};

@fetch.inject()
export default class BankCard extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    contentData: PropTypes.object,
    bankIcon: PropTypes.string,
    bankName: PropTypes.string,
    bankNo: PropTypes.string,
    cardNoHid: PropTypes.string,
    cardBillDt: PropTypes.string,
    cardBillAmt: PropTypes.number,
    overDt: PropTypes.number,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    children: '',
    contentData: {},
    bankIcon: '',
    bankName: '****',
    bankNo: '',
    cardNoHid: '**** **** **** ****',
    cardBillDt: '---',
    cardBillAmt: '---',
    overDt: '---',
    onClick: () => {
      console.log('点击按钮，默认方法');
    },
  };

  handleUpdate = () => {
    this.applyCardRepay();
  };

  // 跳魔蝎
  applyCardRepay = () => {
    this.props.$fetch.post(API.CARD_AUTH).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        console.log(result, 'result');
        store.setMoxieBackUrl('/home/home');
        window.location.href = result.data.url;
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  render() {
    const {
      className,
      children,
      contentData,
      onClick,
      bankIcon,
      bankName,
      bankNo,
      cardNoHid,
      cardBillDt,
      cardBillAmt,
      overDt,
    } = this.props;
    const iconClass = bankNo ? `bank_golden_ico_${bankNo}` : 'logo_ico';
    let overDtStr = '';
    if (overDt === '---') {
      overDtStr = overDt;
    } else if (overDt > 0) {
      overDtStr = `${overDt}天后到期`;
    } else if (parseInt(overDt, 10) === 0) {
      overDtStr = '今天到期';
    } else if (overDt < 0) {
      overDtStr = '已到期';
    }
    return (
      <div className={style.bank_card_wrap}>
        {contentData.indexSts === 'LN0002' ? null : (
          <button className={style.bill_update_btn} onClick={this.handleUpdate}>
            更新账单
          </button>
        )}
        <div className={style.card_preview}>
          <span className={[style.card_icon, iconClass].join(' ')}></span>
          <div className={style.card_info}>
            <span className={style.card_info_name}>{bankName}</span>
            <span className={style.card_info_num}>{cardNoHid}</span>
          </div>
        </div>
        <div className={style.bill_preview}>
          <div className={style.bill_item}>
            <span className={style.bill_value}>
              {cardBillDt === '---' ? cardBillDt : dayjs(cardBillDt).format('YYYY/MM/DD')}
            </span>
            <span className={style.bill_name}>账单日</span>
          </div>
          <div className={style.bill_item}>
            <span className={style.bill_value}>
              {typeof cardBillAmt === 'number' ? parseInt(cardBillAmt, 10).toFixed(2) : cardBillAmt}
            </span>
            <span className={style.bill_name}>账单金额</span>
          </div>
          <div className={style.bill_item}>
            <span className={style.bill_value}>{overDtStr}</span>
            <span className={style.bill_name}>还款日</span>
          </div>
        </div>
        {children}
      </div>
    );
  }
}
