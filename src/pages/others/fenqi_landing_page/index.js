import React, { PureComponent } from 'react';
import styles from './index.scss';
import ruleImg from './img/rule.png'
import img1 from './img/img1.png'
import img2 from './img/img2.png'
import img3 from './img/img3.png'

export default class fenqi_landing_page extends PureComponent {

  render() {
    return (
      <div className={styles.fenqi_landing_page}>
        <div className={styles.title}>关于还到Plus</div>
        <h3 className={styles.subTitle}>什么是还到Plus</h3>
        <div className={styles.cardBox}>
          <div className={styles.cardInner}>
            <em>还到Plus</em>是还到全新升级的明星产品，针对信用良好且及时结清的还到用户，将直接提供授信额度，用户可一键操作提款至银行卡。
          </div>
        </div>
        <h3 className={styles.subTitle}>还到Plus专属权益</h3>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <img src={img1} alt="" />
            <span>额度高</span>
            <p>平均提额<em>50%</em></p>
          </li>
          <li className={styles.listItem}>
            <img src={img2} alt="" />
            <span>放款快</span>
            <p>提款银行卡快至<em>3s</em></p>
          </li>
          <li className={styles.listItem}>
            <img src={img3} alt="" />
            <span>利率低</span>
            <p>月利率低至<em>1.2%</em><del>1.5%</del></p>
          </li>
        </ul>
        <h3 className={styles.subTitle}>如何申请还到Plus</h3>
        <img src={ruleImg} alt="" className={styles.ruleImg} />
      </div>
    )
  }
}

