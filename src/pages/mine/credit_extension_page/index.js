import React, { PureComponent } from 'react';
import Lists from '../../../components/lists';
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
  };

  componentWillMount() {
    // 查询 授信项状态
    this.props.$fetch.get(`${API.getStw}`).then(result => {
        if (result && result.data !== null && result.msgCode === 'PTM0000') {
          this.setState({ stswData: result.data.filter(item => needDisplayOptions.includes(item.code)) });

          // 判断四项认证是否都认证成功
          const isAllValid = this.state.stswData.every(item => item.stsw.dicDetailValue === '认证成功');
          if (isAllValid) {
            this.setState({ submitFlag: true });
          }
        }
      },
    );
    //芝麻信用的回调
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    const params = query.params;
    const sign = query.sign;
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

  componentWillUnmount() {
  }

  // 提交代还金申请
  commitApply = () => {
    const address = sessionStorage.getItem('location');
    const params = {
      location: address,
    };
    this.props.$fetch.post(`${API.submitState}`, params).then(result => {
      // 提交风控返回成功
      if (result && result.data !== null && result.msgCode === '0000') {
        //判断是否绑卡
        this.props.$fetch.get(`${API.isBankCard}`).then(result => {
          // 跳转至储蓄卡
          if (result && result.data !== null && result.msgCode === 'PTM2001') {
            this.props.toast.info(result.msgInfo);
            this.props.history.push({ pathname: '/mine/bind_save_page', search: '?needSaveBankCardInfo=false' });
          }
          // 跳转至信用卡
          if (result && result.data !== null && result.msgCode === 'PTM2002') {
            this.props.toast.info(result.msgInfo);
            this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?needSaveBankCardInfo=false' });
          }
          // 跳转至首页
          else {
            this.props.history.push('/home/home');
          }
        });
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
        this.props.toast.info('请先去实名认证');
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
            if (result.msgCode === 'PTM0000' && result.data.authUrl) {
              window.location.href = result.data.authUrl;
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
    const { submitFlag, stswData } = this.state;
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
        <Lists listsInf={data} clickCb={this.getStateData}/>

        <ButtonCustom onClick={submitFlag ? this.commitApply : null} className={submitFlag ? styles.commit_btn : styles.not_commit_btn}>提交代还金申请</ButtonCustom>
      </div>
    );
  }
}
