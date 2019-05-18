import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import qs from 'qs';

import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
const API = {
  USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口
  USER_IMPORT: '/auth/cardAuth'
};
let timerPercent = null;
let timer = null;
let data = [
  { desc: '正在建立安全链接', status: '连接中', percent: 24, speed: 200},
  { desc: '正在登陆银行', status: '登录中', percent: 49, speed: 400 },
  { desc: '正在获取银行卡信息', status: '获取中', percent: 74, speed: 800},
  { desc: '正在分析账单流水', status: '处理中', percent: 99, speed: 0},
]
@fetch.inject()
@setBackGround('#fff')
export default class crawl_progress_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      percentArray: [
        {percent: 24, speed: 200},
        {percent: 49, speed: 400},
        {percent: 74, speed: 800},
        {percent: 99, speed: 0}
      ],
      time: 0,
      isFail: false,
      apiStatus: false,
      usrIndexInfo: {}
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
    this.goProgress(20)
    this.goTime()
    this.queryUsrInfo()
  }

  goTime(){
    timer = setInterval(()=>{
      this.setState({
        time: this.state.time + 1
      },()=>{
        if(this.state.time> 29){
          clearInterval(timerPercent)
          clearInterval(timer)
          if(!this.state.apiStatus){
            this.setState({ isFail: true })
            data[3].status = '失败'
          }
        } else if (this.state.time % 5 === 0) {
          this.queryUsrInfo()
        }
      })
    }, 1000)
  }
  goProgress(number) {
    timerPercent = setInterval(()=>{
      let { percent } = this.state
      this.setState({
        percent: percent + 1,
      },()=>{
        if(number===10){
          this.successGetBankInfo()
          return
        }
        data.forEach(item=>{
          if(percent=== item.percent){
            clearInterval(timerPercent)
            item.status = '完成'
            item.speed !== 0 && this.goProgress(item.speed)
          }
        })
      })
    }, number)
  }
  successGetBankInfo(){
    let { percent } = this.state
    data.forEach(item=>{
      if(percent === item.percent){
        item.status = '完成'
      }
    })
    if(percent > 99){
      clearInterval(timerPercent)
      setTimeout(()=>{this.props.history.replace('/mine/credit_list_page')}, 300)
    }
  }
  //查询用户相关信息
  queryUsrInfo = () => {
    this.props.$fetch
      .post(API.USR_INDEX_INFO)
      .then((res) => {
        this.setState(
          {
            usrIndexInfo: res.data.indexData ? res.data : Object.assign({}, res.data, { indexData: {} })
          },
          () => {
            const { indexSts, indexData } = this.state.usrIndexInfo;
            if (indexSts === 'LN0002' || (indexSts === 'LN0003' && indexData.autSts === '1')) {
              //更新中
              return false
            } else if (indexSts === 'LN0010' || (indexSts === 'LN0003' && indexData.autSts === '3')) {
              //更新失败
              return false
            } else if (indexSts === 'LN0003' && indexData.autSts === '2') {
              //更新成功
              this.setState({apiStatus: true},()=>{
                clearInterval(timerPercent)
                clearInterval(timer)
                this.goProgress(10)
              })
            }
          }
        );
      })
      .catch((err) => {
        this.hideProgress();
        this.state.retryCount--;
        this.setState({
          showAgainUpdateBtn: true
        });
      });
  };

  reImport() {
    this.props.$fetch
      .get(API.USER_IMPORT)
      .then((res) => {
        if(res.data > 3){
          this.props.history.replace('/home/crawl_fail_page')
        } else {
          this.props.history.reload()
        }
      }).catch(err=>{
    })
  }

  componentWillUnmount() {
    clearInterval(timer);
    clearInterval(timerPercent);
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
