import React from 'react';
import fetch from 'sx-fetch';
import style from './index.scss';
import overDueImg from 'assets/images/home/overDue_icon.png';
import SXFButton from 'components/ButtonCustom';
import { store } from '../../../../../utils/store';
import { Modal } from 'antd-mobile';
import { getDeviceType } from 'utils';
const API = {};

@fetch.inject()
export default class OverDueModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  componentWillMount() {
    
  }

  downloadFile = (downloadUrl) => {
    if (!downloadUrl) {
      return;
    }
    const osType = getDeviceType();
    if (osType === 'IOS') {
      store.setIOSPreviewBack(true);
      window.location.href = downloadUrl;
    } else {
      var downloadElement = document.createElement('a');
      var href = downloadUrl; // 创建下载的链接
      console.log(href, '--------------');
      downloadElement.href = href;
      downloadElement.download = '裁决书.pdf'; // 下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); // 点击下载
      document.body.removeChild(downloadElement); // 下载完成移除元素
    }
  }

  render() {
    const { handleClick, overDueInf } = this.props;
    return (
      <Modal className="overDueModalBox" visible={true} transparent maskClosable={false}>
        <div>
          <img className={style.warningImg} src={overDueImg} />
          <h3 className={style.overDueTit}>{overDueInf && overDueInf.progressDesc}</h3>
          <p className={style.overDueDesc}>{overDueInf && overDueInf.progressContent}</p>
          <SXFButton onClick={handleClick}>我知道了，前去还款</SXFButton>
          {
            overDueInf && (overDueInf.progressOrder === 8 || overDueInf.progressOrder === 9) &&
            <p className={style.download} onClick={() => { this.downloadFile(overDueInf.docDownloadUrl) }}>立即下载裁决书</p>
          }
          {/* <a href="https://file.qzzcwyh.com/150217103521/award/1538011833348/裁决书.pdf" target="_parent" download="裁决书.pdf">立即下载裁决书</a> */}
        </div>
      </Modal>
    );
  }
}
