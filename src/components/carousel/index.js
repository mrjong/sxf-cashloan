import React from 'react';
import PropTypes from 'prop-types';
import { Toast } from 'antd-mobile';
import { Carousel } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
import { store } from 'utils/store';
import style from './index.scss';

@withRouter
export default class Carousels extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgHeight: 176,
    };
  }

  static propTypes = {
    entryFrom: PropTypes.string,
    data: PropTypes.array,
    autoplay: PropTypes.bool,
    infinite: PropTypes.bool,
    dotStyle: PropTypes.object,
    dotActiveStyle: PropTypes.object,
    children: PropTypes.node,
  };

  static defaultProps = {
    entryFrom: 'banner',
    data: [],
    autoplay: true,
    infinite: true,
    dotStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    dotActiveStyle: {
      backgroundColor: 'rgb(255, 255, 255)',
    },
    children: '',
  };

  handleLinkClick = url => {
    const { entryFrom } = this.props;
    store.setOutLinkUrl(url);
    Toast.loading('加载中...', 0);
    let jumpUrl = '';
    if (entryFrom) {
      if (url.split('?')[1]) {
        jumpUrl = `${url}&entryFrom=${entryFrom}`;
      } else {
        jumpUrl = `${url}?entryFrom=${entryFrom}`;
      }
    } else {
      jumpUrl = url;
    }
    window.location.href = jumpUrl;
  };

  render() {
    const { data, children, ...restProps } = this.props;
    return (
      <div className={style.carouse_wrap}>
        <Carousel dots={false} {...restProps}>
          {data.map(val => (
            <div
              key={val}
              onClick={val.url ? () => {this.handleLinkClick(val.url)} : null}
              style={{ display: 'inline-block', width: '100%', height: this.state.imgHeight }}
            >
              <img
                src={val.src}
                alt=""
                style={{ width: '100%', verticalAlign: 'top' }}
                onLoad={() => {
                  window.dispatchEvent(new Event('resize'));
                  this.setState({ imgHeight: 'auto' });
                }}
              />
            </div>
          ))}
        </Carousel>
        {children}
      </div>
    );
  }
}
