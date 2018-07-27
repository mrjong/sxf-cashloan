import sng4 from 'assets/images/carousel/banner.png';
import React, { PureComponent } from 'react';
import { Modal } from 'antd-mobile';
import fetch from 'sx-fetch';
import Carousels from 'components/carousel';
import InfoCard from './components/info_card/index.js';
import BankContent from './components/bank_content/index.js';
import ModalContent from './components/modal_info';

import style from './style.scss';

const API = {
  BANNER: '/my/getBannerList',
};

@fetch.inject()
export default class HomePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: '2',
      isShowModal: false,
      bannerList: [{ src: sng4, url: '' }, { src: sng4, url: '' }, { src: sng4, url: '' }],
    };
  }

  componentWillMount() {
    this.requestGetBannerList();
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

  render() {
    const { type, bannerList } = this.state;
    return (
      <div className={style.home_page}>
        <Carousels data={bannerList} />
        <div className={style.content_wrap}>
          {type === '1' && <InfoCard onClick={this.handleClickBack} />}
          {type === '2' && <BankContent onClick={this.handleClickBack} showModalFun={this.handleShowModal} />}
        </div>
        {type === '1' && <div className={style.tip_bottom}>怕逾期，用还到</div>}

        {/* 确认代还信息弹框 */}
        <Modal popup visible={this.state.isShowModal} onClose={this.handleCloseModal} animationType="slide-up">
          <ModalContent onClose={this.handleCloseModal} />
        </Modal>
      </div>
    );
  }
}
