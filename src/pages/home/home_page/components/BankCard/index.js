import React from 'react';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { Toast } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss';

const _handleClick = (onClick, event) => {
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
    billDt: PropTypes.string,
    cardBillAmt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    overDt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
    billDt: '---',
    cardBillAmt: '---',
    overDt: '---',
    onClick: () => {

    },
  };

  handleUpdate = () => {
    const { indexSts } = this.props.contentData;
    if (indexSts && indexSts === 'LN0009') {
      this.props.toast.info('您有未结清的账单，暂时不能更新');
    } else {
      this.applyCardRepay();
    }
  };

  // 跳魔蝎
  applyCardRepay = () => {
    // 埋点-首页-点击更新账单
    buriedPointEvent(home.updateBill);
    this.props.$fetch.post(API.CARD_AUTH).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        store.setMoxieBackUrl('/home/home');
        Toast.loading('加载中...', 0);
        // window.location.href = result.data.url.replace('https://lns-front-test.vbillbank.com/craw/index.html#/','http://172.18.40.77:9000#/')+ `&project=xdc&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}`
        window.location.href = result.data.url + `&project=xdc&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}`;
      } else {
        this.props.toast.info(result.msgInfo);
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
      billDt,
      cardBillAmt,
      overDt,
    } = this.props;
    const iconClass = bankNo ? `bank_golden_ico_${bankNo}` : 'logo_ico';
    let overDtStr = '---';
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
        {contentData.indexSts === 'LN0002' ? (
          <button className={style.bill_update_btn}>授权中</button>
        ) : (
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
              {!billDt || billDt === '---' ? '---' : dayjs(billDt).format('YYYY/MM/DD')}
            </span>
            <span className={style.bill_name}>账单日</span>
          </div>
          <div className={style.bill_item}>
            <span className={style.bill_value}>
              {!cardBillAmt || cardBillAmt === '---' ? '---' : parseFloat(cardBillAmt, 10).toFixed(2)}
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
