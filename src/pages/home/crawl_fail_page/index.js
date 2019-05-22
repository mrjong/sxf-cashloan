import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import qs from 'qs';
import { Popover} from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import progressIcon from  './img/crawl.png'
const API = {

};

const Item = Popover.Item;

@fetch.inject()
@setBackGround('#fff')
export default class crawl_progress_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount() {

  }

  componentDidMount() {

  }
  componentWillUnmount() {
    store.removeAutId2();
  }
  render() {
    let {  } = this.state
    return (
      <div className={style.crawl_fail_page}>
        <img src={progressIcon} className={style.progress_icon}/>
        <div className={style.progress_desc}>
          资料收齐，只差添加需要还款的信用卡，
          <span>已完成98% </span>
          <span className={style.apply_success}> 申请成功</span>
        </div>
        <Popover
           visible='true'
           placement='bottom'
           disabled= 'true'
           overlay={[
             (<Item
               key="4"
               value="scan"
               data-seed="logId"
               disabled= 'true'
               style={{color: '#fff', fontSize: '0.28rem', opacity: 0.9}}>
               多次失败建议换张信用卡，已送您一张免息券
             </Item>),
           ]}
        >
          <div className={style.popover_inner}>信用卡账单导入失败</div>
        </Popover>
        <div className={style.button} onClick={()=>{
          store.setMoxieBackUrl('/home/home');
          this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
        }}>选择导入其他银行卡</div>
        <div style={{textAlign: 'center'}} onClick={()=>{
          this.props.history.replace('/home/crawl_progress_page')
        }}>尝试再次导入</div>
      </div>
    );
  }
}
