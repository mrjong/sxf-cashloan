import React from 'react';
import PropTypes from 'prop-types';
import { Carousel } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
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
    data: PropTypes.array,
    autoplay: PropTypes.bool,
    infinite: PropTypes.bool,
    dotStyle: PropTypes.object,
    dotActiveStyle: PropTypes.object,
    children: PropTypes.node,
  };

  static defaultProps = {
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

  render() {
    const { data, children, ...restProps } = this.props;
    return (
      <div className={style.carouse_wrap}>
        <Carousel {...restProps}>
          {data.map(val => (
            <a
              key={val}
              href={val.url ? val.url : null}
              target=""
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
            </a>
          ))}
        </Carousel>
        {children}
      </div>
    );
  }
}
