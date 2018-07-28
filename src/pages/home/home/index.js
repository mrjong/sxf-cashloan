import sng4 from 'assets/images/carousel/banner.png';
import React, { PureComponent } from 'react';
import { Modal } from 'antd-mobile';
import SButton from 'components/button';
import fetch from 'sx-fetch';
import Carousels from 'components/carousel';
import InfoCard from './components/info_card/index.js';
import BankContent from './components/bank_content/index.js';
import ModalContent from './components/modal_info';

import style from './style.scss';

const API = {
  BANNER: '/my/getBannerList',
  USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口
};

const mockData = {
  LN0001: {
    indexSts: 'LN0001',
    indexMsg: '信用卡未授权',
    indexData: {},
  },
  LN0002: {
    "indexSts":"LN0002",
     "indexMsg":"账单爬取中",
     "indexData":{}
  },
  LN0003: {
    "indexSts":"LN0003",
      "indexMsg":"一键还卡",
      "indexData":{
          "bankName":"招商银行",
        "bankNo":"ICBC",
        "cardNoHid":"6785 **** **** 6654",
        "cardBillDt":"2018-07-17",
        "cardBillAmt":"786.45",
        "overDt":"7"
      }
  },
  LN0004: {
    "indexSts":"LN0004",
      "indexMsg":"代还资格审核中",
      "indexData":{
          "bankName":"招商银行",
        "bankNo":"ICBC",
        "cardNoHid":"6785 **** **** 6654",
        "cardBillDt":"2018-07-17",
        "cardBillAmt":"786.45",
        "overDt":"7"
      }
  },
  LN0005: {
    "indexSts":"LN0005",
      "indexMsg":"暂无代还资格",
      "indexData":{
          "bankName":"招商银行",
        "bankNo":"ICBC",
        "cardNoHid":"6785 **** **** 6654",
        "cardBillDt":"2018-07-17",
        "cardBillAmt":"786.45",
        "overDt":"7"
      }
  },
  LN0006: {
    "indexSts":"LN0006",
     "indexMsg":"一键还卡",
     "indexData":{
         "bankName":"招商银行",
       "bankNo":"ICBC",
       "cardNoHid":"6785 **** **** 6654",
       "cardBillDt":"2018-07-17",
       "cardBillAmt":"786.45",
       "overDt":"7"
     }
  },
  LN0007: {
    "indexSts":"LN0007",
      "indexMsg":"放款准备中",
      "indexData":{
          "bankName":"招商银行",
        "bankNo":"ICBC",
        "cardNoHid":"6785 **** **** 6654",
        "cardBillDt":"2018-07-17",
        "cardBillAmt":"786.45",
        "overDt":"7"
      }
  },
  LN0008: {
    "indexSts":"LN0008",
      "indexMsg":"一键还卡",
      "indexData":{
          "bankName":"招商银行",
        "bankNo":"ICBC",
        "cardNoHid":"6785 **** **** 6654",
        "cardBillDt":"2018-07-17",
        "cardBillAmt":"786.45",
        "overDt":"7"
      }
  },
  LN0009: {
    "indexSts":"LN0009",
     "indexMsg":"查看代还订单",
     "indexData":{
         "bankName":"招商银行",
       "bankNo":"ICBC",
       "cardNoHid":"6785 **** **** 6654",
       "cardBillDt":"2018-07-17",
       "cardBillAmt":"786.45",
       "overDt":"7"
     }
  },
}

@fetch.inject()
export default class HomePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      typeCode: 'LN0003',
      isShowModal: false,
      bannerList: [{ src: sng4, url: '' }, { src: sng4, url: '' }, { src: sng4, url: '' }],
      usrIndexInfo: mockData.LN0001,
    };
  }

  componentWillMount() {
    // this.requestGetBannerList();
    // this.requestGetUsrInfo();
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

  // 获取 banner 列表
  requestGetBannerList = () => {
    this.props.$fetch.get(API.BANNER).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        console.log(result);
      }
    });
  };

  handleSmartClick = () => {
    const { usrIndexInfo } = this.state;
    switch (usrIndexInfo.indexSts) {
      case 'LN0001': // 新用户，信用卡未授权
        console.log('LN0001');
        break;
      case 'LN0002': // 账单爬取中/账单爬取失败/老用户
        console.log('LN0002');
        break;
      case 'LN0003': // 账单爬取成功
        console.log('LN0003');
        break;
      case 'LN0004': // 代还资格审核中
        console.log('LN0004');
        break;
      case 'LN0005': // 暂无代还资格
        console.log('LN0005');
        break;
      case 'LN0006': // 风控审核通过
        console.log('LN0006');
        break;
      case 'LN0007': // 放款中
        console.log('LN0007');
        break;
      case 'LN0008': // 放款失败
        console.log('LN0008');
        break;
      case 'LN0009': // 放款成功
        console.log('LN0001');
        break;
      default:
        console.log('default');
    }
  };

  // 获取首页信息
  requestGetUsrInfo = () => {
    this.props.$fetch.post(API.USR_INDEX_INFO).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        console.log(result);
      }
    });
  };

  // 根据码来控制显示内容
  showContentByCode = code => {
    switch (code) {
      case 'LN0001': // 新用户，信用卡未授权
        this.props.setTitle('LN0001');
        console.log('LN0001');
        break;
      case 'LN0002': // 账单爬取中/账单爬取失败/老用户
        console.log('LN0002');
        break;
      case 'LN0003': // 账单爬取成功
        this.props.setTitle('LN0003');
        console.log('LN0003');
        break;
      case 'LN0004': // 代还资格审核中
        console.log('LN0004');
        break;
      case 'LN0005': // 暂无代还资格
        console.log('LN0005');
        break;
      case 'LN0006': // 风控审核通过
        console.log('LN0006');
        break;
      case 'LN0007': // 放款中
        console.log('LN0007');
        break;
      case 'LN0008': // 放款失败
        console.log('LN0008');
        break;
      case 'LN0009': // 放款成功
        console.log('LN0001');
        break;
      default:
        console.log('default');
    }
  };

  render() {
    const { typeCode, bannerList, usrIndexInfo } = this.state;
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
      case 'LN0002': // 账单爬取中/账单爬取失败/老用户
      case 'LN0003': // 账单爬取成功
      case 'LN0004': // 代还资格审核中
      case 'LN0005': // 暂无代还资格
      case 'LN0006': // 风控审核通过
      case 'LN0007': // 放款中
      case 'LN0008': // 放款失败
      case 'LN0009': // 放款成功
        componentsDisplay = (
          <BankContent contentData={usrIndexInfo} showModalFun={this.handleShowModal}>
            <SButton className={style.smart_button_two} onClick={this.handleSmartClick}>
              申请信用卡代还
            </SButton>
          </BankContent>
        );
        break;
      default:
        console.log('default');
    }
    return (
      <div className={style.home_page}>
        <Carousels data={bannerList} />
        <div className={style.content_wrap}>{componentsDisplay}</div>
        {typeCode === 'LN0001' && <div className={style.tip_bottom}>怕逾期，用还到</div>}
        {/* 确认代还信息弹框 */}
        <Modal popup visible={this.state.isShowModal} onClose={this.handleCloseModal} animationType="slide-up">
          <ModalContent onClose={this.handleCloseModal} history={history} />
        </Modal>
      </div>
    );
  }
}
