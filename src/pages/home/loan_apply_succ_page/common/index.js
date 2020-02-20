/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-02-17 15:56:40
 */
import { buriedPointEvent } from 'utils/analytins';
import { activity } from 'utils/analytinsType';
import qs from 'qs';

// 判断是否需要展示弹框
export const isShowCouponModal = ($this) => {
	const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
	if (queryData && queryData.couponInfo && JSON.parse(queryData.couponInfo).popupFlag === '1') {
		$this.setState({
			couponModalShow: true
		});
	} else {
		$this.setState({
			couponModalShow: false
		});
	}
};

// 关闭弹框
export const closeCouponModal = ($this) => {
	buriedPointEvent(activity.closeCouponModal);
	$this.setState({
		couponModalShow: false
	});
};
