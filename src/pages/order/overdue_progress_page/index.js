import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import fetch from "sx-fetch";
import { store } from 'utils/store';
import { setBackGround } from 'utils/background';
import styles from './index.scss';

const API = {
  qryDtl: "/bill/qryDtl",
  payback: '/bill/payback',
  couponCount: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
  protocolSms: '/withhold/protocolSms', // 校验协议绑卡
  protocolBind: '/withhold/protocolBink', //协议绑卡接口
  fundPlain: '/fund/plain', // 费率接口
  payFrontBack: '/bill/payFrontBack', // 用户还款新接口
}
@fetch.inject()
@setBackGround('#FFF')

export default class overdue_progress_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      progressList: [
        {
          date: '2019-04-05',
          time: '11:43:12',
          content: '账单已逾期',
          isActive: true,
        },
        {
          date: '2019-04-05',
          time: '11:43:12',
          content: '逾期记录即将上报百行征信',
          isActive: true,
        },
        {
          date: '2019-04-05',
          time: '11:43:12',
          content: '逾期记录已经上报百行征信',
          isActive: true,
        },
        {
          date: '2019-04-05',
          time: '11:43:12',
          content: '逾期记录申请上报人行征信',
          isActive: true,
        },
        {
          date: '2019-04-05',
          time: '',
          content: '即将向仲裁委申请仲裁',
          isActive: false,
        },
        {
          date: '2019-04-05',
          time: '',
          content: '已申请仲裁处理',
          isActive: false,
        },
        {
          date: '2019-04-05',
          time: '',
          content: '仲裁申请受理中',
          isActive: false,
        },
        {
          date: '2019-04-05',
          time: '',
          content: '裁决书已下发，请尽快下载',
          isActive: false,
        },
        {
          date: '2019-04-05',
          time: '',
          content: '仲裁执行中',
          isActive: false,
        },
      ]
    }
  }
  componentWillMount() {
    let test = store.getOrderSuccess()
    if (test) {
      let orderSuccess = test
      this.setState({
        orderSuccess
      })
    }
  }

  // 返回账单详情
  backOrderDtl = () => {
    this.props.history.goBack()
  }

  render() {
    const { progressList } = this.state;
    return (
      <div className={styles.overdue_progress_page}>
        {
          progressList && progressList.length ?
          <ul className={styles.progress_list}>
            {
              progressList.map((item, index) => {
                return (
                  <li key={index} className={item.isActive ? styles.active : null}>
                    <p className={styles.dateTimeBox}>
                      <span className={styles.dateBox}>{item.date}</span>
                      <span>{item.time}</span>
                    </p>
                    <p className={styles.desc}>{item.content}</p>
                    <i className={styles.arrow} />
                    <i className={styles.stepItem} />
                    {
                      index !== 0 && <i className={styles.lineItem} />
                    }
                  </li>
                )
              })
            }
          </ul>
          : null
        }
        <ButtonCustom onClick={this.backOrderDtl} className={styles.back_btn}>立即还款</ButtonCustom>        
      </div>
    )
  }
}

