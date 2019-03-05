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
    activeindex: PropTypes.number,
    tagList: PropTypes.array,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    activeindex: 0,
    tagList: [],
    onClick: () => { },
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.burientype && !store.getHadShowModal()) {
      const item = nextProps.tagList[nextProps.activeindex]
      if (item.value === '1') {
        // 预约还款埋点
        buriedPointEvent(home.lendersOrder, {
          lenders_type: item.name,
          disable: item.disable || ''
        })
      } else {
        // 立即还款埋点
        buriedPointEvent(home.lenders, {
          lenders_type: item.name,
          disable: item.disable || ''
        })
      }
      store.setHadShowModal(true)
    }
    if ((this.props.tagList.length !== nextProps.tagList.length) || (this.props.activeindex !== nextProps.activeindex)) {
      this.passInitData(nextProps);
      if (nextProps.burientype) {
        // buriedPointEvent(home.lenders, {
        //   lenders_type: nextProps.tagList[nextProps.activeindex].name,
        // })
      }
    }
  }

  componentWillMount() {
    this.setState({ currentIndex: this.props.activeindex }, this.passInitData);
  }

  // 因为默认选中第一个 所以页面一进来就触发方法，将当前的数据传回去。
  passInitData = nextProps => {
    const { currentIndex } = this.state;
    const { onClick, tagList } = this.props;
    if (nextProps) {
      this._handleClick(onClick, nextProps.activeindex, nextProps.tagList[nextProps.activeindex]);
    } else {
      this._handleClick(onClick, currentIndex, tagList[currentIndex], 'first');
    }
  };

  _handleClick = (onClick, index, value, type) => { // 是否是一进页面就执行 first为一进页面执行
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
    !!onClick && onClick(params, type);
  };

  render() {
    const { currentIndex } = this.state;
    const { className, onClick, tagList, tagType, defaultindex, isDotted, ...restProps, } = this.props;
    const tagListDom = tagList.map((item, index) => (
      <Tag
        defaultindex={defaultindex === index ? true : false}
        key={index}
        tagType={tagType}
        isDotted={index === 0 && isDotted}
        className={className}
        active={!item.disable && index === currentIndex}
        onClick={() => {
          if (item.disable || index === currentIndex) {
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
