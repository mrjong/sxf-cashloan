import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import style from './index.scss';
import fetch from 'sx-fetch';
import STabs from 'components/tabs';
import { store } from 'utils/store';

import { PullToRefresh, Badge, ListView, Toast } from 'antd-mobile';
let totalPage = false;
const API = {
  msgRead: '/my/msgRead',
  msgCount: '/my/msgCount',
  defTable: '/my/defTable',
  msgInfo: '/my/msgInfo',
};
@fetch.inject()
export default class message_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [
        { title: <Badge>活动通知</Badge> },
        { title: <Badge>系统通知</Badge> },
        { title: <Badge>公告通知</Badge> },
      ],
    };
  }
  render() {
      return(<div>222</div>)
  }
}
