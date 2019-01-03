import React from 'react';
import styles from './index.scss';

import { Button } from 'antd-mobile';
export default class CountDownButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timerCount: this.props.timerCount || 60,
      startTitle: this.props.startTitle || '获取验证码',
      counting: false,
      selfEnable: true,
    };
  }

  countDownAction = () => {
    const codeTime = this.state.timerCount;
    const { timerActiveTitle, startTitle='获取验证码', againTitle = '重新获取' } = this.props;
    const now = Date.now();
    const overTimeStamp = now + codeTime * 1000 + 100;
    /*过期时间戳（毫秒） +100 毫秒容错*/
    this.interval = setInterval(() => {
      /* 切换到后台不受影响*/
      const nowStamp = Date.now();
      if (nowStamp >= overTimeStamp) {
        /* 倒计时结束*/
        this.interval && clearInterval(this.interval);
        this.setState({
          timerCount: codeTime,
          startTitle: againTitle,
          counting: false,
          selfEnable: true,
        });
        if (this.props.timerEnd) {
          this.props.timerEnd();
        }
      } else {
        let leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
        leftTime = leftTime < 10 ? `0${leftTime}` : leftTime
        let activeTitle = `重新获取(${leftTime}s)`;
        if (timerActiveTitle) {
          if (timerActiveTitle.length > 1) {
            activeTitle = timerActiveTitle[0] + leftTime + timerActiveTitle[1];
          } else if (timerActiveTitle.length > 0) {
            activeTitle = timerActiveTitle[0] + leftTime;
          }
        }
        this.setState({
          timerCount: leftTime,
          startTitle: activeTitle,
        });
      }
    }, 1000);
  }

  shouldStartCountting = shouldStart => {
    if (this.state.counting) {
      return;
    }
    if (shouldStart) {
      this.countDownAction();
      this.setState({ counting: true, selfEnable: false });
    } else {
      this.setState({ selfEnable: true });
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { enable, className } = this.props;
    const { counting, startTitle, selfEnable } = this.state;
    return (
      <Button
        size="small"
        type="primary"
        disabled={counting}
        onClick={() => {
          if (!counting && enable && selfEnable) {
            // this.setState({ selfEnable: false });
            this.props.onClick(this.shouldStartCountting);
          }
        }}
        className={`${styles.count_container} ${className}`}
      >
        <span>{startTitle}</span>
      </Button>
    );
  }
}
