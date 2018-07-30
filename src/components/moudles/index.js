import React, { PureComponent } from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';


function closest(el, selector) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}
export default class Moudles extends PureComponent {
    constructor(props) {
        super(props)
    }

    componentWillMount() {

    }

    onWrapTouchStart = (e) => {
        if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            return;
        }
        const pNode = closest(e.target, '.am-modal-content');
        if (!pNode) {
            e.preventDefault();
        }
    }

    render() {
        let { cb, logOut, textCont } = this.props
        return (

            <Modal
                visible={true}
                transparent
                maskClosable={false}
                wrapProps={{ onTouchStart: this.onWrapTouchStart }}
                className={styles.moudle}
            >
                <div className={styles.textCon}>
                    {textCont}
                </div>
                <div className={styles.btnCon}>
                    <span className={styles.btn} onClick={() => cb.setState({ showMoudle: false })}>取消</span>
                    <span className={styles.btn} onClick={logOut}>确定</span>
                </div>
            </Modal>
        )
    }
}

