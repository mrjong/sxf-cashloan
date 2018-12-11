import React from 'react';
import PopUp from 'components/PopUp';
import { Toast } from 'antd-mobile';
import SXFLoading from 'components/SXFLoading';
let popUp;
export const SXFToast = {
	loading: (content, duration, onClose, mask) => {
		popUp = new PopUp(<SXFLoading content mask />);
		Toast.hide();
		popUp.show();
		if (!duration) {
			setTimeout(() => {
				popUp.close();
				if (typeof onClose === 'function') {
					onClose();
				}
			}, 10 * 1000);
		} else if (duration && duration !== 0) {
			setTimeout(() => {
				popUp.close();
				if (typeof onClose === 'function') {
					onClose();
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
