import React from 'react';
import PopUp from 'components/PopUp';
import { Toast } from 'antd-mobile';
import SXFLoading from 'components/SXFLoading';
let popUp = new PopUp(<SXFLoading />);
export const SXFToast = {
	loading: (duration = 10, onClose) => {
		popUp.close();
		Toast.hide();
		popUp.show();
		if (!duration && duration !== 0) {
			setTimeout(() => {
				popUp.close();
				if (typeof onClose === 'function') {
					onClose();
				}
			}, duration * 1000);
		} else if (duration && duration !== 0) {
			setTimeout(() => {
				popUp.close();
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
