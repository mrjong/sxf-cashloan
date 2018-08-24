// 基本信息页输入框和下拉框的埋点
let inforArr = [];
// 将毫秒转化为秒
function convertTime(time) {
    return time / 1000;
}
// 循环数组
function loopArr(inforArr, info){
    for (var i = 0; i < inforArr.length; i++) {
        if (inforArr[i].label === info.label) {
            inforArr[i].focusTime = new Date().getTime();
            inforArr[i].value = info.value;
            return true;
        }
    }
    return false;
}
function buryingPoints(info) {
    if (info) {
        switch (info.trigger) {
            case 'focus':
            case 'open':
                if (inforArr.length) {
                    // 如果数组里不含有此项就将此项push
                    if(!loopArr(inforArr, info)){
                        inforArr.push({
                            focusTime: new Date().getTime(),
                            blurTime: 0,
                            totalTime: 0,
                            label: info.label,
                            value: '',
                            editNum: 0,
                        })
                    }
                } else {
                    inforArr.push({
                        focusTime: new Date().getTime(),
                        blurTime: 0,
                        totalTime: 0,
                        label: info.label,
                        value: '',
                        editNum: 0,
                    })
                }
                sa.track(info.pageKey, {
                    'label': info.label,
                    'product_line': '还到-余额代偿',
                    'channelType': sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : 'OTHER'
                });
                break;
            case 'blur':
            case 'sure':
                if (inforArr.length) {
                    for (var i = 0; i < inforArr.length; i++) {
                        if (inforArr[i].label === info.label) {
                            inforArr[i].blurTime = new Date().getTime();
                            if (info.value !== inforArr[i].value) {
                                inforArr[i].editNum += 1;
                                inforArr[i].totalTime += (convertTime(inforArr[i].blurTime - inforArr[i].focusTime));
                                inforArr[i].value = info.value;
                                sa.track(info.pageKey, {
                                    ...inforArr[i],
                                    'product_line': '还到-余额代偿',
                                    'channelType': sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : 'OTHER'
                                });
                            }
                            inforArr[i].value = info.value;
                        }
                    }
                }
                break;
            default:
                inforArr = [];
                break;
        }
    } else {
        inforArr = [];
    }

}
export {
    buryingPoints,
}