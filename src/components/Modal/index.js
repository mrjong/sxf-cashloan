import React from 'react'
import styles from './index.scss'
import huodongTootip from '../../assets/images/home/huodongTootip.png'
import huodongTootipBtn from '../../assets/images/home/huodongTootip_btn.png'


class ActivityModal extends React.Component {

  render() {
    const { closeActivityModal, history } = this.props
    return (
      <div className={styles.modal}>
        <div className={styles.mask}></div>
        <div className={styles.modalWrapper}>
          <div className={styles.content}>
            <img src={huodongTootip} alt="" />
            <img className={styles.huodongTootipBtn} src={huodongTootipBtn} 
            onClick={()=>{history.push('/mine/credit_extension_page?isShowCommit=false')}} />
          </div>
          <div className={styles.closeBtn} onClick={closeActivityModal}></div>
        </div>
      </div>
    )
  }
}

export default ActivityModal