import React, { PureComponent } from 'react';
import { Progress, Steps, Icon, InputItem, List } from 'antd-mobile';
import style from './index.scss'
import fetch from 'sx-fetch';
import ZButton from 'components/ButtonCustom';
import dayjs from 'dayjs'
import { createForm } from 'rc-form';
import AsyncCascadePicker from 'components/AsyncCascadePicker'
import { setBackGround } from 'utils/background'
import { store } from 'utils/store'

const API = {
  queryBillStatus: '/wap/queryBillStatus', //
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
  CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
  USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口

}
let timer = null
@fetch.inject()
@createForm()
@setBackGround('#fff')
export default class loan_repay_confirm_page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      usrIndexInfo: {},
      activeTag: 0,
      isShowProgress: false,
      percent: 0,
      time: 0,
      retryCount: 3,
      showAgainUpdateBtn: false, // 重新获取账单按钮是否显示
      overDt: '', //还款日
      billDt: '', //账单日
      cardBillAmt: '' //最低还款
    }
  }

  componentDidMount() {
    this.queryBillStatus()
    this.queryUsrInfo()
  }

  componentWillUnmount() {
    clearInterval(timer)
  }

  startInterval = () => {
    timer = setInterval(() => {
      this.setState({
        percent: this.state.percent + parseInt(Math.random() * 10 + 1),
        time: this.state.time + 1
      }, () => {
        if (this.state.time === 5) {
          console.log(this.state.time)
          clearInterval(timer)
          this.queryBillStatus()
        }
        if (this.state.time > 8) {
          this.state.retryCount--


          clearInterval(timer)
          console.log(this.state.time)
          this.queryBillStatus(true)
        }
      })
    }, 1000)
  }

  queryUsrInfo = () => {
    this.props.$fetch.post(API.USR_INDEX_INFO).then(res => {
      console.log(res)
      this.setState({
        usrIndexInfo: res.data.indexData
          ? res.data
          : Object.assign({}, res.data, { indexData: {} })
      });
    }).catch(err => {
      console.log(err)
    })

  }

  queryBillStatus = (hide) => {
    let apiTimeOut1 = setTimeout(() => {
      if (hide) {
        this.hideProgress()
        this.setState({
          showAgainUpdateBtn: true
        })
      } else {
        this.showProgress()
      }
      clearInterval(apiTimeOut1)
    }, 1000)

    // this.props.$fetch.post(API.queryBillStatus,{}).then(res=>{
    //   if(res.code==='PTM0000'){
    //     this.hideProgress()
    //   }
    // }).catch(err=>{
    //   console.log(err)
    // })
  }

  queryBillStatus1 = () => {
    let apiTimeOut = setTimeout(() => {
      this.hideProgress()
      clearInterval(apiTimeOut)
    }, 5000)
  }

  showProgress = () => {
    this.setState({
      isShowProgress: true
    }, () => {
      this.startInterval()
    })
  }

  hideProgress = () => {
    this.setState({
      percent: 100
    }, () => {
      clearInterval(timer)
      let timer2 = setTimeout(() => {
        if (this.state.retryCount === 0) {
          this.props.toast.info('账单更新失败')
          this.setState({
            showAgainUpdateBtn: false
          })
        }
        this.setState({
          isShowProgress: false,
          percent: 0,
          time: 0
        })
        clearTimeout(timer2)
      }, 1000)
    })
  }

  updateBill = () => {
    this.showProgress()
  }

  goMoxieBankList = () => {
    this.props.history.push('/home/moxie_bank_list_page')
  }

  toggleTag = (idx) => {
    this.setState({
      activeTag: idx
    })
  }

  // 代还其他信用卡点击事件
  repayForOtherBank = (count) => {
    if (count > 1) {
      store.setBackUrl('/home/loan_repay_confirm_page');
      // const { contentData } = this.props;
      this.props.history.push({
        pathname: '/mine/credit_list_page',
        // search: `?autId=${contentData.indexSts === 'LN0010' ? '' : contentData.indexData.autId}`
      });
    } else {
      this.goMoxieBankList()
    }
  }

  // 请求信用卡数量
  requestCredCardCount = () => {
    this.props.$fetch
      .post(API.CRED_CARD_COUNT)
      .then((result) => {
        if (result && result.msgCode === 'PTM0000') {
          this.repayForOtherBank(result.data.count);
        } else {
          this.props.toast.info(result.msgInfo);
        }
      })
      .catch((err) => {
        this.props.toast.info(err.message);
      })
  }

  handleSubmit = () => {

  }

  render() {
    const { isShowProgress, percent, showAgainUpdateBtn, usrIndexInfo, activeTag } = this.state
    const { overDt, billDt, cardBillAmt, cardNoHid, bankNo, bankName } = usrIndexInfo
    const { getFieldDecorator } = this.props.form
    const iconClass = bankNo ? `bank_ico_${bankNo}` : 'logo_ico'
    let overDtStr = ''
    if (overDt > 0) {
      overDtStr = `<span class="blod">${overDt}</span>天 后到期`
    } else if (parseInt(overDt, 10) === 0) {
      overDtStr = '<span class="blod">今天到期</span>'
    } else if (overDt < 0) {
      overDtStr = `<span class="blod">已到期</span>`
    } else {
      overDtStr = `<span class="blod">--</span>天`
    }
    const billDtData = !billDt ? '----/--/--' : dayjs(billDt).format('YYYY/MM/DD');
    const cardBillAmtData = !cardBillAmt ? '----.--' : parseFloat(cardBillAmt, 10).toFixed(2);
    // const Step = Steps.Step
    // const steps = [{
    //   title: '111',
    // }, {
    //   title: '222',
    // }, {
    //   title: '333',
    // }].map((s, i) => <Step key={i} title={s.title} icon={<i className={[style.stepIcon, i < 2 ? style.stepActive : ''].join(' ')}>{i + 1}</i>} />);
    const tagList = [{
      name: '全额还款',
      value: 1
    }, {
      name: '最低还款',
      value: 2
    }, {
      name: '部分还款',
      value: 3
    }]
    return (
      <div className={style.pageWrapper}>
        <div className={style.bankCard}>
          <div className={style.top}>
            <div>
              <span className={['bank_ico', iconClass, `${style.bankLogo}`].join(' ')} />
              <span className={style.name}>{!bankName ? '****' : bankName}</span>
              <span className={style.lastNo}>{!cardNoHid ? '****' : cardNoHid.slice(-4)}</span>
            </div>
            {
              isShowProgress ? <div className={style.progressWrap}>
                <span className={style.percentTitle}>账单导入中 <em className={style.percentNum}>{percent}%</em></span>
                <Progress percent={percent} position="normal" />
              </div> : showAgainUpdateBtn ? <span onClick={this.updateBill} className={style.updateButton}>重新更新</span>
                  : <span onClick={this.goMoxieBankList} className={style.updateButton}>更新账单</span>
            }
          </div>
          <div className={style.center}>
            <p className={style.billTitle}>账单金额(元)</p>
            <strong className={style.billMoney}>13200.55</strong>
            <div className={style.billInfo}>
              <div className={style.item}>
                <span className={style.value}></span>
                <span className={style.name}>最低还款</span>
              </div>
              <div className={style.item}>
                <span className={style.value}>{billDtData}</span>
                <span className={style.name}>账单日</span>
              </div>
              <div className={style.item}>
                <span className={style.value} dangerouslySetInnerHTML={{ __html: overDtStr }}></span>
                <span className={style.name}>还款日</span>
              </div>
            </div>
          </div>
          <div className={style.bottom} onClick={this.requestCredCardCount}>
            <span>代还其他信用卡</span>
            <Icon type='right' color='#C5C5C5' className={style.rightArrow} />
          </div>
        </div>
        <div className={style.tagList}>
          {
            tagList.map((item, idx) => (
              <span key={idx} className={[style.tagButton, activeTag === idx && style.activeTag].join(' ')} onClick={() => {
                this.toggleTag(idx)
              }}>{item.name}</span>
            ))
          }
        </div>
        <div>
          {getFieldDecorator('address', {
            rules: [{ required: true, message: '请输入常住地址' }, { validator: this.validateAddress }],
            onChange: (value) => {
              // 本地缓存常住地址
              store.setAddress(value);
              this.setState({ address: value });
            }
          })(
            <InputItem
              placeholder="1234.09"
              type="number"
              // onBlur={(v) => {
              //   this.inputOnBlur(v, 'resident_address');
              // }}
              // onFocus={(v) => {
              //   this.inputOnFocus(v, 'resident_address');
              // }}
              className={style.label}
            >
              帮你还多少(元)
						</InputItem>
          )}
        </div>
        <div>
          {getFieldDecorator('loanDate', {
            initialValue: this.state.relatValue,
            rules: [{ required: true, message: '请选择借款期限' }],
            onChange: (value, label) => {

            }
          })(
            <AsyncCascadePicker
              loadData={[
                // () =>
                //   this.props.$fetch.get(`${API.getRelat}/2`).then((result) => {
                //     const prov = result && result.data && result.data.length ? result.data : [];
                //     return prov.map((item) => ({ value: item.key, label: item.value }));
                //   })
              ]}
              cols={1}
              onVisibleChange={(bool) => {

              }}
            >
              <List.Item className={style.label}>借多久</List.Item>
            </AsyncCascadePicker>
          )}
        </div>
        <ZButton onClick={this.handleSubmit} className={style.confirmApplyBtn}>提交申请</ZButton>

        {/* <Steps direction="horizontal" current={1}>{steps}</Steps> */}
        <div className={style.bottomTip}>怕逾期，用还到</div>
      </div>
    )
  }
}