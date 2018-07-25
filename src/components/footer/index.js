import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
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

function TabItem(props) {
  const { data } = props;
  return (
    <NavLink replace to={data.url} key={data.url} className={styles.item}>
      <img src={window.location.pathname === data.url ? data.icon : data.icon_not} alt="" />
      <div
        className={styles.title}
        style={{ color: window.location.pathname === data.url ? data.color : data.color_not }}
      >
        {data.title}
      </div>
    </NavLink>
  );
}

function TabBarList(props) {
  const { tabList } = props;
  if (tabList.length === 0) {
    return null;
  }
  let tabBarBottom = null;
  tabBarBottom = tabList.map(item => <TabItem key={item.url ? item.url : new Date().getTime()} data={item} />);
  return tabBarBottom;
}

export default class Footer extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    footerProps: PropTypes.object,
  };

  static defaultProps = {
    footerProps: {
      footerHide: true,
    },
    data: [
      {
        title: '首页',
        url: '/login',
        icon: sng1,
        icon_not: sng2,
        color: '#6A6D70',
        color_not: '#CECFD3',
      },
      {
        title: '账单',
        url: '/example/button/',
        icon: sng1,
        icon_not: sng2,
        color: '#6A6D70',
        color_not: '#CECFD3',
      },
      {
        title: '我的',
        url: '/mine/mine_page',
        icon: sng3,
        icon_not: sng4,
        color: '#6A6D70',
        color_not: '#CECFD3',
      },
    ],
  };

  render() {
    let { data, footerProps } = this.props;
    const { footerHide } = footerProps;
    return footerHide ? null : <div className={styles.footer}>{<TabBarList tabList={data} />}</div>;
  }
}
