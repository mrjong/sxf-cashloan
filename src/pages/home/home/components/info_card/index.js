import React from 'react';
import PropTypes from 'prop-types';
import SButton from 'components/button';
import style from './index.scss';

const _handleClick = (onClick, event) => {
  console.log(event, 'event');
  event.preventDefault();
  !!onClick && onClick();
};

export default class InfoCard extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    children: '',
    onClick: () => {
      console.log('点击按钮，默认方法');
    },
  };

  render() {
    const { className, children, onClick, ...restProps } = this.props;
    return (
      <div className={style.info_card} {...restProps}>
        <div className={style.info_main}>最高可得5万元还款金</div>
        <p className={style.info_sub}>
          点击下方申请信用卡代还 <br /> 仅需三步，即可帮您还账单
        </p>
        <SButton className={style.info_button} onClick={onClick}>
          申请信用卡代还
        </SButton>
        {children}
      </div>
    );
  }
}
