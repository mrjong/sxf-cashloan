import React from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';
import { Icon, TextareaItem } from 'antd-mobile'
import fetch from 'sx-fetch';

const API = {
  feedback: '/question/save'
}

@fetch.inject()
export default class FeedbackModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTextarea: false,
      textareaVal: ''
    }
  }

  goInterBank = () => {
    this.props.history.push('/others/moxie_pwd_guide?moxieType=interbank')
  }

  goOperator = () => {
    this.props.history.push('/others/moxie_pwd_guide?moxieType=operator')
  }

  goFeedback = () => {
    this.setState({
      showTextarea: true
    })
  }

  feedbackSubmit = () => {
    if (!this.state.textareaVal) return
    this.props.$fetch.post(API.feedback, {
      val: this.state.textareaVal
    }).then(res => {
      if (res.msgCode === 'PTM0000') {
        this.props.toast.info('提交成功')
        setTimeout(()=>{
          this.props.closeModal()
        },2000)
      }
    })
  }

  render() {
    const { visible, closeModal } = this.props;
    return (
      <Modal wrapClassName="feedback_modal" visible={visible} transparent>
        <div>
          <Icon type='cross' className={style.arrow_icon} color='#86919D' onClick={closeModal} />
          <h3>你申请借钱还信用卡遇到了困难？</h3>
          {
            this.state.showTextarea ? <div>
              <TextareaItem
                onChange={(v) => {
                  this.setState({
                    textareaVal: v
                  })
                }}
                rows={5}
                count={24}
              />
              <div className={`${[`submit_btn ${!this.state.textareaVal && 'submit_btn_disabled'}`].join(' ')}`} onClick={this.feedbackSubmit}>提交</div>
            </div> : <div>
                <p>可以尝试以下方法解决：</p>
                <ul>
                  <li className={style.button_item} onClick={this.goOperator}>去查询、修改<em>运营商</em>服务密码</li>
                  <li className={style.button_item} onClick={this.goInterBank}>去找回网银密码</li>
                  <li className={style.button_item} onClick={this.goFeedback}>其他问题</li>
                </ul>
              </div>
          }
        </div>
      </Modal>
    );
  }
}