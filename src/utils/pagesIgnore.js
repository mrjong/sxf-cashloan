import { isWXOpen } from './common';

export default (pathname = window.location.pathname) => {
	if (pathname) {
		let pageList = [];
		if (isWXOpen()) {
			// if (true) {
			pageList = [
				'/protocol/',
                '/activity/',
                '/others/',
				'/common/auth_page',
				'/landing/landing_page',
				'/home/home',
				'/common/wx_middle_page'
			];
		} else {
			pageList = [ '/protocol/', '/activity/', '/common/auth_page', '/landing/landing_page','/others/' ];
		}
		return pageList.some((item) => item && pathname.indexOf(item) > -1);
	}
};
