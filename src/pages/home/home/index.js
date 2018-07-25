import sng4 from 'assets/images/carousel/banner.png';
import React, { PureComponent } from 'react';
import { Modal } from 'antd-mobile';
import Carousels from 'components/carousel';
import SButton from 'components/button';
import STab from '../components/tag';
import TabList from '../components/tag_list';
import InfoCard from '../components/info_card/index.js';
import BankContent from '../components/bank_content/index.js';

import style from './style.scss';

export default class HomePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: '2',
      isShowModal: false,
    };
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

  handleRepaymentTagClick = () => {
    console.log('还款Tag');
  };

  handleLendersTagClick = () => {
    console.log('放  款Tag');
  };

  render() {
    const { type } = this.state;
    const repaymentList = [
      {
        name: '30天',
        value: '30天',
      },
      {
        name: '3个月',
        value: '3个月',
      },
      {
        name: '7天(会员专属)',
        value: '7天(会员专属)',
      },
    ];
    const lendersList = [
      {
        name: '还款日前一天',
        value: '还款日前一天',
      },
      {
        name: '立即放款',
        value: '立即放款',
        style: {
          width: '2.07rem',
        },
      },
    ];
    return (
      <div className={style.home_page}>
        <Carousels data={[{ src: sng4, url: '' }, { src: sng4, url: '' }, { src: sng4, url: '' }]} />
        <div className={style.content_wrap}>
          {type === '1' && <InfoCard onClick={this.handleClickBack} />}
          {type === '2' && <BankContent onClick={this.handleClickBack} showModalFun={this.handleShowModal} />}
        </div>
        {type === '1' && <div className={style.tip_bottom}>怕逾期，用还到</div>}

        {/* 确认代还信息弹框 */}
        <Modal popup visible={this.state.isShowModal} onClose={this.handleCloseModal} animationType="slide-up">
          <div className={style.modal_content}>
            <button className={style.modal_cancel_btn} onClick={this.handleCloseModal}>
              取消
            </button>
            <h1 className={style.modal_title}>确认代还信息</h1>
            <ul className={style.modal_list}>
              <li className={style.list_item}>
                <div className={style.item_info}>
                  <label className={style.item_name}>代还金额</label>
                  <span className={style.item_value}>960.77</span>
                </div>
              </li>
              <li className={style.list_item}>
                <div className={style.item_info}>
                  <label className={style.item_name}>代还期限</label>
                  <TabList tagList={repaymentList} onClick={this.handleRepaymentTagClick} />
                </div>
                <p className={style.item_tip}>我们根据您信用卡账单情况为您推荐最佳代还金额和代还期限</p>
              </li>
              <li className={style.list_item}>
                <div className={style.item_info}>
                  <label className={style.item_name}>放款日期</label>
                  <TabList tagList={lendersList} onClick={this.handleLendersTagClick} />
                </div>
                <p className={style.item_tip}>选择还款日前一天（2018-7-12日）放款，将最大成本节 约您代资金</p>
              </li>
              <li className={style.list_item}>
                <div className={style.item_info}>
                  <label className={style.item_name}>还款银行卡</label>
                  <span className={style.item_value}>工商银行(2222)</span>
                </div>
              </li>
            </ul>
            <SButton onClick={this.handleCloseModal} className={style.modal_btn}>
              确定
            </SButton>
          </div>
        </Modal>
      </div>
    );
  }
}
