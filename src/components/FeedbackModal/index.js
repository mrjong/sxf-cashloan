import React from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';
import { Icon } from 'antd-mobile'


export default class FeedbackModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,

    }
  }
  componentWillMount() {
    
  }

  goInterBank = () => {

  }

  goOperator = () => {

  }

  goFeedback = () => {

  }

  closeModal=()=>{
    
  }

  render() {
    // const { closeActivityModal, modalType, activityModalBtn, modalBtnFlag } = this.props;
    return (
      <Modal wrapClassName="feedback_modal" visible={this.state.showModal} transparent>
        <div>
          <Icon type='cross' className={style.arrow_icon} color='#86919D' onClick={this.closeModal} />

          <h3>你申请借钱还信用卡遇到了困难？</h3>
          <p>可以尝试以下方法解决：</p>
          <ul>
            <li className={style.button_item} onClick={this.goOperator}>去查询、修改<em>运营商</em>服务密码</li>
            <li className={style.button_item} onClick={this.goInterBank}>去找回网银密码</li>
            <li className={style.button_item} onClick={this.goFeedback}>其他问题</li>
          </ul>
        </div>
      </Modal>
    );
  }
}