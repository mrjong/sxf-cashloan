/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-16 10:48:13
 */
import qs from 'qs';

const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
let baseUrl = '';
// baseMark 00 为信息流url请求前缀
if (query && query.baseMark === '00') {
	baseUrl = '/web/api/v09';
} else {
	baseUrl = '/wap';
}

export default baseUrl;
