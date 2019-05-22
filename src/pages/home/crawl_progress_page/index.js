import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';

import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
const API = {
  CHECK_CARD_AUTH: '/auth/checkCardAuth/', // 0103-首页信息查询接口
  USER_IMPORT: '/auth/cardAuth',
	CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
};
let timerPercent ;
let timers = 0;
let arr = [];
let data ;
@fetch.inject()
@setBackGround('#fff')
export default class crawl_progress_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,   //百分比
      isFail: false,   //失败显露标志
      autId : store.getAutId ? store.getAutId() : ''
    };
  }

  componentWillMount() {
    timers = 0;
    arr = [];
    timerPercent = null;
    data =  [
      { desc: '正在建立安全链接', status: '连接中', percent: 24, speed: 200, statusInit: '连接中'},
      { desc: '正在登陆银行', status: '登录中', percent: 49, speed: 400, statusInit: '登录中' },
      { desc: '正在获取银行卡信息', status: '获取中', percent: 74, speed: 800 , statusInit: '获取中'},
      { desc: '正在分析账单流水', status: '处理中', percent: 98, speed: 0, statusInit: '处理中'},
    ]
  }

  componentDidMount() {
    this.goProgress(20)
    this.queryUsrInfo()
  }
  goProgress(number, cb) {
    let temp = true
    timerPercent = setInterval(()=>{
      let { percent } = this.state
      if(percent > 99) {
        let percentCount = store.getPercentCount() ? store.getPercentCount() : 0
        store.setPercentCount(1+ percentCount);
        if(store.getPercentCount()>2){
          this.props.history.replace('/home/crawl_fail_page')
        }
      }
      if(!temp){
        timers = number + timers
      }
      if(timers > 30000){
        clearInterval(timerPercent)
        this.goProgress(10, ()=>{
          data[3].status = '失败'
          this.setState({ isFail: true })
        })
      } else if (parseInt(timers / 5000) >= 1 && arr.indexOf(parseInt(timers / 5000)) === -1) {
        this.queryUsrInfo(timers)
        arr.push(parseInt(timers / 5000))
      }
      temp = false
      this.setState({
        percent: percent ===100 ? percent : percent + 1,
      },()=>{
        if(number===10){
          let tem = false ;
          data.forEach((item)=>{
            if( item.percent <= percent ){
              item.status = '完成' ;
            } else if(item.percent > percent){
              if(!tem){
                item.status = item.statusInit ;
              } else {
                item.status = '等待' ;
              }
              tem= true
            }
          })
          tem = 0
          if(percent > 99) {clearInterval(timerPercent)
            cb()
          }
        } else {
          let tem = false ;
          data.forEach((item)=>{
            if( item.percent < percent ){
              item.status = '完成' ;
            }else if(percent === item.percent){
              item.status = '完成' ;
              clearInterval(timerPercent)
              item.speed !== 0 && this.goProgress(item.speed)
            } else if(item.percent > percent){
              if(!tem){
                item.status = item.statusInit ;
              } else {
                item.status = '等待' ;
              }
              tem= true
            }
          })
          tem = 0
        }
      })
    }, number)
  }
  //查询用户相关信息
  queryUsrInfo = (times) => {
    let {autId} = this.state
    this.props.$fetch
      .get(API.CHECK_CARD_AUTH+ autId)
      .then((res) => {
        if (res.msgCode === "PTM0000") {
          if (res.data.autSts === '02') {
            clearInterval(timerPercent)
            this.goProgress(10,()=>{
              this.requestCredCardCount(res.data && res.data.bizId)
            })
          } else if(res.data.autSts === '03'){
            this.props.history.replace('/home/crawl_fail_page')
          }
        } else {
          clearInterval(timerPercent)
          this.goProgress(10, ()=>{
            data[3].status = '失败'
            this.setState({ isFail: true })
          })
          res.msgInfo && this.props.toast.info(res.msgInfo)
        }
      }
    ).catch((err) => {
      clearInterval(timerPercent)
      this.goProgress(10, ()=>{
        data[3].status = '失败'
        this.setState({ isFail: true })
      })
      err.msgInfo && this.props.toast.info(err.msgInfo)
    });
  };

  requestCredCardCount = (autId) => {
    this.props.$fetch
      .post(API.CRED_CARD_COUNT)
      .then((result) => {
        if (result && result.msgCode === 'PTM0000') {
          if(result.data.count> 1){
            this.props.history.replace(`/mine/credit_list_page?autId=${autId}`)
          } else {
            this.props.history.replace('/home/loan_repay_confirm_page')
          }
        } else {
          this.props.toast.info(result.msgInfo);
        }
      })
      .catch((err) => {
        this.props.toast.info(err.message);
      });
  };

  reImport() {
    location.reload()
  }

  componentWillUnmount() {
    clearInterval(timerPercent);
    store.setPercentCount(null)
  }
  render() {
    let { percent, isFail } = this.state
    return (
      <div className={style.crawl_progress_page}>
        {
          !isFail ? <div className={style.title}>正在导入信用卡账单...<span>完成{percent}%</span></div>
           : <div className={style.title}>信用卡账单导入失败</div>
        }
        {
          data.map((item, key)=>{
            return (
              <div
                className={style.step_item}
                key={key} style={{color: item.status !== '完成' ? '#868E9E': '#121C32'}}>
                <span className={item.status !== '完成' ? style.icon_not : style.icon}></span>
                <span className={style.desc}>{item.desc}</span>
                <span className={style.status}
                      style={{color: item.status !== '失败' ? '': '#FE6666'}}>
                  {item.status}
                </span>
              </div>
            )
          })
        }
        {
          isFail && <div className={style.button} onClick={()=>{this.reImport()}}>尝试再次导入</div>
        }
      </div>
    );
  }
}
