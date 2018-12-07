import React, { PureComponent } from 'react';
import style from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import dayjs from 'dayjs';
import {setBackGround} from 'utils/Background'
import redBagIco from 'assets/images/mine/wallet/income_red_bag.png'

import { PullToRefresh, ListView, Toast } from 'antd-mobile';
let totalPage = false;
const API = {
  couponList: '/coupon/list',
};
@fetch.inject()
@setBackGround('#efeff4')
export default class income_page extends PureComponent {
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
    this.getCommonData();
  }
  componentDidMount() {
  }
  componentWillUnmount() {
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
    const sendParams = {
      type: `0${this.state.msgType}`,
      pageNo: pIndex,
      // loading: true,
    };;
    
    let data = await this.props.$fetch
      .get(API.couponList, sendParams, { loading: true })
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
            totalPage = Math.ceil(res.data.totalSize / 10);
            this.setState({
              hasMore: false,
            });
          }
          for (let i = res.data.data.length - 1; i >= 0; i--) {
            // res.data.data[i].coupCategory = '02'
            dataArr.push(
              res.data.data[i],
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
      return (
        <div className={style.incomeBox}>
          <h2 className={style.incomeTit}>邀请好友借款</h2>
          <div className={`${style.incomeCont} ${style.incomeContExpired}`}>
            <img
                className={style.redBag}
                src={redBagIco}
            />
            <div className={style.incomeContent}>
              <p className={style.incomeMoney}>¥<span>{10.00}</span></p>
              <p className={style.incomeTime}>时间：{'xxxx-xx-xx xx:xx'}</p>
              <p>有效期至：{'2018-12-01'}</p>
            </div>
            <span className={style.expired}></span>
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
          还没有收入哦～
        </div>
      );
    };
    return (
      <div className={style.income_page} ref={el => (this.messageBox = el)}>
        {item()}
      </div>
    );
  }
}
