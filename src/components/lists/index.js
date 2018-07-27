import React, { PureComponent } from 'react';
import { List } from 'antd-mobile';
import ListDesc from './listDesc'
import styles from './index.scss';

export default class Lists extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {

  }
  getExtra = (list) => {
    let extraList = []
    list.forEach((item, index) => {
      extraList.push(<span key={index} style={{ color: item.color }}>{item.name}</span>)
    });
    return extraList
  }

  render() {
    const { listsInf, className } = this.props;
    const Item = List.Item;
    const Brief = Item.Brief;
    return (
      <div className={`${styles.listsContainer} ${className}`}>
        <List
        >
          {
            listsInf.map((item, index) => {
              return (
                <div key={index}>
                  <Item
                    className={item.label.icon ? styles.hasIcon : null}
                    arrow={item.arrowHide ? item.arrowHide : 'horizontal'}
                    onClick={() => { this.props.clickCb(item) }}
                    extra={Object.prototype.toString.call(item.extra) === '[object Array]' ? this.getExtra(item.extra) : <span style={{ color: item.extra && item.extra.color }}>{item.extra && item.extra.name}</span>}
                    thumb={item.label.icon}
                  >
                    {item.label.name}
                    {
                      item.label.brief ? <Brief>{item.label.brief}</Brief> : null
                    }
                  </Item>
                  {
                    item.listDesc && item.showDesc ?
                    <div><ListDesc listdescinfo={item.listDesc}></ListDesc></div> : null 
                  }
                </div>
              )
            })
          }
        </List>
      </div>
    );
  }
}
