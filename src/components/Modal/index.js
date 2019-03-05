import React from 'react'
import styles from './index.scss'
import huodongTootip from '../../assets/images/home/huodongTootip.png'
import huodongTootip1 from '../../assets/images/home/huodongTootip1.png'
import huodongTootipBtn from '../../assets/images/home/huodongTootip_btn.png'

class ActivityModal extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { closeActivityModal, history, isNewModal } = this.props
    return (
      <div className={styles.modal}>
        <div className={styles.mask}></div>
        <div className={styles.modalWrapper}>
          <div className={styles.content}>
            <img src={isNewModal ? huodongTootip1 : huodongTootip} />
            {/* <img className={styles.huodongTootipBtn} src={huodongTootipBtn}
              onClick={() => { history.push('/mine/credit_extension_page?isShowCommit=true') }} /> */}
          </div>
          <div className={styles.closeBtn} onClick={closeActivityModal}></div>
        </div>
      </div>
    )
  }
}

export default ActivityModal