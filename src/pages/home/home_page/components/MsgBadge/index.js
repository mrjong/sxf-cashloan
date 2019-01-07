import React from 'react';
import fetch from 'sx-fetch';
import style from './index.scss';
import iconMsg from 'assets/images/home/icon_msg.png';
import { store } from '../../../../../utils/store';

const API = {
  MSG_COUNT: '/my/msgCount', // h5-查询未读消息总数
  queryUsrSCOpenId: '/my/queryUsrSCOpenId', // 用户标识
};

@fetch.inject()
export default class MsgBadge extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }

  componentWillMount() {
    this.requestMsgCount();
     // 登录埋点
     this.queryUsrSCOpenId()
  }
    // 用户标识
    queryUsrSCOpenId = () =>{
        if(!store.getQueryUsrSCOpenId()){
            this.props.$fetch.get(API.queryUsrSCOpenId).then((res)=>{
                console.log(res)
                if(res.msgCode==='PTM0000'){
                  sa.login(res.data);
                  store.setQueryUsrSCOpenId(res.data)
                }
            })
        }
    }

  // 获取 未读消息条数 列表
  requestMsgCount = () => {
    this.props.$fetch.post(API.MSG_COUNT, null, { hideLoading: true }).then(result => {
      if (result && result.msgCode === 'PTM0000' && result.data !== null) {
        this.setState({
          count: result.data.count,
        });
      } else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };
  jumpToMsg = () => {
    window.ReactRouterHistory.push('/home/message_page')
  }

  render() {
    const { count } = this.state;
    return (
      <div onClick = {this.jumpToMsg} className={style.msg_badge_wrap}>
        <div className={style.msg_badge_content} style={{ margin: count > 0 ? '.17rem -.17rem 0 0' : '0' }}>
          <img className={style.msg_badge_icon} src={iconMsg} alt="" />
          {count > 0 ? <span className={style.msg_badge_text}>{count > 99 ? '99+' : count}</span> : null}
        </div>
      </div>
    );
  }
}
