import React, { PureComponent } from 'react';
import Lists from '../../../components/lists';
import ButtonCustom from '../../../components/button';
import styles from './index.scss';
import { Toast } from 'antd-mobile';
import fetch from 'sx-fetch';

const API = {
  getStw: '/my/getStsw',
  getOperator: '/auth/operatorAuth',
  getZmxy: '/auth/getZhimaUrl',
  submitState: '/bill/apply',
  isBankCard:'/my/chkCard'
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
        if (result && result.data !== null && result.msgCode==='PTM0000') {
          this.setState({ stswData: result.data.filter(item => needDisplayOptions.includes(item.code)) });

          // 判断四项认证是否都认证成功
          const isAllValid = this.state.stswData.every(item => item.stsw.dicDetailValue === '认证成功');
          if (isAllValid) {
            this.setState({ submitFlag: true });
          }
        }
      },
    );
  }

  componentWillUnmount() {
  }

  // 提交代还金申请
  commitApply = () => {
    const address= sessionStorage.getItem('location');
    const params={
      location:address,
    };
    this.props.$fetch.post(`${API.submitState}`,params).then(result => {
      // 提交风控返回成功
      if(result && result.data!==null && result.msgCode==='0000'){
        //判断是否绑卡
        this.props.$fetch.get(`${API.isBankCard}`).then(result => {
          // 跳转至储蓄卡
          if(result && result.data!==null && result.msgCode==='PTM2001'){
            this.props.toast.info(result.msgInfo);
            this.props.history.push('/mine/bind_save_page');
          }
          // 跳转至信用卡
          if(result && result.data!==null && result.msgCode==='PTM2002'){
            this.props.toast.info(result.msgInfo);

            this.props.history.push('/mine/bind_credit_page');
          }
          // 跳转至首页
          else{
            this.props.history.push('/home/home');
          }
        })
      }
    })
  };


  getStateData = item => {
    // 跳转 实名认证
    if (item.extra.code === 'idCheck' && item.extra.name === '未认证') {
      this.props.toast.info('请先去实名认证');
      this.props.history.push('/home/real_name');
    }
    else{
      // 跳转基本信息
      if (item.extra.code === 'basicInf' && item.extra.name === '未认证') {
        this.props.history.push('/home/essential_information');
      }
      // 跳转运营商
       if (item.extra.code === 'operator' && item.extra.name === '未认证') {
        this.props.$fetch.post(`${API.getOperator}`).then(result => {
          if (result.msgCode === 'PTM0000' && result.data.url) {
            window.location.href = result.data.url;
          } else {
            this.props.toast.info(result.msgInfo);
          }
        });
      }
      // 跳转 芝麻信用
      if (item.extra.code === 'zmxy' && item.extra.name === '未认证') {
        this.props.$fetch.get(`${API.getZmxy}`).then(result => {
          if (result.msgCode === 'PTM0000' && result.data.authUrl) {
            window.location.href = result.data.authUrl;
          } else {
            this.props.toast.info(result.msgInfo);
          }
        });
      }
      else {
        Toast.info(item.extra.name);
      }
    }

  };

  render() {
    const { submitFlag, stswData } = this.state;
    const data = stswData.map(item => {
      return {
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

        <ButtonCustom onClick={submitFlag?this.commitApply:null} className={submitFlag ? styles.commit_btn : styles.not_commit_btn}>提交代还金申请</ButtonCustom>
      </div>
    );
  }
}

