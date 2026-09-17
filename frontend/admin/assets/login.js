/**
 * login.js — 后台登录页
 *
 * POST /api/admin/auth/login {username,password}
 *   - 失败（400/401/429）→ 表单上方灰底提示（文案由后端 message 提供，缺失时兜底）
 *   - 成功 → 跳转 redirect 参数或 /admin/index.html
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

  /** 读取 redirect 参数（防止开放重定向：只接受站内 /admin/ 路径） */
  function safeRedirect() {
    var params = new URLSearchParams(window.location.search || '');
    var target = params.get('redirect') || '';
    if (target && target.indexOf('/admin/') === 0) return target;
    return '/admin/index.html';
  }

  function render() {
    var root = document.getElementById('login-root');
    if (!root) return;
    root.textContent = '';

    var username = el('input', { type: 'text', class: 'sd-input', autocomplete: 'username', placeholder: '管理员账号' });
    var password = el('input', { type: 'password', class: 'sd-input', autocomplete: 'current-password', placeholder: '密码' });
    var tip = el('div', { class: 'hidden rounded-ctl border border-line bg-surface px-3 py-2 text-sm text-inkMid' });
    var submitBtn = el('button', { type: 'submit', class: 'sd-btn-primary w-full' }, ['登录']);

    var form = el('form', { class: 'w-full max-w-[380px] rounded-card border border-line bg-white p-8' }, [
      el('div', { class: 'mb-6 flex items-center gap-3' }, [
        ui.img('/assets/img/favicon.svg', '', 32, 32, 'h-8 w-8 rounded-icon'),
        el('div', {}, [
          el('h1', { class: 'text-base font-semibold text-ink', text: '管理后台' }),
          el('p', { class: 'text-xs text-inkWeak', text: '请使用管理员账号登录' })
        ])
      ]),
      tip,
      el('div', { class: 'sd-field' }, [
        el('label', { class: 'sd-label', text: '账号' }),
        username
      ]),
      el('div', { class: 'sd-field' }, [
        el('label', { class: 'sd-label', text: '密码' }),
        password
      ]),
      submitBtn,
      el('p', { class: 'mt-4 text-xs text-inkWeak text-center', text: '会话有效期 8 小时，服务重启后需重新登录' })
    ]);

    function setTip(message) {
      if (message) {
        tip.textContent = message;
        tip.classList.remove('hidden');
      } else {
        tip.textContent = '';
        tip.classList.add('hidden');
      }
    }

    function setLoading(loading) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? '登录中…' : '登录';
      if (loading) submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
      else submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      setTip('');
      var name = username.value.trim();
      var pwd = password.value;
      if (!name || !pwd) { setTip('请输入账号与密码'); return; }
      setLoading(true);
      api.post('/admin/auth/login', {
        body: { username: name, password: pwd },
        credentials: 'same-origin',
        timeout: 8000
      })
        .then(function () {
          window.location.replace(safeRedirect());
        })
        .catch(function (err) {
          // 400 账号或密码错误 / 429 过于频繁 / 网络异常分别给出提示
          if (err && err.code === 429) setTip(err.message || '操作过于频繁，请稍后再试');
          else if (err && (err.code === 400 || err.code === 401)) setTip(err.message || '账号或密码错误');
          else setTip((err && err.message) || '登录失败，请稍后重试');
          setLoading(false);
        });
    });

    root.appendChild(form);
    username.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})(window, document);
