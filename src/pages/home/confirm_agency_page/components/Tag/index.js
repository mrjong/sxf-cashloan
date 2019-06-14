import React from 'react';
import PropTypes from 'prop-types';
import style from './index.scss';

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
      
    },
  };

  render() {
    const { className, active, children, onClick, tagType, defaultindex, isDisable, isDotted, ...restProps } = this.props;
    return (
      <button
        onClick={event => _handleClick(onClick, event)}
        className={`${style.sxp_tag} ${active ? style.sxp_tag_active : ''} ${tagType && tagType==='lenders' ? style.specail_tag_active : ''} ${className} ${isDotted ? style.borderDotted : ''} ${isDisable ? style.disabledBtn : ''}`}
        {...restProps}
      >
        {children}
        { tagType && tagType==='lenders' && defaultindex ? <i /> : ''}
      </button>
    );
  }
}
