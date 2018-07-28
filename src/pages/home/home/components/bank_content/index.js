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
    history:PropTypes.object,
    contentData: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    children: '',
    history: {},
    contentData: {},
  };

  // 代还其他信用卡点击事件
  repayForOtherBank = () => {
    if(this.props.haselescard === 'true') {
      console.log('跳选择授信卡页');
      // this.props.push('');
    } else {
      console.log('跳魔蝎');
      // this.props.push('');
    }
  };

  render() {
    const { className, children, contentData, ...restProps } = this.props;
    return (
      <div className={style.bank_content_wrap} {...restProps}>
        <BankCard contentData={contentData} {...contentData.indexData} />
        {children}
        {contentData.indexMsg === '一键还卡' ? (
          <button className={style.link_tip} onClick={this.repayForOtherBank}>
            代还其它信用卡
            <img className={style.link_arrow_img} src={iconArrow} alt="" />
          </button>
        ) : null}
      </div>
    );
  }
}
