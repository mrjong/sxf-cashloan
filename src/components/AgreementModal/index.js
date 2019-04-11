import React, { PureComponent } from 'react';
import IframeProtocol from 'components/IframeProtocol'
import style from './index.scss'

export default class AgreementModal extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { readAgreementCb, isRead } = this.props
    return (
      <div>
        {
          !isRead && <div>
            <div className={style.mask} />
            <div className={style.modal_outer_wrap}>
              <div className={style.modal_inner_wrap}>
                <IframeProtocol
                  name='privacy_agreement_page'
                />
              </div>
              <div className={style.button} onClick={readAgreementCb}>我已阅读</div>
            </div>
          </div>
        }
      </div>
    )
  }
}