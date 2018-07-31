import SButton from 'components/button';
import iconArrow from 'assets/images/home/icon_arrow_right.png';
import React from 'react';
import { Toast } from 'antd-mobile';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import BankCard from '../bank_card';
import style from './index.scss';

const API = {
  CRED_CARD_COUNT: '/index/usrCredCardCoun', // 授信信用卡数量查询
};

@fetch.inject()
export default class BankContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      credCardCount: 0,
    };
  }

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

  componentWillMount() {
    if (this.props.contentData.indexMsg === '一键代还') {
      this.requestCredCardCount();
    }
  }

  // 代还其他信用卡点击事件
  repayForOtherBank = () => {
    if (this.state.credCardCount > 1) {
      console.log('跳选择授信卡页');
      // this.props.push('');
    } else {
      console.log('跳魔蝎');
      // this.props.push('');
    }
  };

  // 请求信信用卡数量
  requestCredCardCount = () => {
    this.props.$fetch
      .post(API.CRED_CARD_COUNT).then(result => {
        if (result && result.msgCode === 'PTM0000') {
          console.log(result, 'result');
          this.setState({
            credCardCount: result.data,
          });
        } else {
          Toast.info(result.msgInfo);
        }
      })
      .catch(err => {
        Toast.info(err.message);
      });
  };

  render() {
    const { className, children, contentData, ...restProps } = this.props;
    return (
      <div className={style.bank_content_wrap} {...restProps}>
        <BankCard contentData={contentData} {...contentData.indexData} />
        {children}
        {contentData.indexMsg === '一键代还' ? (
          <button className={style.link_tip} onClick={this.repayForOtherBank}>
            代还其它信用卡
            <img className={style.link_arrow_img} src={iconArrow} alt="" />
          </button>
        ) : null}
      </div>
    );
  }
}
