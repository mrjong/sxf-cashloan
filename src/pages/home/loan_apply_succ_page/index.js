import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import successIco from 'assets/images/mine/wallet/success_ico.png';
import ButtonCustom from 'components/ButtonCustom';
import { setBackGround } from 'utils/background'
import { store } from 'utils/store';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const API = {
  
}
@fetch.inject()
@setBackGround('#fff')
export default class loan_apply_succ_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      copyText: '还到'
    }
  }

  componentWillMount() {
    
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
    
  }

  copyOperation = () => {
		this.props.toast.info('复制成功！马上打开微信关注“还到”');
	}

  render() {
    const { copyText } = this.state;
    return (
      <div className={style.credit_apply_succ_page}>
        <div className={style.content}>
          <img src={successIco} className={style.successIco} />
          <div className={style.desc}>
            <p>借款申请提交成功</p>
          </div>
          <div className={style.tip}>
            温馨提示：<br />
            您的借款等待审核中，请注意接听“010+86355xxx”审核电话，我们会尽快完成审核并以短信的形式通知您审核结果。
          </div>
        </div>
        <p className={style.btnTip}>*关注还到公众号 实时查看审核进度</p>
        <CopyToClipboard
					text={copyText}
          onCopy={() => this.copyOperation()}
				>
          <ButtonCustom className={style.backBtn}>关注“还到”公众号</ButtonCustom>
        </CopyToClipboard>
        <p className='bottomTip'>怕逾期，用还到</p>
      </div>
    );
  }
}
