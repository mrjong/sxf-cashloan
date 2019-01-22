import React from 'react';
import PropTypes from 'prop-types';
import BankCard from '../BankCard';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import style from './index.scss';
import { SXFToast } from 'utils/SXFToast';
import iconArrow from 'assets/images/home/icon_arrow_right.png';

const API = {
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
  CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
};

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
        SXFToast.loading('加载中...', 0);
        window.location.href = result.data.url + `&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}&showTitleBar=NO`;
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  // 请求信用卡数量
  requestCredCardCount = () => {
    // 埋点-首页-点击代还其他信用卡
    buriedPointEvent(home.repayOtherCredit);
    this.props.fetch
      .post(API.CRED_CARD_COUNT)
      .then(result => {
        if (result && result.msgCode === 'PTM0000') {
          this.repayForOtherBank(result.data.count);
        } else {
          this.props.toast.info(result.msgInfo);
        }
      })
      .catch(err => {
        this.props.toast.info(err.message);
      });
  };

  render() {
    const { className, children, contentData, progressNum, ...restProps } = this.props;
    const { indexSts, indexData } = contentData
    const showEntranceArr = ['LN0002', 'LN0003', 'LN0006', 'LN0008', 'LN0010'];
    let tipText = null
    if (indexSts === 'LN0010') {
      tipText = <p className={style.abnormal_tip}>点击更新账单，获取最新信用卡信息</p>
    } else if (indexSts === 'LN0003' && progressNum) {
      tipText = <p className={style.progress_box}>还差<span>{progressNum}</span>步即可完成申请</p>
    }
    return (
      <div className={style.bank_content_wrap} {...restProps}>
        <BankCard contentData={contentData} {...indexData} />
        {tipText}
        {children}
        {showEntranceArr.includes(indexSts) ? (
          <button className={style.link_tip} onClick={this.requestCredCardCount}>
            代还其它信用卡
            <img className={style.link_arrow_img} src={iconArrow} alt="" />
          </button>
        ) : null}
      </div>
    );
  }
}
