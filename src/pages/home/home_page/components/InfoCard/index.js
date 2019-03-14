import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';

export default class InfoCard extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    contentData: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    children: '',
    contentData: {},
  };

  render() {
    const { className, children, contentData, ...restProps } = this.props;
    return (
      <div className={style.info_card} {...restProps}>
        <div className={style.info_main}>最高可得5万元还款金</div>
        <p className={style.info_sub}>
          点击下方申请信用卡代偿 <br /> 仅需三步，即可帮您还账单
        </p>
        {children}
      </div>
    );
  }
}
