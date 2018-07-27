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
        if (result && result.data !== null) {
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
    alert('点击');
  };


  getStateData = item => {
    // 跳转 实名认证
    if (item.extra.code === 'idCheck' && item.extra.name === '未认证') {
      this.props.history.push('/authentication/real_name');
    }
    // 跳转基本信息
    else if (item.extra.code === 'basicInf' && item.extra.name === '未认证') {
      this.props.history.push('/authentication/essential_information');
    }
    // 跳转运营商
    else if (item.extra.code === 'operator' && item.extra.name === '未认证') {
      this.props.$fetch.get(`${API.getOperator}`).then(result => {
        console.log(2222, result);
        if (result.msgCode === 'PTM0000' && result.data.url) {
          window.location.href = result.data.url;
        } else {
          this.props.toast.info(result.msgInfo);
        }
      });
    }
    // 跳转 芝麻信用
    else if (item.extra.code === 'zmxy' && item.extra.name === '未认证') {
      this.props.$fetch.get(`${API.getZmxy}`).then(result => {
        console.log(333, result);
        if (result.msgCode === 'PTM0000' && result.data.pageUrl) {
          window.location.href = result.data.pageUrl;
        } else {
          this.props.toast.info(result.msgInfo);
        }
      });
    }
    else {
      Toast.info(item.extra.name);
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

        <ButtonCustom onClick={this.commitApply} className={submitFlag ? styles.commit_btn : styles.not_commit_btn}>提交代还金申请</ButtonCustom>
      </div>
    );
  }
}

