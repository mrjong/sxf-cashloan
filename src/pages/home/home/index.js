import React from 'react';
import parentComponent from 'pages/common/parentComponent';
import Tab from 'components/tabs';
import Lists from 'components/lists';

export default class Home extends parentComponent {
  constructor(props) {
    super(props);

  }

  cc() {
    this.props.history.push('/login/login')
  }

  render() {
    const tabTitArr = [
      { title: '信用卡', sub: '1' },
      { title: '储蓄卡', sub: '2' }
    ]
    const listsArr = [
      {
        arrowHide: true,
        extra: {
          name: '已认证',
          color: '#4CA6FF',
        },
        label: {
          name: '测试',
          icon: 'https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png'
        },
      },
      {
        extra: {
          // name: '待认证',
          // color: '#F83F4C',
        },
        label: {
          name: '测试22',
          icon: 'https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png'
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
          name: '测试22',
          icon: 'https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png'
        },
      }
    ]
    return (
      <div>
        <div onClick={() => this.cc()}> 首页</div>
        <Tab tabTit={tabTitArr}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
            Content of first tab
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
            Content of second tab
          </div>
        </Tab>
          <Lists listsInf={listsArr} />
      </div>
    )
  }
}

