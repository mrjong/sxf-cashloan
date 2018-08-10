import SButton from 'components/button';
import iconArrow from 'assets/images/home/icon_arrow_right.png';
import React from 'react';
import { Toast } from 'antd-mobile';
import { store } from 'utils/common';
import PropTypes from 'prop-types';
// import fetch from 'sx-fetch';
import BankCard from '../bank_card';
import style from './index.scss';

const API = {
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
  CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
};

// @fetch.inject()
export default class BankContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      credCardCount: 0,
    };
  }

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    history: PropTypes.object,
    contentData: PropTypes.object,
    fetch: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    children: '',
    history: {},
    contentData: {},
    fetch: {},
  };

  componentWillMount() {
    if (this.props.contentData.indexMsg === '一键代还') {
      this.requestCredCardCount();
    }
  }

  // 代还其他信用卡点击事件
  repayForOtherBank = () => {
    if (this.state.credCardCount > 1) {
      store.setBackUrl('/home/home');
      const { contentData } = this.props;
      this.props.history.push({ pathname: '/mine/credit_list_page', search: `?autId=${contentData.indexData.autId}` });
    } else {
      this.goToMoXie();
    }
  };

  // 通过接口跳魔蝎
  goToMoXie = () => {
    this.props.fetch.post(API.CARD_AUTH).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        // TODO 授信页面？
        store.setMoxieBackUrl('/home/home');
        window.location.href = result.data.url;
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 请求信信用卡数量
  requestCredCardCount = () => {
    this.props.fetch
      .post(API.CRED_CARD_COUNT).then(result => {
        if (result && result.msgCode === 'PTM0000') {
          this.setState({
            credCardCount: result.data.count,
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
    const showEntranceArr = ['LN0002', 'LN0003', 'LN0006', 'LN0008', 'LN0010'];
    return (
      <div className={style.bank_content_wrap} {...restProps}>
        <BankCard contentData={contentData} {...contentData.indexData} />
        {children}
        {showEntranceArr.includes(contentData.indexSts) ? (
          <button className={style.link_tip} onClick={this.repayForOtherBank}>
            代还其它信用卡
            <img className={style.link_arrow_img} src={iconArrow} alt="" />
          </button>
        ) : null}
      </div>
    );
  }
}
