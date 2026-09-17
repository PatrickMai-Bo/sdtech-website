/**
 * admin-api.js — 后台接口层（依赖 /assets/js/api.js 与 /assets/js/ui.js）
 *
 * 与公开 api.js 的差异：
 *   1) 显式 credentials: 'same-origin'（Session Cookie）
 *   2) 捕获 401 → 自动跳转 /admin/login.html?redirect=<当前路径>
 *   3) 写操作（POST/PUT/PATCH/DELETE）成功自动 Toast.success('保存成功')，
 *      失败 Toast.error(message) 且不清空表单（见 admin-common）
 *
 * 挂载：window.adminApi
 */
(function (window) {
  'use strict';

  var api = window.api;
  var ui = window.ui;

  /** 是否当前处于登录页（避免登录接口 401 时死循环跳转） */
  function onLoginPage() {
    return (window.location.pathname || '').indexOf('/admin/login.html') !== -1;
  }

  /** 统一 401 处理 */
  function handleUnauthorized() {
    if (onLoginPage()) return;
    var next = encodeURIComponent(window.location.pathname + (window.location.search || ''));
    window.location.replace('/admin/login.html?redirect=' + next);
  }

  /**
   * 包装请求：附加 credentials、401 跳转、写操作成功提示
   * @param {Function} caller api 的方法
   * @param {boolean} isWrite 是否写操作
   */
  function wrap(caller, isWrite) {
    return function (path, options) {
      var opts = options || {};
      opts.credentials = 'same-origin';
      return caller.call(api, path, opts)
        .then(function (data) {
          if (isWrite) ui.toast('保存成功', 'success');
          return data;
        })
        .catch(function (err) {
          if (err && err.code === 401) {
            handleUnauthorized();
            throw err;
          }
          ui.toast((err && err.message) || '操作失败', 'error');
          throw err;
        });
    };
  }

  var adminApi = {
    /** 读：不弹 Toast（列表/详情自行处理） */
    get: function (path, options) {
      var opts = options || {};
      opts.credentials = 'same-origin';
      return api.get(path, opts).catch(function (err) {
        if (err && err.code === 401) handleUnauthorized();
        throw err;
      });
    },
    /** 写：新增 */
    post: wrap(api.post, true),
    /** 写：整量更新 */
    put: wrap(api.put, true),
    /** 写：局部更新 */
    patch: wrap(api.patch, true),
    /** 写：删除 */
    del: wrap(api.del, true),

    /**
     * 上传图片（multipart），不走 JSON
     * @param {File} file
     * @returns {Promise<{id,fileName,fileUrl,fileSize,mimeType}>}
     */
    upload: function (file) {
      var form = new FormData();
      form.append('file', file);
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 15000);
      return fetch('/api/admin/upload', {
        method: 'POST',
        body: form,
        credentials: 'same-origin',
        signal: controller.signal
      })
        .then(function (response) {
          if (response.status === 401) { handleUnauthorized(); throw new api.ApiError(401, '登录状态已失效'); }
          return response.json();
        })
        .then(function (payload) {
          if (!payload || payload.code !== 0) {
            throw new api.ApiError(payload ? payload.code : -2, (payload && payload.message) || '上传失败');
          }
          return payload.data;
        })
        .catch(function (err) {
          if (err && err.code === 401) throw err;
          if (err && err.name === 'ApiError') { ui.toast(err.message, 'error'); throw err; }
          ui.toast('上传失败，请重试', 'error');
          throw new api.ApiError(-1, '上传失败');
        })
        .then(function (data) {
          clearTimeout(timer);
          return data;
        }, function (err) {
          clearTimeout(timer);
          throw err;
        });
    },

    /** 主动登出 */
    logout: function () {
      return api.post('/admin/auth/logout', { credentials: 'same-origin', body: {} })
        .catch(function () { return true; })
        .then(function () {
          window.location.replace('/admin/login.html');
        });
    }
  };

  window.adminApi = adminApi;
})(window);
