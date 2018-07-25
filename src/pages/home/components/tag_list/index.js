import React from 'react';
import PropTypes from 'prop-types';
import Tag from '../tag';

export default class TagList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
    };
  }

  static propTypes = {
    className: PropTypes.string,
    tagList: PropTypes.array,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    tagList: [],
    onClick: () => {},
  };

  _handleClick = (onClick, index) => {
    this.setState({
      activeIndex: index,
    });
    !!onClick && onClick();
  };

  render() {
    const { activeIndex } = this.state;
    const { className, onClick, tagList, ...restProps } = this.props;
    const tagListDom = tagList.map((item, index) => (
      <Tag
        key={index}
        className={className}
        active={index === activeIndex}
        onClick={() => this._handleClick(onClick, index, item.value || item)}
        style={{ ...item.style }}
        {...restProps}
      >
        {item.name || item}
      </Tag>
    ));
    return tagList.length > 0 ? tagListDom : null;
  }
}
