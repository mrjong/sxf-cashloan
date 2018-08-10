import defaultBanner from 'assets/images/carousel/placeholder.png';
import React, { PureComponent } from 'react';
import { Modal, Toast } from 'antd-mobile';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store, getParamsFromUrl } from 'utils/common';
import SButton from 'components/button';
import fetch from 'sx-fetch';
import Carousels from 'components/carousel';
import InfoCard from './components/info_card/index.js';
import BankContent from './components/bank_content/index.js';
import ModalContent from './components/modal_info';
import MsgBadge from './components/msg-badge';
import style from './style.scss';
import mockData from './mockData';
// import noRouterBack from 'utils/noRouterBack'
const noRouterBack = require('utils/noRouterBack')
const API = {
  BANNER: '/my/getBannerList', // 0101-banner
  USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
  CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
};

@fetch.inject()
export default class HomePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowModal: false,
      bannerList: [],
      usrIndexInfo: '',
      haselescard: 'true',
    };
  }
  componentWillMount() {
    // 清除订单缓存
    store.removeBackData();
    // 清除四项认证进入绑卡页的标识
    store.removeCheckCardRouter();
    noRouterBack() // 禁用浏览器返回
    this.getTokenFromUrl();
    this.requestGetBannerList();
    this.requestGetUsrInfo();

    let bankInfo = store.getCardData();
    let repayInfoData = store.getRepaymentModalData();
    if (bankInfo && bankInfo !== {}) {
      if (repayInfoData && repayInfoData !== {}) {
        // 如果存在 bankInfo 并且弹框缓存数据崔仔 则更新弹框缓存的数据
        repayInfoData.repayInfo.bankName = bankInfo.bankName;
        repayInfoData.repayInfo.cardNoHid = bankInfo.lastCardNo;
        repayInfoData.repayInfo.withHoldAgrNo = bankInfo.agrNo;
        store.setRepaymentModalData(repayInfoData);
      }
      // 如果存在 bankInfo 则弹框 用完就清除
      this.setState(
        {
          isShowModal: true,
        },
        () => {
          store.removeCardData();
        },
      );
    }
  }

  // 从 url 中获取参数，如果有 token 就设置下
  getTokenFromUrl = () => {
    const urlParams = getParamsFromUrl(window.location.search);
    if (urlParams.token) {
      Cookie.set('fin-v-card-token', urlParams.token, { expires: 365 });
      store.setToken(urlParams.token)
    }
  };

  // 打开弹框
  handleShowModal = () => {
    window.handleCloseHomeModal = this.handleCloseModal;
    this.setState({
      isShowModal: true,
    });
  };

  // 关闭弹框
  handleCloseModal = () => {
    window.handleCloseHomeModal = null;
    this.setState({
      isShowModal: false,
    });
  };

  // 智能按钮点击事件
  handleSmartClick = () => {
    const { usrIndexInfo } = this.state;
    switch (usrIndexInfo.indexSts) {
      case 'LN0001': // 新用户，信用卡未授权
        this.applyCardRepay();
        break;
      case 'LN0002': // 账单爬取中
        console.log('LN0002');
        break;
      case 'LN0003': // 账单爬取成功 (直接跳数据风控)
        console.log('LN0003 无风控信息 直接跳数据风控');
        this.props.history.push({ pathname: '/mine/credit_extension_page', search: '?isShowCommit=true' });
        break;
      case 'LN0004': // 代还资格审核中
        console.log('LN0004');
        Toast.info('您的代还资格正在审核中，请耐心等待');
        break;
      case 'LN0005': // 暂无代还资格
        console.log('LN0005');
        Toast.info(`您暂时没有代还资格，请${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY-MM-DD')}日再试`);
        break;
      case 'LN0006': // 风控审核通过
        console.log('LN0006');
        // this.handleShowModal();
        this.requestBindCardState();
        break;
      case 'LN0007': // 放款中
        console.log('LN0007');
        Toast.info(`您的代还资金将于${dayjs(usrIndexInfo.indexData.repayDt).format('YYYY-MM-DD')}到账，请耐心等待`);
        break;
      case 'LN0008': // 放款失败
        console.log('LN0008 不跳账单页 走弹框流程');
        this.requestBindCardState();
        // store.setBillNo(usrIndexInfo.indexData.billNo)
        // this.props.history.push(`/order/order_detail_page`);
        break;
      case 'LN0009': // 放款成功
        console.log('LN0009');
        store.setBillNo(usrIndexInfo.indexData.billNo)
        this.props.history.push(`/order/order_detail_page`);
        break;
      case 'LN0010': // 账单爬取失败/老用户 无按钮不做处理
        console.log('LN0010');
        break;
      default:
        console.log('default');
    }
  };

  // 申请信用卡代还点击事件 通过接口判断用户是否授权 然后跳页面
  applyCardRepay = () => {
    this.props.$fetch.post(API.CARD_AUTH).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        store.setMoxieBackUrl('/home/home');
        window.location.href = result.data.url;
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 请求用户绑卡状态
  requestBindCardState = () => {
    this.props.$fetch.get(API.CHECK_CARD).then(result => {
      if (result && result.msgCode === 'PTM0000') {
        // 有风控且绑信用卡储蓄卡
        this.handleShowModal();
      } else if (result && result.msgCode === 'PTM2003') {
        // 有风控没绑储蓄卡 跳绑储蓄卡页面
        store.setBackUrl('/home/home');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
        }, 3000);
      } else if (result && result.msgCode === 'PTM2002') {
        // 有风控没绑信用卡 跳绑信用卡页面
        store.setBackUrl('/home/home');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
        }, 3000);
      } else {
        Toast.info(result.msgInfo);
      }
    });
  };

  // 获取 banner 列表
  requestGetBannerList = () => {
    this.props.$fetch.post(API.BANNER).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        this.setState({
          bannerList: result.data.map(item => ({
            src: `data:image/png;base64,${item.picUrl}`,
            url: item.gotoFlag !== 0 ? item.gotoUrl : '',
          })),
        });
      }
    });
  };

  // 获取首页信息
  requestGetUsrInfo = () => {
    this.props.$fetch.post(API.USR_INDEX_INFO).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        // let resultData = result.data;
        // const sessionCardData = store.getSomeData();
        // Object.assign(resultData.indexData, sessionCardData);
        this.setState({
          usrIndexInfo: result.data,
        });
      } else {
        Toast.info(result.msgInfo)
      }
    });
  };

  render() {
    const { bannerList, usrIndexInfo } = this.state;
    const { history } = this.props;
    let componentsDisplay = null;
    switch (usrIndexInfo.indexSts) {
      case 'LN0001': // 新用户，信用卡未授权
        componentsDisplay = (
          <InfoCard contentData={usrIndexInfo}>
            <SButton className={style.smart_button_one} onClick={this.handleSmartClick}>
              申请信用卡代还
            </SButton>
          </InfoCard>
        );
        break;
      case 'LN0002': // 账单爬取中
      case 'LN0003': // 账单爬取成功
      case 'LN0004': // 代还资格审核中
      case 'LN0005': // 暂无代还资格
      case 'LN0006': // 风控审核通过
      case 'LN0007': // 放款中
      case 'LN0008': // 放款失败
      case 'LN0009': // 放款成功
      case 'LN0010': // 账单爬取失败/老用户
        componentsDisplay = (
          <BankContent
            fetch={this.props.$fetch}
            contentData={usrIndexInfo}
            history={history}
            haselescard={this.state.haselescard}
          >
            {usrIndexInfo.indexSts === 'LN0002' ||
              usrIndexInfo.indexSts === 'LN0010' ||
              (usrIndexInfo.indexData && usrIndexInfo.indexData.autSts !== '2') ? null : (
                <SButton className={style.smart_button_two} onClick={this.handleSmartClick}>
                  {usrIndexInfo.indexMsg}
                </SButton>
              )}
          </BankContent>
        );
        break;
      default:
        console.log('default');
    }
    return (
      <div className={style.home_page}>
        {bannerList.length > 0 ? (
          <Carousels data={bannerList}>
            <MsgBadge />
          </Carousels>
        ) : (
            <img className={style.default_banner} src={defaultBanner} alt="banner" />
          )}

        <div className={style.content_wrap}>{componentsDisplay}</div>
        {/* todo: 这行文字要不要显示 */}
        <div className={style.tip_bottom}>怕逾期，用还到</div>
        {/* 确认代还信息弹框 */}
        <Modal popup visible={this.state.isShowModal} onClose={this.handleCloseModal} animationType="slide-up">
          <ModalContent indexData={usrIndexInfo.indexData} onClose={this.handleCloseModal} history={history} />
        </Modal>
      </div>
    );
  }
}
