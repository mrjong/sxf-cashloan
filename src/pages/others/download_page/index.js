import React, { PureComponent } from 'react';
import fetch from "sx-fetch";
import qs from 'qs';
import { getDeviceType } from 'utils';
import styles from './index.scss';
import downloadBtn from './img/download_btn.jpg';

const API = {
    DOWNLOADURL: 'download/getDownloadUrl',
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
        this.getDownloadUrl();
    }

    getDownloadUrl = () => {
        this.props.$fetch.get(API.DOWNLOADURL, {})
        .then(res => {
            if (res.msgCode === 'PTM0000') {
                this.setState({
                    downloadUrl: res.data,
                })
            } else {
                res.msgInfo && this.props.toast.info(res.msgInfo);
            }
        }, error => {
            error.msgInfo && this.props.toast.info(error.msgInfo);
        })
    }

    downloadClick = () => {
        const { downloadUrl } = this.state;
        const phoneType = getDeviceType();
        if (phoneType === 'ANDRIOD') {
            this.props.toast.info('安全下载中')
            window.location.href = downloadUrl;
            // window.location.href = 'http://172.16.138.162:8920/app-release.apk'
        } else {
            this.props.toast.info('暂不支持ios下载')
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

