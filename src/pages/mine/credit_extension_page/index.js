import React, { PureComponent } from 'react';
import Lists from '../../../components/lists';
import { store } from 'utils/common';
import ButtonCustom from '../../../components/button';
import styles from './index.scss';
import { Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import qs from 'qs';

const API = {
  getStw: '/my/getStsw',             // 获取4个认证项的状态
  getOperator: '/auth/operatorAuth', // 运营商的跳转URL
  getZmxy: '/auth/getZhimaUrl',      // 芝麻认证的跳转URL
  submitState: '/bill/apply',        // 提交代还金申请
  isBankCard: '/my/chkCard',         // 是否绑定信用卡和储蓄卡
  getXMURL: '/auth/zmAuth',            // 芝麻认证之后的回调状态
};
const needDisplayOptions = ['idCheck', 'basicInf', 'operator', 'zmxy'];

@fetch.inject()

export default class credit_extension_page extends PureComponent {
  constructor(props) {
    super(props);
  }

  state = {
    stswData: [],
    flag: false,
    submitFlag: false,
    isShowBtn: true, // 是否展示提交代还金申请按钮
  };

  componentWillMount() {
    // 查询 授信项状态
    this.requestGetStatus();
    //芝麻信用的回调
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    const params = query.params;
    const sign = query.sign;
    const isShowCommit = query.isShowCommit; // 个人中心进入该页面不展示提交代还金申请按钮
    if (isShowCommit && isShowCommit === 'false') {
      this.setState({ isShowBtn: false })
    }
    if (params && sign) {
      const data = {
        params,
        sign,
      };
      this.props.$fetch.post(`${API.getXMURL}`, data).then((res) => {

        if (res && res.data !== null && res.msgCode === 'PTM0000') {

          this.props.$fetch.get(`${API.getStw}`).then((result) => {

            if (result && result.data !== null && result.msgCode === 'PTM0000') {

              this.setState({ stswData: result.data.filter(item => needDisplayOptions.includes(item.code)) });
            } else {
              this.props.toast.info(result.msgInfo);
            }
          });
        } else {
          this.props.toast.info(res.msgInfo);
        }
      });
    }
  }

  // 获取授信列表状态
  requestGetStatus = () => {
    this.props.$fetch.get(`${API.getStw}`).then(result => {
      if (result && result.data !== null && result.msgCode === 'PTM0000') {
        this.setState({ stswData: result.data.filter(item => needDisplayOptions.includes(item.code)) });

        // 判断四项认证是否都认证成功
        const isAllValid = this.state.stswData.every(item => item.stsw.dicDetailValue === '认证成功');
        if (isAllValid) {
          this.setState({ submitFlag: true });
        }
      } else {
        this.props.toast.info(result.msgInfo);
      }
    },
    );
  };

  // 提交代还金申请
  commitApply = () => {
    const address = store.getPosition();
    const params = {
      location: address,
    };
    this.props.$fetch.post(`${API.submitState}`, params).then(result => {
      // 提交风控返回成功
      if (result && result.data !== null && result.msgCode === '0000') {
        this.props.toast('您的代还申请已提交成功，将在1个工作日内返回结果', 3, () => {
          //判断是否绑卡
          this.props.$fetch.get(`${API.isBankCard}`).then(result => {
            // 跳转至储蓄卡
            if (result && result.data !== null && result.msgCode === 'PTM2001') {
              this.props.toast.info(result.msgInfo);
              this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
            }
            // 跳转至信用卡
            if (result && result.data !== null && result.msgCode === 'PTM2002') {
              this.props.toast.info(result.msgInfo);
              this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
            }
            // 跳转至首页
            else {
              this.props.history.push('/home/home');
            }
          });
        })
      }
      else {
        this.props.toast.info(result.msgInfo);
      }
    });
  };


  getStateData = item => {
    const { stswData } = this.state;
    const firstOption = stswData.filter(item => item.code === 'idCheck')[0];
    console.log(firstOption, 'firstOption');
    if (item.dicDetailCd === '2') {
      Toast.info(item.extra.name);
    } else if (firstOption.stsw.dicDetailCd !== '2') {
      if (item.extra.code === 'idCheck') {
        this.props.history.push('/home/real_name');
      } else {
        this.props.toast.info('请先实名认证');
        setTimeout(() => {
          this.props.history.push('/home/real_name');
        }, 3000);
      }
    } else {
      switch (item.extra.code) {
        case 'idCheck':
          this.props.history.push('/home/real_name');
          break;
        case 'basicInf':
          this.props.history.push('/home/essential_information');
          break;
        case 'operator':
          this.props.$fetch.post(`${API.getOperator}`).then(result => {
            if (result.msgCode === 'PTM0000' && result.data.url) {
              window.location.href = result.data.url;
            } else {
              this.props.toast.info(result.msgInfo);
            }
          });
          break;
        case 'zmxy':
          this.props.$fetch.get(`${API.getZmxy}`).then(result => {
            if (result.msgCode === 'PTM0000') {
              if (result.data.authUrl) {
                window.location.href = result.data.authUrl;
              } else {
                this.props.toast.info('授信成功');
                setTimeout(() => {
                  this.requestGetStatus();
                }, 3000);
              }
            } else {
              this.props.toast.info(result.msgInfo);
            }
          });
          break;
        default:
          console.log(1);
      }
    }
  };

  render() {
    const { submitFlag, stswData, isShowBtn } = this.state;
    const data = stswData.map(item => {
      return {
        dicDetailCd: item.stsw.dicDetailCd,
        extra: {
          code: item.code,
          name: item.stsw.dicDetailValue,
          color: item.stsw.color,
        },
        label: {
          name: item.name,
        },
      };
    });
    return (
      <div className={styles.credit_extension_page}>
        <Lists listsInf={data} clickCb={this.getStateData} />
        {
          isShowBtn ?
            <ButtonCustom onClick={submitFlag ? this.commitApply : null} className={submitFlag ? styles.commit_btn : styles.not_commit_btn}>提交代还金申请</ButtonCustom>
            :
            null
        }
      </div>
    );
  }
}
