import React from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';
import { Icon,TextareaItem } from 'antd-mobile'

export default class FeedbackModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTextarea: false
    }
  }
  
  componentWillMount() {

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

  render() {
    const { visible } = this.props;
    return (
      <Modal wrapClassName="feedback_modal" visible={visible} transparent>
        <div>
          <Icon type='cross' className={style.arrow_icon} color='#86919D' onClick={this.closeModal} />
          <h3>你申请借钱还信用卡遇到了困难？</h3>
          {
            this.state.showTextarea ? <div>
              <TextareaItem
                onChange={(v)=>{
                  console.log(v)
                }}
                rows={5}
                count={24}
              />
              <div className='submit_btn'>提交</div>
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