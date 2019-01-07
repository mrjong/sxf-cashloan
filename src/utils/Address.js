import { store } from 'utils/store';
import { getLocation } from 'utils/publicApi';
import { isMPOS } from 'utils';
export const address = () => {
	if (store.getPosition()) {
		return;
	}
	if (isMPOS()) {
		getLocation();
	} else {
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r) {
			// console.log('this.getStatus() == BMAP_STATUS_SUCCESS:', this.getStatus());

			if (this.getStatus() == BMAP_STATUS_SUCCESS) {
				const lngValue = r.point && r.point.lng;
				const latValue = r.point && r.point.lat;
				// console.log('const latValue = r.point && r.point.lat：', r);
				if (latValue && lngValue) {
					new AMap.convertFrom(`${lngValue},${latValue}`, 'baidu', function(status, res) {
						var lnglatXY = `${res.locations[0].lng},${res.locations[0].lat}`; //地图上所标点的坐标
						// console.log('lnglatXY:',lnglatXY);
						store.setPosition(lnglatXY);
						// store.dispatch(actions.setVars('location',lnglatXY));
						new AMap.service('AMap.Geocoder', function() {
							//回调函数
							//实例化Geocoder
							var geocoder = new AMap.Geocoder();
							geocoder.getAddress(lnglatXY, function(status, result) {
								if (status === 'complete' && result.info === 'OK') {
									// console.log('高德转化百度'+result.regeocode.formattedAddress)
								} else {
									//获取地址失败
								}
							});
							geocoder.getLocation(lnglatXY, function(status, result) {
								if (status === 'complete' && result.info === 'OK') {
									// console.log(result,1231123)
								} else {
								}
							});
						});
					});
				}
			} else {
				// console.log('failed'+this.getStatus());
			}
		});
	}
};
export function getLngLat(address) {
	return new Promise((resolve, reject) => {
		new AMap.service('AMap.Geocoder', function() {
			const geocoder = new AMap.Geocoder();
			geocoder.getLocation(address, function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
					const lngValue = result.geocodes[0].location.lng;
					const latValue = result.geocodes[0].location.lat;
					resolve(`${lngValue},${latValue}`);
				} else {
					reject();
				}
			});
		});
	});
}
export function getAddress() {
	return new Promise((resolve, reject) => {
		new AMap.service('AMap.Geocoder', function() {
			const geocoder = new AMap.Geocoder();
			const address = store.getPosition();
			// console.log(" store.getPosition()", address);
			if (address) {
				const addressData = address.split(',').map((item) => window.parseFloat(item, 10));
				geocoder.getAddress(addressData, function(status, result) {
					if (status === 'complete' && result.info === 'OK') {
						resolve(result.regeocode.addressComponent);
					} else {
						reject();
					}
				});
			} else {
				reject();
			}
		});
	});
}
