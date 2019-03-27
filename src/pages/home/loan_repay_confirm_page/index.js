import React, { PureComponent } from 'react';
import { Progress, Icon, InputItem, List } from 'antd-mobile';
import style from './index.scss';
import fetch from 'sx-fetch';
import ZButton from 'components/ButtonCustom';
import dayjs from 'dayjs';
import { createForm } from 'rc-form';
import AsyncCascadePicker from 'components/AsyncCascadePicker';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { getFirstError, handleClickConfirm, handleInputBlur } from 'utils';

const API = {
  queryBillStatus: '/wap/queryBillStatus', //
  qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
  CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
  CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
  USR_INDEX_INFO: '/index/usrIndexInfo' // 0103-首页信息查询接口
};
let timer = null;
@fetch.inject()
@createForm()
@setBackGround('#fff')
export default class loan_repay_confirm_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      usrIndexInfo: {},
      activeTag: 0, //激活的tag
      isShowProgress: false,
      percent: 0,
      loanMoney: '',
      time: 0,
      retryCount: 3,
      showAgainUpdateBtn: false, // 重新获取账单按钮是否显示
      overDt: '', //还款日
      billDt: '', //账单日
      cardBillAmt: '' //账单金额
    };
  }

  componentDidMount() {
    store.removeToggleMoxieCard();
    this.queryUsrInfo();
  }

  componentWillUnmount() {
    clearInterval(timer);
  }

  startInterval = () => {
    timer = setInterval(() => {
      this.setState(
        {
          percent: this.state.percent + parseInt(Math.random() * 10 + 1),
          time: this.state.time + 1
        },
        () => {
          if (this.state.time === 5) {
            clearInterval(timer);
            this.queryUsrInfo();
          }
          if (this.state.time > 8) {
            this.state.retryCount--;
            clearInterval(timer);
            this.queryUsrInfo(true);
          }
        }
      );
    }, 1000);
  };

  //查询用户相关信息
  queryUsrInfo = (hideFlag) => {
    this.props.$fetch
      .post(API.USR_INDEX_INFO)
      .then((res) => {
        this.setState(
          {
            usrIndexInfo: res.data.indexData ? res.data : Object.assign({}, res.data, { indexData: {} })
          },
          () => {
            // const { indexSts, indexData } = {
            //   indexSts: 'LN0003',
            //   indexMsg: '一键还卡',
            //   indexData: {
            //     autSts: '2', // 1 中, 2,成功  3失败  1更新中
            //     bankName: '招商银行',
            //     bankNo: 'ICBC',
            //     cardNoHid: '6785 **** **** 6654',
            //     cardBillDt: '2018-07-17',
            //     cardBillAmt: '786.45',
            //     overDt: '7'
            //   }
            // };
            const { indexSts, indexData } = this.state.usrIndexInfo
            if (indexSts === 'LN0002' || (indexSts === 'LN0003' && indexData.autSts === '1')) {
              //更新中
              if (hideFlag) {
                this.hideProgress();
                this.setState({
                  showAgainUpdateBtn: true // 显示 重新更新按钮
                });
              } else {
                this.showProgress();
              }
            } else if (indexSts === 'LN0010' || (indexSts === 'LN0003' && indexData.autSts === '3')) {
              //更新失败
              this.hideProgress();
              this.setState({
                showAgainUpdateBtn: false
              });
            } else if (indexSts === 'LN0003' && indexData.autSts === '2') {
              //更新成功
              this.hideProgress()
              this.setState({
                fetchBillSucc: true
              }, () => {
                this.toggleTag(0)
              })
            }
          }
        );
      })
      .catch((err) => {
        this.hideProgress()
        this.setState({
          showAgainUpdateBtn: true
        })
      });
  };

  showProgress = () => {
    this.setState(
      {
        isShowProgress: true
      },
      () => {
        this.startInterval()
      }
    )
  }

  //隐藏进度条
  hideProgress = () => {
    this.setState(
      {
        percent: 100
      },
      () => {
        clearInterval(timer);
        let timer2 = setTimeout(() => {
          if (this.state.retryCount === 0) {
            this.props.toast.info('账单更新失败');
            this.setState({
              showAgainUpdateBtn: false
            });
          }
          this.setState({
            isShowProgress: false,
            percent: 0,
            time: 0
          });
          clearTimeout(timer2);
        }, 1000);
      }
    )
  }

  //更新账单
  updateBill = () => {
    this.showProgress()
  }

  goMoxieBankList = () => {
    store.setToggleMoxieCard(true)
    store.setMoxieBackUrl(`/home/loan_repay_confirm_page`)
    this.props.history.push('/home/moxie_bank_list_page')
  }

  // 代还其他信用卡点击事件
  repayForOtherBank = (count) => {
    store.setToggleMoxieCard(true);
    if (count > 1) {
      store.setBackUrl('/home/loan_repay_confirm_page');
      const { usrIndexInfo } = this.state;
      this.props.history.push({
        pathname: '/mine/credit_list_page',
        search: `?autId=${usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId}`
      });
    } else {
      this.goMoxieBankList();
    }
  };

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
      });
  };

  handleSubmit = () => {
    if (!this.state.fetchBillSucc) {
      this.props.toast.info('账单正在更新中，请耐心等待哦');
      return;
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!/^\d+(\.\d{0,2})?$/.test(values.loanMoney)) {
          this.props.toast.info('请输入数字或两位小数');
          return;
        }
        //调用授信接口
        handleClickConfirm(this.props, {
          ...this.state.selectedLoanDate,
          rpyAmt: Number(values.loanMoney)
        });
      } else {
        this.props.toast.info(getFirstError(err));
      }
    });
  };

  //过滤选中的还款期限
  filterLoanDate = (value) => {
    const { perdRateList, usrIndexInfo, activeTag } = this.state;
    const { cardBillAmt, minPayment } = usrIndexInfo.indexData
    let selectedLoanDate = perdRateList.filter((item, idx) => {
      return item.perdLth === value[0];
    });
    this.setState({
      selectedLoanDate // 设置选中的期数
    });
    //全额还款
    if (activeTag === 0) {
      this.calcLoanMoney(cardBillAmt, selectedLoanDate);
    } else if (activeTag === 1) {
      //最低还款
      this.calcLoanMoney(minPayment, selectedLoanDate);
    }
  };

  //计算该显示的还款金额
  calcLoanMoney = (money = 0, obj) => {
    if (money > obj.factAmtHigh) {
      this.props.form.setFieldsValue({
        loanMoney: obj.factAmtHigh
      });
    } else if (money < obj.factLmtLow) {
      this.props.form.setFieldsValue({
        loanMoney: obj.factLmtLow
      });
    } else {
      this.props.form.setFieldsValue({
        loanMoney: money
      });
    }
  };

  //切换tag标签
  toggleTag = (idx) => {
    const { selectedLoanDate = {}, usrIndexInfo } = this.state
    const { indexData = {} } = usrIndexInfo
    const { cardBillAmt, minPayment } = indexData
    this.setState({
      activeTag: idx
    }, () => {
      if (!this.state.fetchBillSucc) {
        this.props.toast.info('账单更新成功方可选择，请耐心等待哦')
        return
      }
      //全额还款
      if (idx === 0) {
        this.calcLoanMoney(cardBillAmt, selectedLoanDate)
      } else if (idx === 1) {
        //最低还款
        this.calcLoanMoney(minPayment, selectedLoanDate)
      } else {
        this.inputRef.focus()
        this.props.form.setFieldsValue({
          loanMoney: ''
        })
      }
    })
  }

  inputDisabled = () => {
    const { fetchBillSucc, activeTag } = this.state
    if (fetchBillSucc && (activeTag === 0 || activeTag === 1)) {
      return true
    }
    return false
  }

  placeholderText = () => {
    const { fetchBillSucc, selectedLoanDate = {} } = this.state
    if (fetchBillSucc) {
      return `申请金额${selectedLoanDate.factLmtLow || ''}-${selectedLoanDate.factAmtHigh || ''}元`
    } else {
      return `请输入账单金额`
    }
  }

  render() {
    const { isShowProgress, percent, showAgainUpdateBtn, usrIndexInfo, activeTag, selectedLoanDate = {}, fetchBillSucc } = this.state
    const { indexData = {} } = usrIndexInfo
    const { overDt, billDt, cardBillAmt, minPayment, cardNoHid, bankNo, bankName, autId } = indexData
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
    const minPaymentData = !minPayment ? '----.--' : parseFloat(minPayment, 10).toFixed(2);
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
      <div className={[style.pageWrapper, 'loan_repay_confirm_page'].join(' ')}>
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
            <strong className={style.billMoney}>{cardBillAmtData}</strong>
            <div className={style.billInfo}>
              <div className={style.item}>
                <span className={style.value}>{minPaymentData}</span>
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
              <span
                key={idx}
                className={[style.tagButton, activeTag === idx && style.activeTag].join(' ')}
                onClick={() => {
                  this.toggleTag(idx)
                }}
              >{item.name}</span>
            ))
          }
        </div>
        <div>
          {getFieldDecorator('loanMoney', {
            initialValue: this.state.loanMoney,
            rules: [{ required: true, message: '请输入还款金额' }],
          })(
            <InputItem
              placeholder={this.placeholderText()}
              type="text"
              disabled={this.inputDisabled()}
              ref={el => this.inputRef = el}
              className={this.inputDisabled() ? '' : 'blackColor'}
              onBlur={() => { handleInputBlur() }}
            >
              帮你还多少(元)
						</InputItem>
          )}
        </div>
        {
          autId && <div>
            {getFieldDecorator('loanDate', {
              initialValue: this.state.selectedLoanDate && [
                this.state.selectedLoanDate.perdCnt,
                this.state.selectedLoanDate.perdPageNm
              ],
              rules: [{ required: true, message: '请选择借款期限' }],
              onChange: (value, label) => {
                this.filterLoanDate(value);
              }
            })(
              <AsyncCascadePicker
                loadData={[
                  () => {
                    //如果账单爬取成功，请求期限接口
                    return this.props.$fetch.get(`${API.qryPerdRate}/${autId}`).then((res) => {
                      const date =
                        res.data && res.data.perdRateList.length ? res.data.perdRateList : [];
                      this.setState({
                        perdRateList: date,
                        selectedLoanDate: date[0] // 默认选中3期
                      });
                      // 设置默认选中的还款金额
                      return date.map((item) => ({
                        value: item.perdLth,
                        label: item.perdPageNm
                      }));
                    });
                  }
                ]}
                cols={1}
              >
                <List.Item>借多久</List.Item>
              </AsyncCascadePicker>
            )}
          </div>
        }
        <ZButton onClick={this.handleSubmit} className={style.confirmApplyBtn}>
          提交申请
				</ZButton>
        <p className="bottomTip">怕逾期，用还到</p>
      </div>
    );
  }
}