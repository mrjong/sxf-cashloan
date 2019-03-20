import React, { PureComponent } from 'react';
import { getDeviceType, isWXOpen } from 'utils';
import { isMPOS } from 'utils/common';

export default class pdf_page extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            contractUrl: '',
        };
    }
    componentWillMount(){
        const params = this.props.history.location.state;
        const osType = getDeviceType();
        if (params) {
            // console.log(params)
            this.props.setTitle(params.name);
            // ios暂定mpos和微信打开是直接打开pdf
            if (osType === 'IOS' && (isWXOpen() || isMPOS())) {
                window.location.replace(params.url)
            } else {
                this.setState({ contractUrl: params.url});
            }

            // this.props.setTitle(params.name);
            // var rawLength = params.url.length;  
            // //转换成pdf.js能直接解析的Uint8Array类型,见pdf.js-4068  
            // var array = new Uint8Array(new ArrayBuffer(rawLength));    
            // for(var i = 0; i < rawLength; i++) {  
            //     array[i] = params.url.charCodeAt(i) & 0xff;  
            // }
            // console.log(array);
            // this.setState({ contractUrl: array});
        }
    }
    render() {
        return (
            <iframe
                frameBorder="0"
                src={`/static/pdf/web/viewer.html?file=${encodeURIComponent(this.state.contractUrl)}`}
                width="100%"
                height="100%"
                style={{display: 'block'}}
            ></iframe>
        )
    }
}

