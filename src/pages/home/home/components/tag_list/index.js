import React from 'react';
import PropTypes from 'prop-types';
import Tag from '../tag';

export default class TagList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
    };
  }

  static propTypes = {
    className: PropTypes.string,
    defaultindex: PropTypes.number,
    tagList: PropTypes.array,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    defaultindex: 0,
    tagList: [],
    onClick: () => {},
  };

  componentWillReceiveProps(nextProps) {}

  componentWillMount() {
    this.setState({ currentIndex: this.props.defaultindex }, this.passInitData);
  }

  // 因为默认选中第一个 所以页面一进来就触发方法，将当前的数据传回去。
  passInitData = () => {
    const { currentIndex } = this.state;
    const { onClick, tagList } = this.props;
    console.log(tagList, 'tagList');
    this._handleClick(onClick, currentIndex, tagList[currentIndex]);
  };

  _handleClick = (onClick, index, value) => {
    this.setState({
      currentIndex: index,
    });
    const params = {
      index,
      value,
    };
    !!onClick && onClick(params);
  };

  render() {
    const { currentIndex } = this.state;
    const { className, onClick, tagList, ...restProps } = this.props;
    const tagListDom = tagList.map((item, index) => (
      <Tag
        key={index}
        className={className}
        active={index === currentIndex}
        onClick={() => this._handleClick(onClick, index, item)}
        style={{ ...item.style }}
        {...restProps}
      >
        {item.name || item}
      </Tag>
    ));
    return tagList.length > 0 ? tagListDom : null;
  }
}
