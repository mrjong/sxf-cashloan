import React from 'react';
import { Tabs } from 'antd-mobile';
import styles from './tabs.scss';

export default class Tab extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {

  }

  render() {
    const { tabTit, children } = this.props;
    const tabUnderLineWidth = `${50 * (tabTit.length / 2) * 0.8}%`;
    return (
      <div className={styles.tabContainer}>
        <Tabs
          tabs={tabTit}
          initialPage={0}
          renderTab={tab => <span>{tab.title}</span>}
          renderTabBar={(props) => <Tabs.DefaultTabBar
            {...props}
            renderUnderline={(ulProps) => {
              const { style, ...otherProps } = ulProps;
              const ulStyle = {
                ...style,
                border: 'none',
              };
              return (
                <div style={ulStyle} {...otherProps}>
                  <div style={{
                    width: tabUnderLineWidth,
                    height: 2,
                    backgroundColor: '#FFC601',
                    margin: '0 auto'
                  }}></div>
                </div>
              );
            }}
          />}
        >
          {children}
        </Tabs>
      </div>
    );
  }
}