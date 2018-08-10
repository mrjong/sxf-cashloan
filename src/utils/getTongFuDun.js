import { guid } from 'utils/common';
import { Toast } from 'antd-mobile';
import fetch from 'sx-fetch';

const appId = '1479905';
const sessionId = guid();
const ts = new Date().getTime();
const TONFUDUN_BAOBEI = '/signup/getUsrRqpInf';

let element = document.createElement('script');
const elementId = 'tonfudunScript';

function getTongFuDun() {
  element.id = elementId;
  element.src = `https://pws.payegis.com.cn/did/js/dp.js?appId=${appId}&sessionId=${sessionId}&ts=${ts}&callback=OnngFuDunCallBack`;
  document.body.appendChild(element);
}

// 通付盾验证成功后向后端报备下
function requestBackReport() {
  fetch.get(`${TONFUDUN_BAOBEI}/${sessionId}`)
    .then(user => {
      // console.log(user);
    })
    .catch(err => {
      // console.log(err);
    })
    .finally(() => {
      // console.log('请求完成'); // 无论请求成功或失败都会执行。
    });
}

// 请求通付盾接口 执行的回调
function jspCallBack(res) {
  // console.log(res, 'res');
  window.showTongLoading = true;
  if (res.success) {
    requestBackReport();
  } else {
    Toast.info(res.message);
    window.showTongFuDun += 1;
    // todo: 这个好像没用
    if (window.showTongFuDun <= 5) {
      document.body.removeChild(document.getElementById(elementId));
      getTongFuDun();
    }
  }
}

const TFDInit = () => {
  window.OnngFuDunCallBack = jspCallBack;
  if (!document.getElementById(elementId)) {
    getTongFuDun();
  }
};

export default TFDInit;
