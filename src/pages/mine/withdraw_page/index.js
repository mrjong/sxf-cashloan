import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';
import {setBackGround} from 'utils/Background'

import { PullToRefresh, ListView, Toast } from 'antd-mobile';
let totalPage = false;
const API = {
  withdrawList: '/redAccount/queryCashOrd',
};
@fetch.inject()
// @setBackGround('#efeff4')
export default class withdraw_page extends PureComponent {
  constructor(props) {
    super(props);
    const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
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
  // componentDidUpdate() {
  //   if (this.state.useBodyScroll) {
  //     document.body.style.overflow = "auto"
  //   } else {
  //     document.body.style.overflow = "hidden"
  //   }
  // }
  componentWillMount() {
    // var bodyDom = document.getElementsByTagName("body")[0];
    // bodyDom.style.backgroundColor = "#efeff4";
    this.getCommonData('tabshow');
  }
  componentDidMount() {
    if (!this.state.useBodyScroll) {
      this.calcHeight();
    }
  }
  componentWillUnmount() {
  }

  calcHeight() {
    const HeaderHeight = ReactDOM.findDOMNode(this.withdrawBox).offsetTop;
    setTimeout(() => {
      const hei = document.documentElement.clientHeight - HeaderHeight;
      this.setState({
        height: hei,
      });
    }, 600);
  }
  
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
    
    let data = await this.props.$fetch
      .post(API.withdrawList, {
        startPage: pIndex,
        pageRow: 10,
      }, { loading: true })
      .then(res => {
        if (pIndex === 1) {
          setTimeout(() => {
            Toast.hide();
          }, 600);
        }
        // console.log(res.msgCode)
        if (res.msgCode === 'PTM0000') { // msgCode
          let dataArr = [];
          if (pIndex === 1) {
            // totalPage = res.data.totalSize && Math.ceil(res.data.totalSize / 10);
            totalPage = res.data && res.data.totalPage;
            this.setState({
              hasMore: false,
            });
          }
          for (let i = res.data.usrCashOrds.length - 1; i >= 0; i--) {
            // res.data.data[i].coupCategory = '02'
            dataArr.push(
              res.data.usrCashOrds[i],
            );
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
    }, () => {
      if(!(this.state.rData && this.state.rData.length > 0)){
        var bodyDom = document.getElementsByTagName("body")[0];
        bodyDom.style.backgroundColor = "#fff";
      } else {
        var bodyDom = document.getElementsByTagName("body")[0];
        bodyDom.style.backgroundColor = "#f5f5f5";
      }
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
  render() {
    const separator = (sectionID, rowID) => <div key={`${sectionID}-${rowID}`} />;
    let index = this.state.rData && this.state.rData.length - 1;
    const row = (rowData, sectionID, rowID) => {
      if (index < 0) {
        index = this.state.rData && this.state.rData.length - 1;
      }
      const obj = this.state.rData && this.state.rData[index--];

      let withdrawBoxClass = [];
      switch (obj.ordSts) { // 订单状态0：初登记，1：处理中，2：交易成功，3：交易失败，4：撤销
        case '1': // 处理中
        case '0': // 0 也按1处理
          withdrawBoxClass = [
            style.withdrawCont,
          ]
          break;
        case '2': // 交易成功
          withdrawBoxClass = [
            style.withdrawCont,
            style.withdrawContSucc,
          ]
          break;
        case '3': // 交易失败
          withdrawBoxClass = [
            style.withdrawCont,
            style.withdrawContFail,
          ]
          break;
        default:
          withdrawBoxClass = [];
      };
      return (
        <div className={style.withdrawBox}>
          <div className={withdrawBoxClass.join(' ')}>
            <div className={style.withdrawMoney}>
              ¥<span>{obj.applyAmt}</span>
            </div>
            <div className={style.withdrawContent}>
              <p>提现金额</p>
              <p className={style.withdrawTime}>时间：{dayjs(obj.applyTm).format('YYYY-MM-DD HH:mm')}</p>
            </div>
          </div>
        </div>
      );
    };
    const item = classN => {
      if (this.state.rData && this.state.rData.length > 0) {
        return (
          <ListView
            initialListSize={this.state.Listlength}
            onScroll={this.handleScroll}
            key={this.state.useBodyScroll ? '0' : '1'}
            ref={el => (this.lv = el)}
            dataSource={this.state.dataSource}
            renderFooter={() => (
              <div style={{ paddingBottom: 30, textAlign: 'center' }} className={!this.state.isLoading ? style.reach_bottom : null}>
                {this.state.isLoading ? '加载中...' : <span>已无更多收入</span>}
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
          暂无提现
        </div>
      );
    };
    return (
      <div className={style.withdraw_page} ref={el => (this.withdrawBox = el)}>
        {this.state.tabState ? item() : null}
      </div>
    );
  }
}
