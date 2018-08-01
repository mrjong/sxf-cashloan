list使用方法

<Lists listsInf={listsArr} />

arrowHide: 是否隐藏箭头，true为隐藏，不传默认是不隐藏

extra: 为右侧部分（name为显示内容，color为颜色）

label: 为左侧label部分(name为label的内容，icon为label的图标，brief为副标题）

clickCb: 为点击执行的方法

const listsArr = [
// 箭头方向(右,上,下), 可选horizontal,up,down,empty，如果是empty则存在对应的dom,但是不显示
	{
        arrowHide: 'empty',
        extra: {
          name: '已认证',
          color: '#4CA6FF',
        },
        label: {
          name: '测试',
          icon: '',
		  brief: '111'	
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