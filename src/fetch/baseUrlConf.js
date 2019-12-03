/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-12-03 10:11:14
 */
import qs from 'qs';

const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
let baseUrl = '';
// baseMark 00 为信息流url请求前缀
if (query && query.baseMark === '00') {
	baseUrl = '/pop';
} else {
	baseUrl = '/wap';
}

export default baseUrl;
