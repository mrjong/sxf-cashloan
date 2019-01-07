import React from 'react';
import PopUp from 'components/PopUp';
import { Toast } from 'antd-mobile';
import SXFLoading from 'components/SXFLoading';
let popUp = new PopUp(<SXFLoading />);
export const SXFToast = {
	loading: (content, duration = 10, callback, mask) => {
		popUp.close();
		Toast.hide();
		popUp.show();
		if (duration !== 0) {
			setTimeout(() => {
				popUp.close();
				if (typeof callback === 'function') {
					callback();
				}
			}, duration * 1000);
		}
	},
	hide: () => {
		Toast.hide();
		if (popUp) {
			popUp.close();
        }
	}
};
