import React from 'react';
import fetch from 'sx-fetch';
import style from './index.scss';
import overDueImg from 'assets/images/home/overDue_icon.png';
import SXFButton from 'components/ButtonCustom';
import { store } from '../../../../../utils/store';
import { Modal } from 'antd-mobile';

const API = {};

@fetch.inject()
export default class OverDueModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  componentWillMount() {
    
  }

  render() {
    const { count } = this.props;
    return (
      <Modal className="overDueModal" visible={true} transparent maskClosable={false}>
        <div>
          <img src={overDueImg} />
          <h3 className={style.overDueTit}>信用风险提醒</h3>
          <p>您的逾期记录已经报送至央行监管的征信机构，未来会影响银行及金融类借款申请，请尽快还款，维护信用。</p>
          <SXFButton onClick={this.handleOverDueClick}>我知道了，前去还款</SXFButton>
        </div>
      </Modal>
    );
  }
}
