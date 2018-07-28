import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';

const _handleClick = (onClick, event) => {
  console.log(event, 'event');
  event.preventDefault();
  !!onClick && onClick();
};

export default class BankCard extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    contentData: PropTypes.object,
    bankIcon: PropTypes.string,
    bankName: PropTypes.string,
    cardNoHid: PropTypes.string,
    cardBillDt: PropTypes.string,
    cardBillAmt: PropTypes.string,
    overDt: PropTypes.string,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    children: '',
    contentData: {},
    bankIcon: '',
    bankName: '****',
    cardNoHid: '**** **** **** ****',
    cardBillDt: '---',
    cardBillAmt: '---',
    overDt: '---',
    onClick: () => {
      console.log('点击按钮，默认方法');
    },
  };

  handleUpdate = () => {
    console.log('更新账单');
  };

  render() {
    const {
      className,
      children,
      contentData,
      onClick,
      bankIcon,
      bankName,
      cardNoHid,
      cardBillDt,
      cardBillAmt,
      overDt,
    } = this.props;
    return (
      <div className={style.bank_card_wrap}>
        {contentData.indexSts === 'LN0002' ? null : (
          <button className={style.bill_update_btn} onClick={this.handleUpdate}>
            更新账单
          </button>
        )}
        <div className={style.card_preview}>
          <img className={style.card_icon} src={bankIcon} alt="" />
          <div className={style.card_info}>
            <span className={style.card_info_name}>{bankName}</span>
            <span className={style.card_info_num}>{cardNoHid}</span>
          </div>
        </div>
        <div className={style.bill_preview}>
          <div className={style.bill_item}>
            <span className={style.bill_value}>{cardBillDt}</span>
            <span className={style.bill_name}>账单日</span>
          </div>
          <div className={style.bill_item}>
            <span className={style.bill_value}>{cardBillAmt}</span>
            <span className={style.bill_name}>账单金额</span>
          </div>
          <div className={style.bill_item}>
            <span className={style.bill_value}>{overDt}</span>
            <span className={style.bill_name}>还款日</span>
          </div>
        </div>
        {children}
      </div>
    );
  }
}
