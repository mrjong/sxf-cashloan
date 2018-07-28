import React, { PureComponent } from 'react';
// import succIco from 'assets/images/order/success_ico.png';
import ButtonCustom from 'components/button';
import styles from './index.scss';

export default class repayment_succ_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            orderDetail:{
                amount: 1000,
                deadline: 14,
                startDate: 2018-1-10,
            }
        }
    }

    // 返回首页
    backHome = () => {
        this.props.history.push('/login')
    }

    render() {
        return (
            <div className={styles.repayment_succ_page}>
                <div className={styles.tips}>
                    {/* <img src={succIco} alt="" /> */}
                    <i className={styles.success_ico}></i>
                    <p>恭喜，您的账单已结清</p>
                </div>
                <div className={styles.details}>
                    <p>借款金额：{this.state.orderDetail.amount}元</p>
                    <p>借款期限：{this.state.orderDetail.deadline}天</p>
                    <p>申请借款日期：{this.state.orderDetail.startDate}</p>
                </div>
                <ButtonCustom onClick={this.backHome} className={styles.back_btn}>返回首页</ButtonCustom>
            </div>
        )
    }
}

