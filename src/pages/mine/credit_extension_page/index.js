import React, { PureComponent } from 'react';
import Lists from 'components/lists';
import ButtonCustom from 'components/button';
import styles from './index.scss';
import fetch from 'sx-fetch';


const API = {
  getStw: '/wap/my/getStsw',
};

@fetch.inject()

export default class credit_extension_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.props.$fetch.get(`${API.getStw}`).then(result => {
      console.log(result)
        // if (result && result.data !== null) {
        //   this.setState({
        //     smsJrnNo: result.data,
        //   });
        // }
      },
    );
  }

  componentWillUnmount() {

  }


  // 提交代还金申请
  commitApply = () => {
    alert('点击');
  };



  render() {
    const listsArr = [
      {
        extra: {
          name: '已认证',
          color: '#2BDE73',
        },
        label: {
          name: '实名认证',
        },
        clickCb: () => {
          alert(11);
        },
      },
      {
        extra: {
          name: '待认证',
          color: '#F83F4C',
        },
        label: {
          name: '基本信息认证',
        },
        clickCb: () => {
          alert(12);
        },
      },
      {
        extra: {
          name: '已认证',
          color: '#2BDE73',
        },
        label: {
          name: '运营商认证',
        },
        clickCb: () => {
          alert(13);
        },
      },
      {
        extra: {
          name: '已认证',
          color: '#2BDE73',
        },
        label: {
          name: '芝麻分认证',
        },
        clickCb: () => {
          alert(14);
        },
      },
    ];
    return (
      <div className={styles.credit_extension_page}>
        <Lists listsInf={listsArr}/>

        {/*<List renderHeader={() => '基础信息'} className="my-list">*/}
          {/*{stswData && stswData.map(item => {*/}
            {/*const { code, name, stsw: { dicDetailValue, color } } = item;*/}
            {/*const isSuccess = dicDetailValue === '认证成功'; // 由于后端数据原因，这里只能通过中文判断了*/}
            {/*const isSuccessIng = dicDetailValue === '认证中';*/}
            {/*// 判断是否是需要展示的信息*/}
            {/*if (authCodes.indexOf(code) > -1) {*/}
              {/*return (*/}
                {/*<Item*/}
                  {/*key={code}*/}
                  {/*extra={<span style={{ color }}>{dicDetailValue}</span>}*/}
                  {/*arrow={isSuccess || isSuccessIng ? '<span style={{"margin-right":"30px"}}></span>' : 'horizontal'}*/}
                  {/*onClick={() => {*/}
                    {/*// 非认证成功才触发事件*/}
                    {/*!isSuccess && !isSuccessIng && this.getUsrInfo(item);*/}
                  {/*}}*/}
                {/*>{name}</Item>*/}
              {/*);*/}
            {/*}*/}
            {/*return null;*/}
          {/*})}*/}
        {/*</List>*/}

        <ButtonCustom onClick={this.commitApply} className={styles.commit_btn}>提交代还金申请</ButtonCustom>
      </div>
    );
  }
}

