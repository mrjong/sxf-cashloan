import React from 'react';
import PropTypes from 'prop-types';
import Tag from '../Tag';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { store } from 'utils/store';

export default class TagList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
    };
  }

  static propTypes = {
    className: PropTypes.string,
    activeIndex: PropTypes.number,
    tagList: PropTypes.array,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    activeIndex: 0,
    tagList: [],
    onClick: () => {},
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.burientype && !store.getHadShowModal()) {
      buriedPointEvent(home.lenders, {
        lenders_type: nextProps.tagList[nextProps.activeIndex].name,
      });
      store.setHadShowModal(true);
    }
    if ((this.props.tagList.length !== nextProps.tagList.length) || (this.props.activeIndex !== nextProps.activeIndex)) {
      this.passInitData(nextProps);
      if (nextProps.burientype) {
        buriedPointEvent(home.lenders, {
          lenders_type: nextProps.tagList[nextProps.activeIndex].name,
        });
      }
    }
  }

  componentWillMount() {
    this.setState({ currentIndex: this.props.activeIndex }, this.passInitData);
  }

  // 因为默认选中第一个 所以页面一进来就触发方法，将当前的数据传回去。
  passInitData = nextProps => {
    const { currentIndex } = this.state;
    const { onClick, tagList } = this.props;
    if (nextProps) {
      this._handleClick(onClick, nextProps.activeIndex, nextProps.tagList[nextProps.activeIndex]);
    } else {
      this._handleClick(onClick, currentIndex, tagList[currentIndex]);
    }
  };

  _handleClick = (onClick, index, value) => {
    if (!value || value.disable) {
      return false;
    }
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
    const { className, onClick, tagList, tagType, defaultindex, isDotted, ...restProps, } = this.props;
    const tagListDom = tagList.map((item, index) => (
      <Tag
        defaultindex={defaultindex === index ? true : false}
        key={index}
        tagType={tagType}
        isDotted={isDotted}
        className={className}
        active={!item.disable && index === currentIndex}
        onClick={() => {
            if(item.disable || index === currentIndex){
                return;
               }
          if (index !== currentIndex) {
            this.setState({
              currentIndex: index,
            });
            const params = {
              index,
              value: item,
            };
            onClick(params);
          }
        }}
        style={{ backgroundColor: item.disable ? '#ccc' : '', ...item.style }}
        {...restProps}
      >
        {item.name || item}
      </Tag>
    ));
    return tagList.length > 0 ? tagListDom : null;
  }
}
