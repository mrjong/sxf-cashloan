import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import style from './index.scss';
import fetch from 'sx-fetch';
import STabs from 'components/tabs';
import qs from 'qs';
import dayjs from 'dayjs';
import { store } from 'utils/store';

import { PullToRefresh, ListView, Toast } from 'antd-mobile';
let totalPage = false;
let receiveData = null;
let nouseFlag = false;
let saveBankData = null;  // 还款详情页带过来的银行信息
const API = {
  couponList: '/coupon/list',
};
@fetch.inject()
export default class coupon_page extends PureComponent {
  constructor(props) {
    super(props);
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    receiveData = queryData;
    if (this.props.history.location.state && this.props.history.location.state.cardData) {
      saveBankData = this.props.history.location.state.cardData
    }
    if (this.props.history.location.state && this.props.history.location.state.nouseCoupon) {
      nouseFlag = true;
    } else {
      nouseFlag = false;
    }
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });

    this.state = {
      dataSource,
      refreshing: true,
      isLoading: true,
      height: document.documentElement.clientHeight,
      useBodyScroll: false,
      pageIndex: 1,
      Listlength: 0,
      rData: [],
      tabState: false,
      msgType: 0,
      hasMore: true,
      tabs: [],
      couponSelected: '',
    };
  }
  scrollTop = 0;
  componentWillMount() {
    this.getTab();
  }
  componentWillUnmount() {
    // 从不可使用的优惠劵点进来，显示弹框
    if (nouseFlag) {
      if (saveBankData) {
        store.setCardData(saveBankData)
      }
    }
  }
  componentDidMount() {
    this.calcHeight();
  }
  calcHeight() {
    const HeaderHeight = ReactDOM.findDOMNode(this.messageBox).offsetTop;
    setTimeout(() => {
      const tabBarHeight = ReactDOM.findDOMNode(this.messageTabBox).getElementsByClassName('am-tabs-tab-bar-wrap')[0].offsetHeight;
      const hei = document.documentElement.clientHeight - tabBarHeight - HeaderHeight;
      this.setState({
        height: hei,
      });
    }, 600);
  }
  // 消息 tab
  getTab = () => {
    if (receiveData && (receiveData.billNo || receiveData.price)) {
      this.setState({
        tabs: [
          {
            title: '可使用',
            value: 0,
          },
          {
            title: '不可使用',
            value: 1,
          },
        ],
        couponSelected: store.getCouponData() && store.getCouponData().usrCoupNo,
      });
    } else {
      this.setState({
        tabs: [
          {
            title: '未使用',
            value: 0,
          },
          {
            title: '已使用',
            value: 1,
          },
          {
            title: '已失效',
            value: 2,
          },
        ],
      });
    }
    this.getCommonData('tabshow')
  };
  // 获取每一页数据
  genData = async (pIndex = 1) => {
    if (totalPage && totalPage < pIndex) {
      this.setState({
        isLoading: false,
        pageIndex: totalPage,
      });
      return [];
    }
    if (pIndex === 1) {
      Toast.loading('数据加载中...', 10000);
    }
    let sendParams = '';
    if (receiveData && receiveData.billNo) {
      sendParams = {
        type: `0${this.state.msgType}`,
        pageNo: pIndex,
        billNo: receiveData.billNo,
        // loading: true,
      };
    } else if (receiveData && receiveData.price && receiveData.perCont) {
      sendParams = {
        type: `0${this.state.msgType}`,
        pageNo: pIndex,
        price: receiveData.price,
        perCont:receiveData.perCont
        // loading: true,
      };
    } else {
      sendParams = {
        type: `0${this.state.msgType}`,
        pageNo: pIndex,
        // loading: true,
      };
    }
    let data = await this.props.$fetch
      .get(API.couponList, sendParams)
      .then(res => {
        if (pIndex === 1) {
          setTimeout(() => {
            Toast.hide();
          }, 600);
        }
        if (res.msgCode === 'PTM0000' && res.data) {
          let dataArr = [];
          if (pIndex === 1) {
            totalPage = Math.ceil(res.data.totalSize / 10);
            this.setState({
              hasMore: false,
            });
          }
          for (let i = res.data.data.length - 1; i >= 0; i--) {
            // res.data.data[i].coupCategory = '00'
            if ((this.state.msgType !== 0 || !receiveData || (!receiveData.billNo && !receiveData.price)) || (res.data.data[i].usrCoupNo !== store.getCouponData().usrCoupNo)) {
              dataArr.push(
                res.data.data[i],
              );
            }
          }
          // 倒叙插入
          if (pIndex === 1) {
            if (receiveData && (receiveData.billNo || receiveData.price) && this.state.msgType === 0 && store.getCouponData().usrCoupNo !== 'null') dataArr.push(store.getCouponData());
          }
          return dataArr;
        }
        return [];
      })
      .catch(err => {
        if (pIndex === 1) {
          setTimeout(() => {
            Toast.hide();
          }, 600);
        }
      });
    return data;
  };
  // 刷新
  onRefresh = () => {
    totalPage = false;
    this.setState({ refreshing: true, isLoading: true });
    this.getCommonData();
  };
  // 公用
  getCommonData = async tab => {
    this.setState({
      isLoading: true,
    });
    let list = await this.genData(1);
    if (tab === 'tabshow') {
      this.setState({
        tabState: true,
      });
    }
    this.setState({
      rData: list,
      Listlength: list.length,
      dataSource: this.state.dataSource.cloneWithRows(list),
      refreshing: false,
      isLoading: false,
      pageIndex: 1,
    });
  };
  // 渲染每一页完成之后
  onEndReached = async event => {
    if (this.state.isLoading && !this.state.hasMore) {
      // this.setState({
      //   pageIndex: totalPage || 1,
      // });
      return;
    }
    this.setState({ isLoading: true });
    let list = await this.genData(++this.state.pageIndex);
    if (list.length === 0) {
      return;
    }
    this.setState({
      rData: [...this.state.rData, ...list],
      dataSource: this.state.dataSource.cloneWithRows([...this.state.rData, ...list]),
      isLoading: false,
    });
  };
  // 滚动高度
  handleScroll = event => {
    this.scrollTop = event.target.scrollTop;
  };
  // 选择优惠劵
  selectCoupon = obj => {
    if (this.state.msgType === 1) {
      return;
    }
    this.setState({
      couponSelected: obj === 'null' ? 'null' : obj.usrCoupNo
    });
    const couponData = obj === 'null' ? { coupVal: 0, usrCoupNo: 'null' } : obj;
    store.setCouponData(couponData);
    if (saveBankData) {
      store.setCardData(saveBankData)
    }
    // 跳转回详情页
    this.props.history.goBack();
  };
  // 切换tab
  changeTab = (tab, index) => {
    this.setState(
      {
        msgType: tab.value,
        rData: [],
      },
      () => {
        this.getCommonData();
      },
    );
  };
  render() {
    const separator = (sectionID, rowID) => <div key={`${sectionID}-${rowID}`} />;
    let index = this.state.rData && this.state.rData.length - 1;
    const row = (rowData, sectionID, rowID) => {
      if (index < 0) {
        index = this.state.rData && this.state.rData.length - 1;
      }
      const obj = this.state.rData && this.state.rData[index--];
      return (
        // "useSts","该优惠券状态 ,默认'00'-未使用，00未使用 01已锁定 02已使用 03已作废 99全部"
        <div
          onClick={receiveData && (receiveData.billNo || receiveData.price) ? () => { this.selectCoupon(obj) } : null}
          key={rowID}
          className={obj && obj.useSts === '00' || obj && obj.useSts === '01' ?
            [style.box, style.box_active].join(' ') :
            [style.box, style.box_default].join(' ')}
        >
          <div className={style.leftBox}>
            {
              obj && obj.coupCategory === '00' ?
              <span>￥<i className={style.money}>{obj && obj.coupVal}</i></span>
              : obj && obj.coupCategory === '03' ?
              <span className={style.couponType2}>免息券</span>
              : obj && obj.coupCategory === '01' ?
              <span className={style.couponType3}><i>{obj && obj.coupVal}</i>折</span>
              : obj && obj.coupCategory === '02' ?
              <span className={style.couponType4}><i>免</i><i className={style.dayNum}>{obj && obj.coupVal}</i><br /><span className={style.littleFont}>天息费</span></span>
              :
              null
            }
          </div>
          <div
            className={receiveData && (receiveData.billNo || receiveData.price) && this.state.msgType === 0 ?
              `${style.rightBox} ${style.rightLittleBox}` : style.rightBox
            }
          >
            {
              receiveData && (receiveData.billNo || receiveData.price) && this.state.msgType === 0 ?
                <i className={obj && obj.usrCoupNo === this.state.couponSelected ? [style.icon_select_status, style.icon_select].join(' ') : [style.icon_select_status, style.icon_select_not].join(' ')} />
                :
                receiveData && (receiveData.billNo || receiveData.price) && this.state.msgType === 1 ? null
                  :
                  <i className={obj && obj.useSts === '00' ? '' : obj && obj.useSts === '01' ? [style.icon_status, style.icon_useing].join(' ') : obj && obj.useSts === '02' ? [style.icon_status, style.icon_used].join(' ') : [style.icon_status, style.icon_use_over].join(' ')} />
            }
            <div className={obj.useSts === '02' || obj.useSts === '03' ? `${style.title} ${style.ellipsis} ${style.textGray}` : `${style.title} ${style.ellipsis}`}>{obj && obj.coupNm}</div>
            <div className={obj.useSts === '02' || obj.useSts === '03' ? `${style.ellipsis} ${style.textGray}` : style.ellipsis}>{obj && obj.coupDesc}</div>
            <div className={obj.useSts === '02' || obj.useSts === '03' ? `${style.textGray}` : ''}>有效期至： {obj && obj.validEndTm.length && dayjs(obj.validEndTm.substring(0, obj.validEndTm.length - 4)).format('YYYY-MM-DD')}</div>
          </div>
        </div>
      );
    };
    const item = classN => {
      if (this.state.rData && this.state.rData.length > 0) {
        return (
          <ListView
            className={`${classN} ${style.no_header}`}
            initialListSize={this.state.Listlength}
            onEndReachedThreshold={100}
            onScroll={this.handleScroll}
            key={this.state.useBodyScroll ? '0' : '1'}
            ref={el => (this.lv = el)}
            dataSource={this.state.dataSource}
            renderHeader={() => {
              return (
                receiveData && (receiveData.billNo || receiveData.price) && classN === 'iview0' && !nouseFlag ?
                  <h3 onClick={() => { this.selectCoupon('null') }} className={style.no_use_coupon}>
                    <span>不使用优惠券</span>
                    <i className={'null' === this.state.couponSelected ? [style.icon_select_status, style.icon_select].join(' ') : [style.icon_select_status, style.icon_select_not].join(' ')} />
                  </h3>
                  :
                  null
              )
            }
            }
            renderFooter={() => (
              <div style={{ paddingBottom: 30, textAlign: 'center' }} className={!this.state.isLoading ? style.reach_bottom : null}>
                {this.state.isLoading ? '加载中...' : <span>已无更多优惠劵</span>}
              </div>
            )}
            renderRow={row}
            renderSeparator={separator}
            useBodyScroll={this.state.useBodyScroll}
            style={
              this.state.useBodyScroll
                ? {}
                : {
                  height: this.state.height,
                }
            }
            pullToRefresh={<PullToRefresh refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
            onEndReached={this.onEndReached}
            pageSize={1}
          />
        );
      }
      return (
        <div className={style.noMsg}>
          <i />
          还没有券哦～
        </div>
      );
    };
    return (
      <div className={style.message_page} ref={el => (this.messageBox = el)}>
        {this.state.tabState ? (
          <STabs
            tabTit={this.state.tabs}
            initialPage={this.state.msgType}
            onChange={(tab, index) => {
              this.changeTab(tab, index);
            }}
            swipeable={false}
            ref={el => (this.messageTabBox = el)}
          >
            {this.state.tabs.map((item2, index2) => (
              <div key={index2}>{item(`iview${index2}`)}</div>
            ))}
          </STabs>
        ) : null}
      </div>
    );
  }
}
