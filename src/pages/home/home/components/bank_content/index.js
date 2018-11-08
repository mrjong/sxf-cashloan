import SButton from 'components/button';
import iconArrow from 'assets/images/home/icon_arrow_right.png';
import React from 'react';
import { Toast } from 'antd-mobile';
import { store } from 'utils/store';
import PropTypes from 'prop-types';
import { buriedPointEvent } from 'utils/Analytins';
import { home } from 'utils/AnalytinsType';
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
    this.state = {};
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

  // 代还其他信用卡点击事件
  repayForOtherBank = count => {
    if (count > 1) {
      store.setBackUrl('/home/home');
      const { contentData } = this.props;
      this.props.history.push({ pathname: '/mine/credit_list_page', search: `?autId=${contentData.indexSts === 'LN0010' ? '' : contentData.indexData.autId}` });
    } else {
      this.goToMoXie();
    }
  };

  // 通过接口跳魔蝎
  goToMoXie = () => {
    this.props.fetch.post(API.CARD_AUTH).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        // TODO 授信页面？
        // TODO: 完成认证后返回信用卡列表页？
        const { contentData } = this.props;
        store.setBackUrl('/home/home');
        store.setMoxieBackUrl(`/mine/credit_list_page?autId=${contentData.indexSts === 'LN0010' ? '' : contentData.indexData.autId}`);
        Toast.loading('加载中...', 0);
        // window.location.href = result.data.url.replace('https://lns-front-test.vbillbank.com/craw/index.html#/','http://172.18.40.77:9000#/')+ `&project=xdc&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}`
        window.location.href = result.data.url + `&project=xdc&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}`;
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 请求信信用卡数量
  requestCredCardCount = () => {
    // 埋点-首页-点击代还其他信用卡
    buriedPointEvent(home.repayOtherCredit);
    this.props.fetch
      .post(API.CRED_CARD_COUNT)
      .then(result => {
        if (result && result.msgCode === 'PTM0000') {
          this.repayForOtherBank(result.data.count);
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
        {contentData.indexSts === 'LN0010' ? (
          <p className={style.abnormal_tip}>点击更新账单，获取最新信用卡信息</p>
        ) : null}
        {children}
        {showEntranceArr.includes(contentData.indexSts) ? (
          <button className={style.link_tip} onClick={this.requestCredCardCount}>
            代还其它信用卡
            <img className={style.link_arrow_img} src={iconArrow} alt="" />
          </button>
        ) : null}
      </div>
    );
  }
}
