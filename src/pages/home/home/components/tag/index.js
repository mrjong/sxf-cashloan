import React from 'react';
import PropTypes from 'prop-types';
import style from './style.scss';

const _handleClick = (onClick, event) => {
  event.preventDefault();
  !!onClick && onClick();
};

export default class Tag extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    active: PropTypes.bool,
    children: PropTypes.node,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    active: false,
    children: 'tag',
    onClick: () => {
      console.log('点击按钮，默认方法');
    },
  };

  render() {
    const { className, active, children, onClick, ...restProps } = this.props;
    return (
      <button
        onClick={event => _handleClick(onClick, event)}
        className={`${style.sxp_tag} ${active ? style.sxp_tag_active : ''} ${className}`}
        {...restProps}
      >
        {children}
      </button>
    );
  }
}
