import sng4 from 'assets/images/carousel/placeholder.png';
import React, { PureComponent } from 'react';
import { Modal, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { store } from 'utils/common';
import SButton from 'components/button';
import fetch from 'sx-fetch';
import Carousels from 'components/carousel';
import InfoCard from './components/info_card/index.js';
import BankContent from './components/bank_content/index.js';
import ModalContent from './components/modal_info';
import MsgBadge from './components/msg-badge';

import style from './style.scss';

const API = {
  BANNER: '/my/getBannerList', // 0101-banner
  USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
  CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
};

const mockData = {
  LN0001: {
    indexSts: 'LN0001',
    indexMsg: '信用卡未授权',
    indexData: {},
  },
  LN0002: {
    indexSts: 'LN0002',
    indexMsg: '账单爬取中',
    indexData: {},
  },
  LN0003: {
    indexSts: 'LN0003',
    indexMsg: '一键还卡',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
  LN0004: {
    indexSts: 'LN0004',
    indexMsg: '代还资格审核中',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
  LN0005: {
    indexSts: 'LN0005',
    indexMsg: '暂无代还资格',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
  LN0006: {
    indexSts: 'LN0006',
    indexMsg: '一键代还',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
  LN0007: {
    indexSts: 'LN0007',
    indexMsg: '放款准备中',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
  LN0008: {
    indexSts: 'LN0008',
    indexMsg: '一键还卡',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
  LN0009: {
    indexSts: 'LN0009',
    indexMsg: '查看代还订单',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
  LN0010: {
    indexSts: 'LN0010',
    indexMsg: '爬取失败/老用户',
    indexData: {
      bankName: '招商银行',
      bankNo: 'ICBC',
      cardNoHid: '6785 **** **** 6654',
      cardBillDt: '2018-07-17',
      cardBillAmt: '786.45',
      overDt: '7',
    },
  },
};

@fetch.inject()
export default class HomePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowModal: false,
      bannerList: [{ src: sng4, url: '' }],
      usrIndexInfo: '',
      // usrIndexInfo: mockData.LN0006,
      haselescard: 'true',
    };
  }

  componentWillMount() {
    this.requestGetBannerList();
    this.requestGetUsrInfo();

    let bankInfo = store.getCardData();
    if (bankInfo && bankInfo !== {}) {
      this.setState(
        {
          isShowModal: true,
        },
        () => {
          console.log('该不该清数据');
          store.removeCardData();
        },
      );
    }
  }

  handleShowModal = () => {
    this.setState({
      isShowModal: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      isShowModal: false,
    });
  };

  handleClickBack = () => {
    console.log('代还');
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
        this.props.history.push('/mine/credit_extension_page');
        break;
      case 'LN0004': // 代还资格审核中
        console.log('LN0004');
        Toast.info('您的代还资格正在审核中，请耐心等待');
        break;
      case 'LN0005': // 暂无代还资格
        console.log('LN0005');
        Toast.info('您暂时没有代还资格，请2018-8-1日再试');
        break;
      case 'LN0006': // 风控审核通过
        console.log('LN0006');
        this.handleShowModal();
        // this.requestBindCardState();
        break;
      case 'LN0007': // 放款中
        console.log('LN0007');
        Toast.info(`您的代还资金将于${dayjs(usrIndexInfo.indexData.repayDt).format('YYYY-MM-DD')}，请耐心等待`);
        break;
      case 'LN0008': // 放款失败
        console.log('LN0008 也跳账单页');
        this.props.history.push('/order/order_page');
        break;
      case 'LN0009': // 放款成功
        console.log('LN0009');
        this.props.history.push('/order/order_page');
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
      if (result && result.msgCode === 'RCM0000' && result.data !== null) {
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
        console.log('有风控且绑信用卡储蓄卡');
        this.handleShowModal();
      } else if (result && result.msgCode === 'PTM2003') {
        console.log('有风控没绑储蓄卡 跳绑储蓄卡页面');
        store.setBackUrl('/home/home');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_save_page', search: '?needSaveBankCardInfo=false' });
        }, 3000);
      } else if (result && result.msgCode === 'PTM2002') {
        console.log('有风控没绑信用卡 跳绑信用卡页面');
        store.setBackUrl('/home/home');
        Toast.info(result.msgInfo);
        setTimeout(() => {
          this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?needSaveBankCardInfo=false' });
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
            // src: sng4,
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
        this.setState({
          usrIndexInfo: result.data,
        });
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
            {usrIndexInfo.indexSts === 'LN0002' || usrIndexInfo.indexSts === 'LN0010' ? null : (
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
        <Carousels data={bannerList}>
          <MsgBadge />
        </Carousels>
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
