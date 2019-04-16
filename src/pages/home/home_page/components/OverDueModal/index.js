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

  downloadFile = () => {

  }

  render() {
    const { handleClick } = this.props;
    return (
      <Modal className="overDueModalBox" visible={true} transparent maskClosable={false}>
        <div>
          <img className={style.warningImg} src={overDueImg} />
          <h3 className={style.overDueTit}>信用风险提醒</h3>
          <p className={style.overDueDesc}>您的逾期记录已经报送至央行监管的征信机构，未来会影响银行及金融类借款申请，请尽快还款，维护信用。</p>
          <SXFButton onClick={handleClick}>我知道了，前去还款</SXFButton>
          <p className={style.download} onClick={this.downloadFile}>立即下载裁决书</p>
        </div>
      </Modal>
    );
  }
}
