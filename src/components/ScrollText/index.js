import React from 'react'
import style from './index.scss'
import { NoticeBar } from 'antd-mobile';

export default class ScrollText extends React.Component {
  render() {
    return (
      <div className={style.red_tip}>
        <NoticeBar marqueeProps={{ loop: true, leading: 1000, trailing: 1000, }} icon={null}>
          确定提交后，此卡将作为收款信用卡，若需要修改，请在下一个账单日后。
        </NoticeBar>
      </div>
    )
  }
}