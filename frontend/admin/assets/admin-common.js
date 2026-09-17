/**
 * admin-common.js — 后台公共外壳（依赖 ui.js / admin-api.js）
 *
 * 导出（window.common / window.AdminCommon）：
 *   mountShell(active)  注入左侧 240px 导航 + 顶栏 56px + 未读角标，返回内容容器
 *   content()           获取内容容器
 *   confirm(title,text) Promise<boolean>，删除等危险操作二次确认
 *   upload(fileInput, opts) 选文件即传，回填隐藏 input 与预览 img
 *   pickUpload(opts)    直接弹出文件选择并上传，返回 Promise<fileUrl>
 *   field(label, control, opts)  表单字段包装
 *   toast(msg, type)
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var el = ui.el;

  /** 左侧导航结构（url 与 active key） */
  var NAV_ITEMS = [
    { key: 'dashboard', title: '概览', url: '/admin/index.html', icon: 'dashboard' },
    { key: 'home', title: '首页内容', url: '/admin/home.html', icon: 'home' },
    { key: 'services', title: '业务管理', url: '/admin/services.html', icon: 'grid' },
    { key: 'cases', title: '案例管理', url: '/admin/cases.html', icon: 'layers' },
    { key: 'pricing', title: '报价管理', url: '/admin/pricing.html', icon: 'quote' },
    { key: 'shops', title: '店铺链接', url: '/admin/shops.html', icon: 'shop' },
    { key: 'messages', title: '留言管理', url: '/admin/messages.html', icon: 'message', badge: true }
  ];

  var contentBox = null;

  /* ------------------------------------------------------------------ *
   * 1. 外壳：侧栏 + 顶栏
   * ------------------------------------------------------------------ */
  function buildSidebar(active) {
    var links = el('nav', { class: 'flex flex-col gap-1 px-3 py-4', 'aria-label': '后台导航' });
    var badgeRefs = {};

    NAV_ITEMS.forEach(function (item) {
      var isActive = active === item.key;
      var badge = null;
      if (item.badge) {
        badge = el('span', {
          class: 'ml-auto hidden min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[11px] leading-[18px] text-center',
          text: '0'
        });
        badgeRefs[item.key] = badge;
      }
      links.appendChild(el('a', {
        href: item.url,
        class: 'sd-admin-nav-item' + (isActive ? ' is-active' : '')
      }, [
        el('span', { class: 'w-4 h-4', html: ui.icon(item.icon) }),
        el('span', { text: item.title }),
        badge
      ]));
    });

    var aside = el('aside', { class: 'sd-admin-sidebar fixed inset-y-0 left-0 z-50 lg:static lg:z-auto overflow-y-auto' }, [
      el('div', { class: 'h-14 flex items-center gap-2 px-4 border-b border-line' }, [
        ui.img('/assets/img/favicon.svg', '', 24, 24, 'h-6 w-6 rounded-[6px]'),
        el('span', { class: 'text-sm font-semibold text-ink', text: '管理后台' })
      ]),
      links,
      el('div', { class: 'mt-4 px-4 pb-6' }, [
        el('a', { href: '/index.html', target: '_blank', rel: 'noopener noreferrer', class: 'text-xs text-inkWeak hover:text-primary transition-colors duration-200', text: '查看前台站点 ↗' })
      ])
    ]);
    return { aside: aside, badges: badgeRefs };
  }

  function buildTopbar(profile, onMenu) {
    var menuBtn = el('button', {
      type: 'button',
      class: 'lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-ctl border border-line text-inkDeep',
      'aria-label': '菜单',
      html: ui.ICONS.menu
    });
    menuBtn.addEventListener('click', onMenu);

    var name = (profile && (profile.realName || profile.username)) || '';
    var logoutBtn = el('button', {
      type: 'button',
      class: 'inline-flex items-center gap-2 rounded-ctl border border-line px-3 py-1.5 text-xs text-inkMid hover:border-primary hover:text-primary transition-colors duration-200'
    }, [
      el('span', { html: ui.ICONS.logout }),
      el('span', { text: '退出登录' })
    ]);
    logoutBtn.addEventListener('click', function () {
      common.confirm('退出登录', '确认退出当前管理员账号？').then(function (yes) {
        if (yes) adminApi.logout();
      });
    });

    return el('header', { class: 'sd-admin-topbar flex items-center justify-between px-4 md:px-6' }, [
      el('div', { class: 'flex items-center gap-3' }, [
        menuBtn,
        el('span', { class: 'text-sm text-inkMid', text: '欢迎回来' })
      ]),
      el('div', { class: 'flex items-center gap-3' }, [
        el('span', { class: 'text-sm text-ink', text: name }),
        logoutBtn
      ])
    ]);
  }

  /**
   * 注入后台外壳
   * @param {string} active 当前页 key：dashboard/home/services/cases/pricing/shops/messages
   * @returns {HTMLElement} 内容容器
   */
  function mountShell(active) {
    var host = document.getElementById('admin-shell') || document.body;
    host.textContent = '';
    document.body.classList.add('sd-admin');

    var shell = buildSidebar(active);
    var aside = shell.aside;
    var mask = el('div', { class: 'fixed inset-0 z-40 bg-ink/40 hidden lg:hidden' });

    function openAside() { aside.classList.add('is-open'); mask.classList.remove('hidden'); }
    function closeAside() { aside.classList.remove('is-open'); mask.classList.add('hidden'); }
    mask.addEventListener('click', closeAside);

    contentBox = el('main', { class: 'sd-admin-main p-5 md:p-8' });

    var topbar = buildTopbar(null, openAside);
    var right = el('div', { class: 'flex-1 min-w-0 flex flex-col' }, [topbar, contentBox]);
    var layout = el('div', { class: 'flex min-h-screen' }, [aside, mask, right]);
    host.appendChild(layout);

    // 拉取管理员信息 + 未读数
    adminApi.get('/admin/auth/profile')
      .then(function (profile) {
        var newTopbar = buildTopbar(profile, openAside);
        right.replaceChild(newTopbar, topbar);
        var unread = (profile && profile.unreadCount) || 0;
        Object.keys(shell.badges).forEach(function (key) {
          var badge = shell.badges[key];
          if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : String(unread);
            badge.classList.remove('hidden');
          } else {
            badge.classList.add('hidden');
          }
        });
        if (typeof window.adminProfile === 'undefined') window.adminProfile = profile;
      })
      .catch(function () { /* 401 已由 admin-api 统一跳转 */ });

    return contentBox;
  }

  /* ------------------------------------------------------------------ *
   * 2. 二次确认框
   * ------------------------------------------------------------------ */
  function confirmDialog(title, text) {
    return new Promise(function (resolve) {
      var okBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '确认' });
      var cancelBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-5 !py-2', text: '取消' });
      var dialog = ui.modal({
        title: title || '请确认',
        bodyEl: el('p', { class: 'text-sm text-inkMid pre-wrap', text: text || '' }),
        footerEl: el('div', { class: 'flex gap-3' }, [cancelBtn, okBtn])
      });
      function done(value) { dialog.close(); resolve(value); }
      okBtn.addEventListener('click', function () { done(true); });
      cancelBtn.addEventListener('click', function () { done(false); });
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. 上传控件
   * ------------------------------------------------------------------ */
  /**
   * 解析目标元素（支持选择器字符串或元素）
   * @param {string|Element} ref
   * @returns {Element|null}
   */
  function resolveEl(ref) {
    if (!ref) return null;
    if (typeof ref === 'string') return document.querySelector(ref);
    return ref;
  }

  /**
   * 上传单个文件并回填
   * @param {File} file
   * @param {Object} opts { target: 隐藏 input（回填 URL）, preview: <img> 预览 }
   * @returns {Promise<string>} 文件 URL
   */
  function uploadFile(file, opts) {
    var options = opts || {};
    return adminApi.upload(file).then(function (data) {
      var url = data && data.fileUrl ? data.fileUrl : '';
      var target = resolveEl(options.target);
      if (target) target.value = url;
      var preview = resolveEl(options.preview);
      if (preview) {
        if (preview.tagName === 'IMG') {
          preview.src = url || ui.PLACEHOLDER;
        } else if (options.previewImage && resolveEl(options.previewImage)) {
          resolveEl(options.previewImage).src = url || ui.PLACEHOLDER;
        }
      }
      return url;
    });
  }

  /**
   * 绑定文件选择控件：选中文件即上传并回填
   * @param {HTMLInputElement} fileInput <input type="file">
   * @param {Object} opts { target, preview, onDone(url) }
   */
  function upload(fileInput, opts) {
    var input = resolveEl(fileInput);
    if (!input) return;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      uploadFile(file, opts)
        .then(function (url) { if (opts && typeof opts.onDone === 'function') opts.onDone(url); })
        .catch(function () { /* Toast 已由 admin-api 提示 */ });
      input.value = '';
    });
  }

  /** 直接弹出文件选择并上传，返回 URL Promise */
  function pickUpload(opts) {
    return new Promise(function (resolve) {
      var input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml', style: { display: 'none' } });
      document.body.appendChild(input);
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) { document.body.removeChild(input); resolve(''); return; }
        uploadFile(file, opts)
          .then(function (url) {
            document.body.removeChild(input);
            if (opts && typeof opts.onDone === 'function') opts.onDone(url);
            resolve(url);
          })
          .catch(function () {
            document.body.removeChild(input);
            resolve('');
          });
      });
      input.click();
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. 表单辅助
   * ------------------------------------------------------------------ */
  /** 字段包装：label + 控件 + 提示 */
  function field(label, control, options) {
    var opts = options || {};
    return el('div', { class: 'sd-field' }, [
      el('label', { class: 'sd-label' + (opts.required ? ' sd-required' : ''), text: label }),
      control,
      opts.hint ? el('p', { class: 'sd-hint', text: opts.hint }) : null
    ]);
  }

  /** 文本输入 */
  function input(options) {
    var opts = options || {};
    return el('input', {
      type: opts.type || 'text',
      class: 'sd-input',
      value: opts.value === undefined || opts.value === null ? '' : String(opts.value),
      placeholder: opts.placeholder || '',
      maxlength: opts.maxlength || null
    });
  }

  /** 多行文本 */
  function textarea(options) {
    var opts = options || {};
    var node = el('textarea', { class: 'sd-input sd-textarea', placeholder: opts.placeholder || '' });
    node.value = opts.value === undefined || opts.value === null ? '' : String(opts.value);
    return node;
  }

  /** 下拉 */
  function select(options, value) {
    var node = el('select', { class: 'sd-input' });
    (options || []).forEach(function (option) {
      var opt = el('option', { value: option.value, text: option.label });
      if (String(option.value) === String(value)) opt.selected = true;
      node.appendChild(opt);
    });
    return node;
  }

  /** 开关（checkbox 风格的按钮组） */
  function toggle(options) {
    var opts = options || {};
    var checked = !!opts.value;
    var btn = el('button', {
      type: 'button',
      class: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ' + (checked ? 'bg-primary' : 'bg-line')
    }, [
      el('span', {
        class: 'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ' + (checked ? 'translate-x-[22px]' : 'translate-x-[2px]')
      })
    ]);
    btn.dataset.on = checked ? '1' : '0';
    btn.addEventListener('click', function () {
      var next = btn.dataset.on !== '1';
      btn.dataset.on = next ? '1' : '0';
      btn.className = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ' + (next ? 'bg-primary' : 'bg-line');
      btn.firstChild.className = 'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ' + (next ? 'translate-x-[22px]' : 'translate-x-[2px]');
      if (typeof opts.onChange === 'function') opts.onChange(next);
    });
    return btn;
  }

  /** 读取开关值 */
  function toggleValue(node) {
    return node && node.dataset && node.dataset.on === '1' ? 1 : 0;
  }

  /** 图片字段：URL 输入 + 上传按钮 + 预览 */
  function imageField(options) {
    var opts = options || {};
    var urlInput = input({ value: opts.value || '', placeholder: opts.placeholder || '粘贴图片 URL 或点击右侧上传' });
    var preview = ui.img(opts.value || '', '', 240, 180, 'sd-upload-preview');
    var fileInput = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml', class: 'hidden' });
    var uploadBtn = el('button', {
      type: 'button',
      class: 'inline-flex items-center gap-1 rounded-ctl border border-line px-3 py-1.5 text-xs text-inkMid hover:border-primary hover:text-primary transition-colors duration-200'
    }, [el('span', { html: ui.ICONS.upload }), el('span', { text: '上传图片' })]);

    upload(fileInput, {
      target: urlInput,
      preview: preview,
      onDone: function (url) { preview.src = url || ui.PLACEHOLDER; }
    });
    uploadBtn.addEventListener('click', function () { fileInput.click(); });
    urlInput.addEventListener('input', function () {
      preview.src = urlInput.value.trim() || ui.PLACEHOLDER;
    });

    return {
      /** 外层容器 */
      node: el('div', { class: 'flex items-start gap-4' }, [
        preview,
        el('div', { class: 'flex-1' }, [
          el('div', { class: 'flex gap-2' }, [urlInput, uploadBtn]),
          el('p', { class: 'sd-hint', text: '支持 jpg/png/webp/gif/svg，单张 ≤5MB' })
        ]),
        fileInput
      ]),
      /** 取值 */
      getValue: function () { return urlInput.value.trim(); }
    };
  }

  /* ------------------------------------------------------------------ *
   * 5. 右侧抽屉（编辑面板）
   * ------------------------------------------------------------------ */
  /**
   * 打开右侧抽屉
   * @param {Object} opts { title, bodyEl, footerEl, width }
   * @returns {{close: Function, panel: Element}}
   */
  function drawer(opts) {
    var options = opts || {};
    var panel = el('div', {
      class: 'sd-drawer-panel fixed inset-y-0 right-0 z-50 bg-white border-l border-line shadow-[0_8px_32px_rgba(31,35,40,0.14)] ' +
        'flex flex-col w-full ' + (options.width || 'max-w-[560px]')
    });

    var closeBtn = el('button', {
      type: 'button',
      class: 'w-8 h-8 inline-flex items-center justify-center rounded-ctl border border-line text-inkWeak hover:text-ink transition-colors duration-200',
      'aria-label': '关闭',
      html: ui.ICONS.close
    });

    panel.appendChild(el('div', { class: 'flex items-center justify-between gap-3 px-6 py-4 border-b border-line' }, [
      el('h3', { class: 'text-base font-semibold text-ink', text: options.title || '编辑' }),
      closeBtn
    ]));

    var body = el('div', { class: 'flex-1 overflow-y-auto px-6 py-5' });
    if (options.bodyEl) body.appendChild(options.bodyEl);
    panel.appendChild(body);

    if (options.footerEl) {
      panel.appendChild(el('div', { class: 'px-6 py-4 border-t border-line flex justify-end gap-3' }, [options.footerEl]));
    }

    var mask = el('div', { class: 'sd-mask fixed inset-0 z-40 bg-ink/40' });
    document.body.appendChild(mask);
    document.body.appendChild(panel);
    document.body.style.overflow = 'hidden';

    function close() {
      document.removeEventListener('keydown', onKey);
      panel.classList.remove('is-open');
      mask.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function () {
        if (panel.parentNode) panel.parentNode.removeChild(panel);
        if (mask.parentNode) mask.parentNode.removeChild(mask);
      }, 260);
    }
    function onKey(event) {
      if (event.key === 'Escape' || event.key === 'Esc') close();
    }
    closeBtn.addEventListener('click', close);
    mask.addEventListener('click', close);
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(function () {
      panel.classList.add('is-open');
      mask.classList.add('is-open');
    });
    return { close: close, panel: panel, body: body };
  }

  var common = {
    mountShell: mountShell,
    content: function () { return contentBox || document.body; },
    confirm: confirmDialog,
    drawer: drawer,
    upload: upload,
    uploadFile: uploadFile,
    pickUpload: pickUpload,
    field: field,
    input: input,
    textarea: textarea,
    select: select,
    toggle: toggle,
    toggleValue: toggleValue,
    imageField: imageField,
    toast: function (message, type) { ui.toast(message, type); },
    NAV_ITEMS: NAV_ITEMS
  };

  window.common = common;
  window.AdminCommon = common;
})(window, document);
