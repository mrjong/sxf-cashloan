import React, { PureComponent } from 'react';
import { getParamsFromUrl } from 'utils/common';
import { Toast } from 'antd-mobile';
import fetch from 'sx-fetch';

const API = {
  LANDING_IMG_URL: '/my/getLandingPage',
};

@fetch.inject()
export default class LandingPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imgUrl: '',
    };
  }

  componentWillMount() {
    this.getLandingImgByUrl();
  }

  // 根据 url 上的参数，获取图片
  getLandingImgByUrl() {
    // this.setState({
    //   imgUrl: 'http://d.hiphotos.baidu.com/image/h%3D300/sign=a4a9770ac43d70cf53faac0dc8ddd1ba/024f78f0f736afc3a2a61a56be19ebc4b745125e.jpg',
    // });
    // return;
    const searchParams = getParamsFromUrl(window.location.search);
    const landingId = searchParams.landingId || '';
    this.props.$fetch.get(`${API.LANDING_IMG_URL}/${landingId}`).then(res => {
      if (res.msgCode === 'PTM0000' && res.data !== null) {
        this.setState({
          imgUrl: res.data.landingImage,
        });
      } else {
        Toast.info(res.msgInfo);
      }
    });
  }

  render() {
    const { imgUrl } = this.state;
    return (
      <iframe
        style={{ display: 'block' }}
        title="落地页"
        src={`http://172.18.40.125:8080/#/landing_page?imgUrl=${imgUrl}`}
        width="100%"
        height="100%"
        frameBorder="0"
      />
    );
  }
}
