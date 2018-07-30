import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import fetch from 'sx-fetch';
import style from './index.scss';

const API = {
  MSG_COUNT: '/my/msgCount',
};

@fetch.inject()
export default class MsgBadge extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      count: 100,
    };
  }

  componentWillMount() {
    this.requestMsgCount();
  }

  // 获取 未读消息条数 列表
  requestMsgCount = () => {
    this.props.$fetch.post(API.MSG_COUNT).then(result => {
      if (result && result.code === '0000' && result.data !== null) {
        console.log(result);
      }
    });
  };

  render() {
    const { count } = this.state;
    return (
      <Link to='/home/message_page' className={style.msg_badge_wrap}>
        {count > 0 ? (
          <div className={style.msg_badge_content}>
            <img className={style.msg_badge_icon} src=" " alt="" />
            <span className={style.msg_badge_text}>{count > 99 ? '99+' : count}</span>
          </div>
        ) : null}
      </Link>
    );
  }
}
