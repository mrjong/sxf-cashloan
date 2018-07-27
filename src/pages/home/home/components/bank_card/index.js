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
    onClick: PropTypes.func,
    bankIcon: PropTypes.string,
    bankName: PropTypes.string,
    bankNum: PropTypes.string,
    billDate: PropTypes.string,
    billAmount: PropTypes.string,
    repaymentDate: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    children: '',
    bankIcon: '',
    bankName: '****',
    bankNum: '**** **** **** ****',
    billDate: '---',
    billAmount: '---',
    repaymentDate: '---',
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
      onClick,
      bankIcon,
      bankName,
      bankNum,
      billDate,
      billAmount,
      repaymentDate,
    } = this.props;
    return (
      <div className={style.bank_card_wrap}>
        <button className={style.bill_update_btn} onClick={this.handleUpdate}>
          更新账单
        </button>
        <div className={style.card_preview}>
          <img className={style.card_icon} src={bankIcon} alt="" />
          <div className={style.card_info}>
            <span className={style.card_info_name}>{bankName}</span>
            <span className={style.card_info_num}>{bankNum}</span>
          </div>
        </div>
        <div className={style.bill_preview}>
          <div className={style.bill_item}>
            <span className={style.bill_value}>{billDate}</span>
            <span className={style.bill_name}>账单日</span>
          </div>
          <div className={style.bill_item}>
            <span className={style.bill_value}>{billAmount}</span>
            <span className={style.bill_name}>账单金额</span>
          </div>
          <div className={style.bill_item}>
            <span className={style.bill_value}>{repaymentDate}</span>
            <span className={style.bill_name}>还款日</span>
          </div>
        </div>
        {children}
      </div>
    );
  }
}
