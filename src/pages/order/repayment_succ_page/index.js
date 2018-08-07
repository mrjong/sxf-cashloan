import React, { PureComponent } from 'react';
import ButtonCustom from 'components/button';
import styles from './index.scss';
import { store } from 'utils/common'
export default class repayment_succ_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            orderSuccess: {
                billPrcpAmt: '--',
                perdUnit: '--',
                billRegDt: '--',
            }
        }
    }
    componentWillMount() {
        let test = store.getOrderSuccess()
        if (test) {
            let orderSuccess = JSON.parse(test)
            this.setState({
                orderSuccess
            })
        }
    }

    // 返回首页
    backHome = () => {
        this.props.history.push('/home/home')
    }

    render() {
        return (
            <div className={styles.repayment_succ_page}>
                <div className={styles.tips}>
                    <i className={styles.success_ico}></i>
                    <p>恭喜，您的账单已结清</p>
                </div>
                <div className={styles.details}>
                    <p>借款金额：{this.state.orderSuccess.billPrcpAmt}元</p>
                    <p>借款期限：{this.state.orderSuccess.perdLth}{this.state.orderSuccess.perdUnit === 'M' ? '个月' : '天'}</p>
                    <p>申请借款日期：{this.state.orderSuccess.billRegDt}</p>
                </div>
                <ButtonCustom onClick={this.backHome} className={styles.back_btn}>返回首页</ButtonCustom>
            </div>
        )
    }
}

