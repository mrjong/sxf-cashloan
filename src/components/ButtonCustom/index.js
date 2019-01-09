import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';

const _handleClick = (onClick, event) => {
  event.preventDefault();
  !!onClick && onClick();
};

export default class ButtonCustom extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    active: PropTypes.bool,
    children: PropTypes.node,
    onClick: PropTypes.func,
    interval: PropTypes.number,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    className: '',
    active: false,
    children: '按钮',
    onClick: () => {
      
    },
    interval: 1600,
    disabled: false,
  };

  prePressTime = 0;

  handleClick = (event) => {
    const { disabled, interval, onClick } = this.props;
    const now = Date.now();

    if (disabled) return;

    if (interval > 0 || this.prePressTime > 0) {
      if (now - this.prePressTime > interval) {
        this.prePressTime = now;
        _handleClick(onClick, event);
      }
    } else {
      _handleClick(onClick, event);
    }
    
  }

  render() {
    const { className, active, children, onClick, ...restProps } = this.props;
    return (
      <button
        onClick={event => this.handleClick(event)}
        className={`${style.sxp_button} ${active ? style.sxp_button_active : ''} ${className}`}
        {...restProps}
      >
        {children}
      </button>
    );
  }
}
