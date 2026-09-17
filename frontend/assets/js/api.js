/**
 * api.js — 公开站点 fetch 封装（无框架、无构建，挂载到 window.api）
 *
 * 约定：
 *   - 基址恒为相对路径 '/api'（同源，零跨域），禁止写死域名或 IP
 *   - 默认 3s 超时降级（G-05）
 *   - 不缓存任何 /api/public/**（保证后台改完刷新即生效）
 *   - 所有失败统一抛 ApiError，调用方必须 .catch
 *
 * ApiError.code 语义：
 *   -1 请求超时   -2 网络/解析异常   其他为后端业务错误码（400/401/429/500…）
 */
(function (window) {
  'use strict';

  var API = '/api';
  var DEFAULT_TIMEOUT = 3000;

  /** 统一 API 错误对象 */
  function ApiError(code, message) {
    this.name = 'ApiError';
    this.code = typeof code === 'number' ? code : -2;
    this.message = message || '请求失败，请稍后重试';
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  /**
   * 拼接查询串（值为 null/undefined/'' 时忽略）
   * @param {Object} params
   * @returns {string} 形如 '?a=1&b=2'，无参数时返回 ''
   */
  function buildQuery(params) {
    if (!params) return '';
    var parts = [];
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value === null || value === undefined || value === '') return;
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return parts.length ? '?' + parts.join('&') : '';
  }

  /**
   * 核心请求方法
   * @param {string} method  HTTP 方法
   * @param {string} path    以 '/' 开头的接口路径，如 '/public/cases'
   * @param {Object} [options]
   * @param {Object} [options.body]      请求体（自动 JSON 序列化）
   * @param {Object} [options.params]    query 参数
   * @param {number} [options.timeout]   超时毫秒，默认 3000
   * @param {string} [options.credentials] 'omit' | 'same-origin' | 'include'
   * @returns {Promise<*>} 成功返回响应体中的 data
   * @throws {ApiError}
   */
  async function request(method, path, options) {
    var opts = options || {};
    var timeout = typeof opts.timeout === 'number' ? opts.timeout : DEFAULT_TIMEOUT;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeout);

    var init = {
      method: method,
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    };
    if (opts.credentials) init.credentials = opts.credentials;
    if (opts.body !== undefined && opts.body !== null) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }

    var url = API + path + buildQuery(opts.params);
    var response = null;
    try {
      response = await fetch(url, init);
    } catch (err) {
      if (controller.signal.aborted) throw new ApiError(-1, '请求超时');
      throw new ApiError(-2, '网络异常');
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 401) throw new ApiError(401, '登录状态已失效');

    var payload = null;
    try {
      payload = await response.json();
    } catch (err) {
      throw new ApiError(-2, '响应格式异常');
    }
    if (!payload || typeof payload !== 'object') throw new ApiError(-2, '响应格式异常');
    if (payload.code !== 0) {
      throw new ApiError(payload.code, payload.message || '请求失败');
    }
    return payload.data;
  }

  var api = {
    ApiError: ApiError,
    /** GET：api.get('/public/cases', { params: { page: 1 } }) */
    get: function (path, options) { return request('GET', path, options); },
    /** POST：api.post('/public/messages', { body: {...} }) */
    post: function (path, options) { return request('POST', path, options); },
    /** PUT：api.put('/admin/site/content', { body: [...] }) */
    put: function (path, options) { return request('PUT', path, options); },
    /** PATCH：api.patch('/admin/cases/1/featured', { body: {...} }) */
    patch: function (path, options) { return request('PATCH', path, options); },
    /** DELETE：api.del('/admin/cases/1') */
    del: function (path, options) { return request('DELETE', path, options); }
  };

  window.api = api;
})(window);
