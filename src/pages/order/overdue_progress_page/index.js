import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import { store } from 'utils/store';
import styles from './index.scss';

export default class overdue_progress_page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      progressList: []
    }
  }
  componentWillMount() {
    let progressList = store.getOverdueInf();
    if (progressList) {
      this.setState({
        progressList,
      })
    }
  }

  componentWillUnmount() {

  }

  // 返回账单详情
  backOrderDtl = () => {
    this.props.history.goBack()
  }

  render() {
    const { progressList } = this.state;
    return (
      <div className={styles.overdue_progress_page}>
        {
          progressList && progressList.length ?
          <ul className={styles.progress_list}>
            {
              progressList.map((item, index) => {
                return (
                  <li key={index} className={item.hasProgress ? styles.active : null}>
                    <p className={styles.dateTimeBox}>
                      <span className={styles.dateBox}>{item.hasProgress ? item.showTime && item.showTime.split(' ')[0] : item.preShowTime}</span>
                      { item.showTime && item.showTime.split(' ')[1] &&
                        <span>{item.showTime.split(' ')[1]}</span>
                      }
                    </p>
                    <p className={styles.desc}>{item.hasProgress ? item.progressTitle : item.preProgressTitle}</p>
                    <i className={styles.arrow} />
                    <i className={styles.stepItem} />
                    {
                      index !== 0 && <i className={styles.lineItem} />
                    }
                  </li>
                )
              })
            }
          </ul>
          : null
        }
        <ButtonCustom onClick={this.backOrderDtl} className={styles.back_btn}>立即还款</ButtonCustom>        
      </div>
    )
  }
}

