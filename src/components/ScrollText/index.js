import React from 'react'
import style from './index.scss'

export default class ScrollText extends React.Component {
  render() {
    return (
      <div className={style.red_tip}>
        <div className={style.red_tip_text}>
          确定提交后，此卡将作为收款信用卡，若需要修改，请在下一个账单日后
				</div>
      </div>
    )
  }
}