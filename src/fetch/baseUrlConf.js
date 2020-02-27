/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-02-27 18:33:06
 */
import qs from 'qs';

const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
let baseUrl = '';
// baseMark 00 为信息流url请求前缀
if (query && query.baseMark === '00') {
	baseUrl = '/web/api/v09';
} else {
	baseUrl = '/front';
}

export default baseUrl;
