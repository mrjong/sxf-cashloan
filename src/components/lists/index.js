import React, { PureComponent } from 'react';
import { List } from 'antd-mobile';
import styles from './lists.scss';

export default class Lists extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {

  }

  render() {
    const { listsInf, className } = this.props;
    const Item = List.Item;
    return (
      <div className={`${styles.listsContainer} ${className}`}>
        <List
        >
          {
            listsInf.map((item, index) => {
              return (
                <Item
                  className={item.label.icon ? styles.hasIcon : null}
                  arrow={item.arrowHide ? '' : 'horizontal'}
                  onClick={item.clickCb}
                  extra={<span style={{ color: item.extra && item.extra.color }}>{item.extra && item.extra.name}</span>}
                  thumb={item.label.icon}
                  key={index}
                >
                  {item.label.name}
                </Item>
              )
            })
          }
        </List>
      </div>
    );
  }
}
