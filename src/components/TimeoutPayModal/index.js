import React from 'react';
import { Modal, Icon } from 'antd-mobile';
import style from './index.scss';


export default class TimeoutPayModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTextarea: false,
    }
  }

  render() {
    const { visible, closeModal } = this.props;
    return (
      <Modal visible={visible} transparent wrapClassName="timeout_pay_modal">
        <Icon type='cross' className={style.arrow_icon} color='#86919D' onClick={closeModal} />
        <h3>审核超时赔</h3>
        <p>
          <strong>审核超时赔</strong>是指用户成功提交审核资料后，在还到承诺的审核时间内，未完成授信审核服务，借款还信用卡用户将获得相应的超时赔免息券。
        </p>
        <div>
          <h4>补偿说明</h4>
          <ul>
            <li>1、预计最快90秒完成审核，高峰期最高可能需要5分钟。</li>
            <li>2、承诺的时间即超过审核高峰期的时间5分钟，则进行红包补偿，50元免息券。</li>
            <li>3、审核超时，免息券会自动发放至我的账户，可在【我的】-【优惠券】中查看。</li>
          </ul>
        </div>
      </Modal>
    );
  }
}
