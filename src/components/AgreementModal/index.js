import React, { PureComponent } from 'react';
import IframeProtocol from 'components/IframeProtocol'
import style from './index.scss'

export default class AgreementModal extends PureComponent {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    document.body.addEventListener('touchmove', (e) => {
      e.preventDefault()
    }, { passive: false })
  }

  render() {
    const { readAgreementCb, visible } = this.props
    return (
      <div>
        {
          visible && <div>
            <div className={style.mask} />
            <div className={style.modal_outer_wrap}>
              <div className={style.title}>随行付用户隐私权政策</div>
              <div className={style.modal_inner_wrap}>
                <IframeProtocol name='privacy_agreement_page' />
              </div>
              <div className={style.button} onClick={readAgreementCb}>我已阅读</div>
            </div>
          </div>
        }
      </div>
    )
  }
}