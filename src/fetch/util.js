import { SXFToast } from 'utils/SXFToast';
let timer = null;
let timerList = [];
export const singleLoading = (num) => {
  // 处理多个请求，只要一个loading
  if (timerList.length > 1) {
    return;
  }
  // 防止时间短，出现loading 导致闪烁
  timer = setTimeout(() => {
    SXFToast.loading('数据加载中...', 10);
  }, 300);
  timerList.push(timer);
  if (num <= 0) {
    for (let i = 0; i < timerList.length; i++) {
      clearTimeout(timerList[i]);
    }
    timer = null;
    timerList = [];
    SXFToast.hide();
  }
}