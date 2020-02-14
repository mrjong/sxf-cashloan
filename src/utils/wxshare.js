/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 17:07:17
 */
import { isWXOpen } from 'utils';
import { Toast } from 'antd-mobile';
import { signup_wx_jscfg } from 'fetch/api';
export default ({ $props, shareData }) => {
	if (isWXOpen() && wx) {
		const params = {
			channelCode: '01',
			redirectUrl: window.location.href
		};
		// 获取 微信 sdk
		$props.$fetch.post(signup_wx_jscfg, params).then((result) => {
			if (result.code === '000000') {
				const { appId, timestamp, nonceStr, signature } = result;

				wx.config({
					debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					appId, // 必填，公众号的唯一标识
					timestamp, // 必填，生成签名的时间戳
					nonceStr, // 必填，生成签名的随机串
					signature, // 必填，签名
					// jsApiList: [ 'checkJsApi', 'updateTimelineShareData', 'onMenuShareWeibo','updateTimelineShareData' ] // 必填，需要使用的JS接口列表
					jsApiList: [
						'onMenuShareQQ',
						'onMenuShareTimeline',
						'onMenuShareAppMessage',
						'onMenuShareWeibo',
						'onMenuShareQZone'
					] // 必填，需要使用的JS接口列表
				});
				wx.ready(function() {
					wx.onMenuShareTimeline(shareData);
					wx.onMenuShareAppMessage(shareData);
					wx.onMenuShareQQ(shareData);
					wx.onMenuShareWeibo(shareData);
					wx.onMenuShareQZone(shareData);
				});
				wx.error(function(res) {
					Toast.info('error: ' + res.errMsg);
				});
			} else {
				this.props.toast.info(result.message);
			}
		});
	}
};
