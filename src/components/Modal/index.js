import React from 'react'
import styles from './index.scss'
import huodongTootip from '../../assets/images/home/huodongTootip.png'

class ActivityModal extends React.Component {

  render() {
    const { closeActivityModal } = this.props
    return (
      <div className={styles.modal}>
        <div className={styles.mask}></div>
        <div className={styles.modalWrapper}>
          <div className={styles.content}>
            <img src={huodongTootip} alt="" />
          </div>
          <div className={styles.closeBtn} onClick={closeActivityModal}></div>
        </div>
      </div>
    )
  }
}

export default ActivityModal