import React, { PureComponent } from 'react';
import fetch from "sx-fetch";
import qs from 'qs';
import { getDeviceType } from 'utils/common';
import { Toast } from 'antd-mobile';
import styles from './index.scss';
import downloadBtn from '../images/download/download_btn.jpg';

const API = {
    
}
@fetch.inject()
export default class download_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            downloadUrl: '', // 下载的url
        }
    }
    componentWillMount() {

    }

    getDownloadUrl = () => {
        this.props.$fetch.post(API.smsForLogin, {})
        .then(res => {
            if (res.msgCode === 'PTM0000') {
                this.setState({
                    downloadUrl: res.data,
                })
            } else {
                res.msgInfo && Toast.info(res.msgInfo);
            }
        }, error => {
            error.msgInfo && Toast.info(error.msgInfo);
        })
    }

    downloadClick = () => {
        const { downloadUrl } = this.state;
        const phoneType = getDeviceType();
        if (phoneType === 'ANDRIOD') {
            window.location.href = downloadUrl;
        } else {
            Toast.info('暂未开放')
        }
    }

    render() {
        return (
            <div className={styles.download_page}>
                <img onClick={this.downloadClick} className={styles.downloadBtn} src={downloadBtn} alt="下载按钮" />
            </div>
        )
    }
}

