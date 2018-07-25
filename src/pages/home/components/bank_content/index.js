import React from 'react';
import PropTypes from 'prop-types';
import BankCard from '../bank_card';
import SButton from 'components/button';
import iconArrow from 'assets/images/home/icon_arrow_right.png';
import style from './index.scss';

const _handleClick = (onClick, event) => {
  event.preventDefault();
  !!onClick && onClick();
};

export default class InfoCard extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
    showModalFun: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    children: '',
    onClick: () => {
      console.log('点击按钮，默认方法');
    },
    showModalFun: () => {
      console.log('该弹框了');
    },
  };

  render() {
    const { className, children, onClick, showModalFun, ...restProps } = this.props;
    return (
      <div className={style.bank_content_wrap} {...restProps}>
        <BankCard />
        <SButton className={style.info_button} onClick={onClick}>
          一键还卡
        </SButton>
        <button className={style.link_tip} onClick={event => _handleClick(showModalFun, event)}>
          代还其它信用卡
          <img className={style.link_arrow_img} src={iconArrow} alt="" />
        </button>
        {children}
      </div>
    );
  }
}
