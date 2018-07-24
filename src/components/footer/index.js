import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import sng1 from 'assets/images/footer/home.png';
import sng2 from 'assets/images/footer/home-not.png';
import sng3 from 'assets/images/footer/mine.png';
import sng4 from 'assets/images/footer/mine-not.png';
import styles from './index.scss';

/*
* 接收一个配置文件数组
* parms: {
*   icon: 激活时icon
*   icon_not: 未激活时icon
*   title: 相应icon描述文字
*   color: 激活时文字描述颜色
*   color-not: 未激活时文字描述颜色
* }
*
* */
export default class Footer extends React.Component {
  static propTypes = {
    data: PropTypes.array,
  };

  static defaultProps = {
    data: [
      {
        title: '首页',
        url: '/',
        icon: sng1,
        icon_not: sng2,
        color: '#6A6D70',
        color_not: '#CECFD3',
      },
      {
        title: '账单',
        url: '/bill',
        icon: sng1,
        icon_not: sng2,
        color: '#6A6D70',
        color_not: '#CECFD3',
      },
      {
        title: '我的',
        url: '/zhang',
        icon: sng3,
        icon_not: sng4,
        color: '#6A6D70',
        color_not: '#CECFD3',
      },
    ],
  };

  click_tab = url => {
    this.props.history.replace(url)
  };

  render() {
    let { data } = this.props;

    return (
      <div className={styles.footer}>
        {data.map((res, key) => (
          <div
            key={key}
            className={styles.item}
            onKeyDown={() => {
              this.click_tab(res.url);
            }}
            onClick={() => {
              this.click_tab(res.url);
            }}
          >
            <img src={window.location.pathname === res.url ? res.icon : res.icon_not} alt="" />
            <div
              className={styles.title}
              style={{ color: window.location.pathname === res.url ? res.color : res.color_not }}
            >
              {res.title}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
