import SButton from 'components/button';
import iconArrow from 'assets/images/home/icon_arrow_right.png';
import React from 'react';
import PropTypes from 'prop-types';
import BankCard from '../bank_card';
import style from './index.scss';

export default class BankContent extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    showModalFun: PropTypes.func,
    contentData: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    children: '',
    contentData: {},
    showModalFun: () => {
      console.log('该弹框了');
    },
  };

  render() {
    const { className, children, showModalFun, contentData, ...restProps } = this.props;
    return (
      <div className={style.bank_content_wrap} {...restProps}>
        <BankCard contentData={contentData} {...contentData.indexData} />
        {children}
        <button className={style.link_tip} onClick={event => _handleClick(showModalFun, event)}>
          代还其它信用卡
          <img className={style.link_arrow_img} src={iconArrow} alt="" />
        </button>
      </div>
    );
  }
}
