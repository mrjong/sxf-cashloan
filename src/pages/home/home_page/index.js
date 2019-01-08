import defaultBanner from 'assets/images/carousel/placeholder.png';
import React, { PureComponent } from 'react';
import { Modal, Progress } from 'antd-mobile';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { isWXOpen, getDeviceType } from 'utils';
import qs from 'qs'
import { buriedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import SXFButton from 'components/ButtonCustom';
import { SXFToast } from 'utils/SXFToast';
import fetch from 'sx-fetch';
import Carousels from 'components/Carousels';
import InfoCard from './components/InfoCard';
import BankContent from './components/BankContent';
import ModalContent from './components/ModalInfo';
import MsgBadge from './components/MsgBadge';
import style from './index.scss';

const API = {
  BANNER: '/my/getBannerList', // 0101-banner
  USR_INDEX_INFO: '/index/usrIndexInfo1', // 0103-首页信息查询接口
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
  CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
  GETSTSW: '/my/getStsw', // 获取首页进度
  AGENT_REPAY_CHECK: '/bill/agentRepayCheck', // 复借风控校验接口
};

let token = '';
let tokenFromStorage = '';

let timer;
let timerOut;

@fetch.inject()
export default class home_page extends PureComponent {
  constructor(props) {
    // 获取token
    token = Cookie.get('fin-v-card-token');
    tokenFromStorage = store.getToken();
    super(props);
    this.state = {
      isShowModal: false,
      bannerList: [],
      usrIndexInfo: '',
      haselescard: 'true',
      percentSatus: '',
      visibleLoading: false,
      percent: 0,
      showToast: false,
    };
  }
  componentWillMount() {
    // 清除订单缓存
    store.removeBackData();
    // 清除四项认证进入绑卡页的标识
    store.removeCheckCardRouter();
    this.getTokenFromUrl();
    // 判断是否是微信打通（微信登陆）
    if (isWXOpen() && !tokenFromStorage && !token) {
      // if (true && !tokenFromStorage && !token) {
      this.cacheBanner();
    } else {
      this.requestGetUsrInfo();
    }
    // 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
    if (isWXOpen()) {
      store.setHistoryRouter(window.location.pathname);
    }
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
          window.handleCloseHomeModal = this.handleCloseModal;
          store.removeCardData();
        },
      );
    }
  }
  componentWillUnmount() {
    // 离开首页的时候 将 是否打开过底部弹框标志恢复
    store.removeHadShowModal();
    if (timer) {
      clearInterval(timer);
    }
    if (timerOut) {
      clearTimeout(timerOut);
    }
  }
  // 从 url 中获取参数，如果有 token 就设置下
  getTokenFromUrl = () => {
    const urlParams = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (urlParams.token) {
      Cookie.set('fin-v-card-token', urlParams.token, { expires: 365 });
      store.setToken(urlParams.token);
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

  // 首页进度
  getPercent = () => {
    this.props.$fetch.post(API.GETSTSW).then((result) => {
      if (result && result.data !== null) {
        console.log(result)
        this.calculatePercent(result.data)
      }
    }, err => {
      err.msgInfo && this.props.this.props.toast.info(err.msgInfo);
    })
  }

  // 进度计算
  calculatePercent = (list) => {
    let codes = []
    list.forEach(element => {
      // element.code === 'zmxy'
      // if(element.code === 'basicInf' || element.code === 'operator' || element.code === 'idCheck' || element.code === 'faceDetect'){
      if (element.code === 'basicInf' || element.code === 'operator' || element.code === 'idCheck') {
        codes.push(element.stsw.dicDetailCd)
      }
    });
    console.log(codes)
    // case '1': // 认证中
    // case '2': // 认证成功
    // case '3': // 认证失败
    // case '4': // 认证过期
    let newCodes2 = codes.filter((ele, index, array) => {
      return ele === '1' || ele === '2'
    })
    // 还差 2 步 ：三项认证项，完成任何一项认证项且未失效
    // 还差 1 步 ：三项认证项，完成任何两项认证项且未失效
    // 还差 0 步 ：三项认证项，完成任何三项认证项且未失效（不显示）
    switch (newCodes2.length) {
      case 1: // 新用户，信用卡未授权
        this.setState({
          percentSatus: '2'
        });
        break;
      case 2: // 新用户，信用卡未授权
        this.setState({
          percentSatus: '1'
        });
        break;
      // case 3: // 新用户，信用卡未授权
      //   this.setState({
      //     percentSatus: '1'
      //   });
      //   break;
      default:
        console.log('default');
        this.setState({
          percentSatus: '',
        });
    }
  }

  // 智能按钮点击事件
  handleSmartClick = () => {
    const { usrIndexInfo } = this.state;
    if (usrIndexInfo.indexSts === 'LN0001') {
      // 埋点-首页-点击申请信用卡代还按钮
      buriedPointEvent(home.applyCreditRepayment);
    } else if (usrIndexInfo.indexSts === 'LN0009') {
      // 埋点-首页-点击查看代还账单
      buriedPointEvent(home.viewBill);
    } else {
      // 埋点-首页-点击一键还卡（代还）
      buriedPointEvent(home.easyRepay, {
        stateType: usrIndexInfo.indexSts,
      });
    }
    switch (usrIndexInfo.indexSts) {
      case 'LN0001': // 新用户，信用卡未授权
        this.applyCardRepay();
        break;
      case 'LN0002': // 账单爬取中
        break;
      case 'LN0003': // 账单爬取成功 (直接跳数据风控)
        console.log('LN0003 无风控信息 直接跳数据风控');
        buriedPointEvent(home.repaymentBtnClick3);
        buriedPointEvent(mine.creditExtension, {
          entry: '首页',
        });
        this.props.history.push({ pathname: '/mine/credit_extension_page', search: '?isShowCommit=true' });
        break;
      case 'LN0004': // 代还资格审核中
        console.log('LN0004');
        this.props.toast.info('您的代还资格正在审核中，请耐心等待');
        break;
      case 'LN0005': // 暂无代还资格
        console.log('LN0005');
        this.props.toast.info(`您暂时没有代还资格，请${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY-MM-DD')}日再试`);
        break;
      case 'LN0006': // 风控审核通过
        console.log('LN0006');
        buriedPointEvent(home.repaymentBtnClick6);
        this.repayCheck();
        break;
      case 'LN0007': // 放款中
        console.log('LN0007');
        this.props.toast.info(`您的代还资金将于${dayjs(usrIndexInfo.indexData.repayDt).format('YYYY-MM-DD')}到账，请耐心等待`);
        break;
      case 'LN0008': // 放款失败
        console.log('LN0008 不跳账单页 走弹框流程');
        buriedPointEvent(home.repaymentBtnClick8);
        this.repayCheck();
        break;
      case 'LN0009': // 放款成功
        console.log('LN0009');
        store.setBillNo(usrIndexInfo.indexData.billNo);
        // entryFrom 给打点使用，区分从哪个页面进入订单页的
        this.props.history.push({ pathname: '/order/order_detail_page', search: '?entryFrom=home' });
        break;
      case 'LN0010': // 账单爬取失败/老用户 无按钮不做处理
        console.log('LN0010');
        break;
      default:
        console.log('default');
    }
  };

  // 设置百分比
  setPercent = (percent) => {
    if (this.state.percent < 90 && this.state.percent >= 0) {
      console.log(Math.random() * 10 + 1)
      this.setState({
        percent: this.state.percent + parseInt(Math.random() * 10 + 1)
      })
    } else {
      clearInterval(timer)
    }
  }

  // 申请信用卡代还点击事件 通过接口判断用户是否授权 然后跳页面
  applyCardRepay = () => {
    this.props.$fetch.post(API.CARD_AUTH).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        store.setMoxieBackUrl('/mine/credit_extension_page?isShowCommit=true');
        SXFToast.loading('加载中...', 0);
        // window.location.href = result.data.url.replace('https://lns-front-test.vbillbank.com/craw/index.html#/','http://172.18.40.77:9000#/')+ `&project=xdc&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}`
        window.location.href = result.data.url + `&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window.location.search}&showTitleBar=NO`;
      } else {
        this.props.toast.info(result.msgInfo);
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
        this.props.toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
        }, 3000);
      } else if (result && result.msgCode === 'PTM2002') {
        // 有风控没绑信用卡 跳绑信用卡页面
        store.setBackUrl('/home/home');
        this.props.toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
        }, 3000);
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  // 复借风控校验接口
  repayCheck = () => {
    timerOut = setTimeout(() => { // 进度条
      this.setState(
        {
          percent: 0,
          visibleLoading: true,
          showToast: true,
        },
        () => {
          timer = setInterval(() => {
            this.setPercent();
            ++this.state.time;
          }, 1000);
        },
      );
    }, 800);
    const osType = getDeviceType();
    const params = {
      osTyp: osType,
    }
    this.props.$fetch.post(API.AGENT_REPAY_CHECK, params,
      {
        timeout: 100000,
        hideLoading: true,
      }).then(result => {
        this.setState(
          {
            percent: 100,
          },
          () => {
            clearInterval(timer);
            clearTimeout(timerOut);
            this.setState({
              visibleLoading: false,
            });
            if (result && result.msgCode === 'PTM0000') {
              if (this.state.showToast) {
                this.setState({
                  showToast: false,
                });
                this.props.toast.info('资质检测完成，可正常借款', 3, () => {
                  this.requestBindCardState();
                });
              } else {
                this.requestBindCardState();
              }
            } else { // 失败的话刷新首页
              this.props.toast.info(result.msgInfo, 2, () => {
                this.requestGetUsrInfo();
              });
            }
          })
      })
      .catch(err => {
        console.log(err);
        clearInterval(timer);
        clearTimeout(timerOut);
        this.setState(
          {
            percent: 100,
          },
          () => {
            this.setState({
              visibleLoading: false,
            });
          },
        );
      })
  }

  // 获取 banner 列表
  requestGetBannerList = () => {
    const params = {
      type: 1,
      client: 'wap_out',
    };
    this.props.$fetch.post(API.BANNER, params, { hideLoading: true }).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        const bannerData = result.data.map(item => ({
          src: `data:image/png;base64,${item.picUrl}`,
          url: item.gotoFlag !== 0 ? item.gotoUrl : '',
          title: item.title,
        }));
        const inFifteenMinutes = new Date(new Date().getTime() + 1000 * 60 * 2);
        Cookie.set('bannerAble', true, { expires: inFifteenMinutes });
        store.setBannerData(bannerData);
        this.setState({
          bannerList: bannerData,
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
        // result.data.indexSts = 'LN0003'
        // result.data.indexData = {
        //   autSts : '2'
        // }
        if (result.data.indexSts === 'LN0003') {
          this.getPercent();
        }
        this.setState({
          usrIndexInfo: result.data.indexData ? result.data : Object.assign({}, result.data, { indexData: {} }),
        });

        // TODO: 这里优化了一下，等卡片信息成功后，去请求 banner 图的接口
        this.cacheBanner();
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };

  // 缓存banner
  cacheBanner = () => {
    const bannerAble = Cookie.getJSON('bannerAble');
    const bannerDataFromSession = store.getBannerData();
    if (bannerAble && bannerDataFromSession && bannerDataFromSession !== {}) {
      this.setState({
        bannerList: bannerDataFromSession,
      });
    } else {
      this.requestGetBannerList();
    }
  }

  // 去登陆
  handleNeedLogin = () => {
    this.props.toast.info('请先登录', 2, () => {
      this.props.history.push({ pathname: '/login', state: { isAllowBack: true } });
    });
  };

  render() {
    const { bannerList, usrIndexInfo, visibleLoading, percent, percentSatus } = this.state;
    const { history } = this.props;
    let componentsDisplay = null;
    switch (usrIndexInfo.indexSts) {
      case 'LN0001': // 新用户，信用卡未授权
        componentsDisplay = (
          <InfoCard contentData={usrIndexInfo}>
            <SXFButton className={style.smart_button_one} onClick={this.handleSmartClick}>
              申请信用卡代还
            </SXFButton>
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
            progressNum={percentSatus}
          >
            {usrIndexInfo.indexSts === 'LN0002' ||
              usrIndexInfo.indexSts === 'LN0010' ||
              (usrIndexInfo.indexData && usrIndexInfo.indexData.autSts !== '2') ? null : (
                <SXFButton className={style.smart_button_two} onClick={this.handleSmartClick}>
                  {usrIndexInfo.indexMsg}
                </SXFButton>
              )}
          </BankContent>
        );
        break;
      default:
        console.log('default');
        if (isWXOpen()) {
          componentsDisplay = (
            <InfoCard contentData={usrIndexInfo}>
              <SXFButton onClick={this.handleNeedLogin} className={style.smart_button_one}>
                申请信用卡代还
              </SXFButton>
            </InfoCard>
          );
        }
    }
    return (
      <div className={style.home_page}>
        {isWXOpen() && !tokenFromStorage && !token ? (
          // {true && !tokenFromStorage && !token ? (
          <Carousels data={bannerList} entryFrom="banner"></Carousels>
        )
          :
          usrIndexInfo ? (
            bannerList && bannerList.length > 0 ? (
              <Carousels data={bannerList} entryFrom="banner">
                <MsgBadge />
              </Carousels>
            ) : (
                <img className={style.default_banner} src={defaultBanner} alt="banner" />
              )
          ) : (
              <img className={style.default_banner} src={defaultBanner} alt="banner" />
            )}
        <div className={style.content_wrap}>{componentsDisplay}</div>
        <div className={style.tip_bottom}>怕逾期，用还到</div>
        {/* 确认代还信息弹框 */}
        <Modal popup visible={this.state.isShowModal} onClose={this.handleCloseModal} animationType="slide-up">
          <ModalContent indexData={usrIndexInfo.indexData} onClose={this.handleCloseModal} history={history} />
        </Modal>
        <Modal
          wrapClassName={style.modalLoadingBox}
          visible={visibleLoading}
          transparent
          maskClosable={false}
        //   onClose={this.onClose('modal1')}

        //   footer={[{ text: 'Ok', onPress: () => { console.log('ok'); this.onClose('modal1')(); } }]}
        //   wrapProps={{ onTouchStart: this.onWrapTouchStart }}
        >
          <div className="show-info">
            <div className={style.modalLoading}>
              资质检测中...
            </div>
            <div className="progress"><Progress percent={percent} position="normal" /></div>
            {/* <div aria-hidden="true">{percent}</div> */}
          </div>
        </Modal>
      </div>
    );
  }
}
