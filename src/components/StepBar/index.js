import React, { Component } from 'react'
import { Steps } from 'antd-mobile';
import style from './index.scss'

export default class StepBar extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { current } = this.props
    const Step = Steps.Step
    const steps = [{
      title: '基本信息',
    }, {
      title: '运营商认证',
    }, {
      title: '提交申请',
    }].map((s, i) => <Step key={i} title={s.title} icon={<i className={[style.stepIcon, i < current ? style.stepActive : ''].join(' ')}>{i + 1}</i>} />);
    return (
      <div className={style.stepWrapper}>
        <Steps direction="horizontal" current={current-1}>{steps}</Steps>
      </div>
    )
  }
}