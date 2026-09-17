/**
 * ui.js — 前台 UI 公共层（挂载到 window.ui）
 *
 * 安全红线：接口字符串入 DOM 只能经 ui.esc() 或 textContent，
 * 严禁使用 innerHTML 承载接口数据。el() 的 props.html 仅限代码内静态串。
 *
 * 导出：esc / el / img / skeleton / toast / modal / accordion / fmtTime / empty
 *       / ICONS（内联 SVG 图标表，静态常量，可安全用于 innerHTML）
 */
(function (window, document) {
  'use strict';

  var PLACEHOLDER = '/assets/img/placeholder.svg';

  /* ------------------------------------------------------------------ *
   * 1. esc —— HTML 转义（& < > " '）
   * ------------------------------------------------------------------ */
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------ *
   * 2. el —— 创建元素
   *    el('div', { class:'p-4', text:'abc' }, [childEl])
   *    props.text 走 textContent（安全）；props.html 仅限静态串。
   * ------------------------------------------------------------------ */
  function el(tag, props, children) {
    var node = document.createElement(tag);
    var options = props || {};
    Object.keys(options).forEach(function (key) {
      var value = options[key];
      if (value === null || value === undefined || value === false) return;
      if (key === 'text') { node.textContent = String(value); return; }
      if (key === 'html') { node.innerHTML = String(value); return; }
      if (key === 'style' && typeof value === 'object') {
        Object.keys(value).forEach(function (sk) { node.style[sk] = value[sk]; });
        return;
      }
      if (key === 'dataset' && typeof value === 'object') {
        Object.keys(value).forEach(function (dk) { node.dataset[dk] = value[dk]; });
        return;
      }
      if (key.slice(0, 2) === 'on' && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
        return;
      }
      node.setAttribute(key, String(value));
    });
    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  /* ------------------------------------------------------------------ *
   * 3. img —— 图片元素 + 三级降级
   *    src → placehold.co → /assets/img/placeholder.svg（本地必达）
   * ------------------------------------------------------------------ */
  function img(src, alt, w, h, cls) {
    var node = document.createElement('img');
    node.loading = 'lazy';
    node.decoding = 'async';
    node.alt = alt || '';
    if (w) node.width = w;
    if (h) node.height = h;
    node.className = cls || '';
    node.onerror = function () {
      // 二级：在线占位图
      node.onerror = function () {
        // 三级：本地必达兜底
        node.onerror = null;
        node.src = PLACEHOLDER;
      };
      node.src = 'https://placehold.co/' + (w || 800) + 'x' + (h || 600) + '/EDF0F3/8B929A?text=SDTech';
    };
    node.src = src || PLACEHOLDER;
    return node;
  }

  /* ------------------------------------------------------------------ *
   * 4. skeleton —— 静态骨架屏（不使用 infinite 动画）
   * ------------------------------------------------------------------ */
  function skeleton(count, cls) {
    var wrap = el('div', { class: 'grid gap-6 ' + (cls || 'md:grid-cols-3') });
    var total = Math.max(1, count || 3);
    for (var i = 0; i < total; i++) {
      wrap.appendChild(el('div', { class: 'sd-skeleton h-48 w-full' }));
    }
    return wrap;
  }

  /* ------------------------------------------------------------------ *
   * 5. toast —— 2.5s 后淡出
   * ------------------------------------------------------------------ */
  var toastWrap = null;
  function ensureToastWrap() {
    if (toastWrap && document.body.contains(toastWrap)) return toastWrap;
    toastWrap = el('div', { class: 'sd-toast-wrap', 'aria-live': 'polite' });
    document.body.appendChild(toastWrap);
    return toastWrap;
  }
  function toast(message, type) {
    var wrap = ensureToastWrap();
    var kind = type === 'success' ? 'is-success' : (type === 'error' ? 'is-error' : 'is-info');
    var node = el('div', { class: 'sd-toast ' + kind, text: message || '' });
    wrap.appendChild(node);
    // 下一帧加 is-in 触发过渡
    requestAnimationFrame(function () { node.classList.add('is-in'); });
    setTimeout(function () {
      node.classList.remove('is-in');
      setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 220);
    }, 2500);
    return node;
  }

  /* ------------------------------------------------------------------ *
   * 6. modal —— 遮罩淡入 150ms + 内容 scale .98→1 200ms
   *    ESC / 点击遮罩关闭；关闭时恢复 body 滚动。
   *    modal({ title, bodyEl, footerEl, size })
   *    返回 { close() }
   * ------------------------------------------------------------------ */
  function modal(options) {
    var opts = options || {};
    var panel = el('div', {
      class: 'sd-modal-panel w-full bg-white rounded-card shadow-[0_24px_64px_rgba(31,35,40,0.18)] ' +
        'max-h-[92vh] overflow-hidden flex flex-col ' +
        (opts.size === 'full' ? 'w-full h-full rounded-none' : 'max-w-[880px] mx-4')
    });

    var header = el('div', { class: 'flex items-start justify-between gap-4 px-6 py-4 border-b border-line' }, [
      el('h3', { class: 'text-lg font-semibold text-ink', text: opts.title || '' }),
      el('button', {
        type: 'button',
        class: 'shrink-0 w-8 h-8 rounded-ctl border border-line text-inkWeak hover:text-ink hover:border-inkWeak transition-colors duration-200 flex items-center justify-center',
        'aria-label': '关闭',
        html: ICONS.close,
        onclick: function () { close(); }
      })
    ]);

    var bodyBox = el('div', { class: 'px-6 py-5 overflow-y-auto' });
    if (opts.bodyEl) bodyBox.appendChild(opts.bodyEl);

    var footerBox = null;
    if (opts.footerEl) {
      footerBox = el('div', { class: 'px-6 py-4 border-t border-line flex justify-end gap-3' });
      footerBox.appendChild(opts.footerEl);
    }

    panel.appendChild(header);
    panel.appendChild(bodyBox);
    if (footerBox) panel.appendChild(footerBox);

    var mask = el('div', {
      class: 'sd-modal-mask fixed inset-0 z-50 bg-ink/45 flex items-center justify-center p-0 md:p-6'
    }, [panel]);

    function onKey(event) {
      if (event.key === 'Escape' || event.key === 'Esc') { close(); }
    }
    mask.addEventListener('click', function (event) {
      if (event.target === mask) close();
    });

    function close() {
      document.removeEventListener('keydown', onKey);
      mask.classList.remove('is-open');
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function () {
        if (mask.parentNode) mask.parentNode.removeChild(mask);
      }, 220);
    }

    document.body.appendChild(mask);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(function () {
      mask.classList.add('is-open');
      panel.classList.add('is-open');
    });

    // 简易焦点陷阱：打开后聚焦面板
    panel.setAttribute('tabindex', '-1');
    panel.focus();

    return { close: close, panel: panel };
  }

  /* ------------------------------------------------------------------ *
   * 7. accordion —— FAQ 折叠，max-height 过渡 250ms，可多开
   *    container 结构：.sd-acc-item > (按钮, .sd-acc-body)
   * ------------------------------------------------------------------ */
  function accordion(container) {
    if (!container) return;
    var items = container.querySelectorAll('.sd-acc-item');
    Array.prototype.forEach.call(items, function (item) {
      var trigger = item.querySelector('[data-acc-trigger]');
      var body = item.querySelector('.sd-acc-body');
      if (!trigger || !body) return;
      trigger.addEventListener('click', function () {
        var open = item.classList.toggle('is-open');
        body.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. fmtTime —— '2026-09-16 10:00:00' → '2026-09-16 10:00'
   * ------------------------------------------------------------------ */
  function fmtTime(value) {
    if (!value) return '';
    var text = String(value).trim();
    // 只做字符串裁剪，避免 Safari 对 ISO 串的解析差异
    return text.length > 16 ? text.slice(0, 16) : text;
  }

  /* ------------------------------------------------------------------ *
   * 9. empty —— 空态
   * ------------------------------------------------------------------ */
  function empty(target, text) {
    var node = el('div', { class: 'py-16 text-center' }, [
      el('div', { class: 'mx-auto mb-4 h-12 w-12 rounded-full bg-surface flex items-center justify-center text-inkWeak', html: ICONS.image }),
      el('p', { class: 'text-sm text-inkWeak', text: text || '敬请期待' })
    ]);
    if (target) {
      target.textContent = '';
      target.appendChild(node);
    }
    return node;
  }

  /* ------------------------------------------------------------------ *
   * 10. fallback —— 区块加载失败兜底（统一后缀）
   * ------------------------------------------------------------------ */
  function fallback(target, what) {
    var node = el('div', { class: 'py-10 text-center' }, [
      el('p', { class: 'text-sm text-inkWeak', text: (what || '内容') + '暂时无法显示，请稍后刷新' })
    ]);
    if (target) {
      target.textContent = '';
      target.appendChild(node);
    }
    return node;
  }

  /* ------------------------------------------------------------------ *
   * 11. ICONS —— 内联 SVG 图标表（lucide outline 风格，静态常量）
   * ------------------------------------------------------------------ */
  var ICONS = {
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    arrowRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    arrowLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    chevronDown: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>',
    image: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.35-4.35a2 2 0 0 0-2.83 0L3 21"/></svg>',
    wechat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3C5.13 3 2 5.58 2 8.86c0 1.84.99 3.48 2.54 4.56L3.8 16.2l2.6-1.35c.83.24 1.72.37 2.6.37h.5"/><path d="M22 14.2c0-2.9-3.13-5.2-7-5.2s-7 2.3-7 5.2c0 2.9 3.13 5.2 7 5.2.8 0 1.6-.1 2.35-.3l2.25 1.15-.6-2.2c1.2-.9 2-2.2 2-3.85Z"/></svg>',
    xianyu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
    taobao: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16"/><path d="M5 8l1.5 11h11L19 8"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    pdd: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h6"/><path d="M10 10v6"/></svg>',
    shop: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-1 11H4L3 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    monitor: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
    palette: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.5A4.5 4.5 0 0 0 22 11c0-5-4.5-9-10-9Z"/></svg>',
    video: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="14" height="16" rx="2"/><path d="m16 10 6-4v12l-6-4Z"/></svg>',
    file: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
    sparkle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6"/><path d="M12 15v6"/><path d="M3 12h6"/><path d="M15 12h6"/></svg>',
    link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.8-1.7"/></svg>',
    layers: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
    quote: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V8a4 4 0 0 1 4-4"/><path d="M5 11h6v10"/></svg>',
    logout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
    dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="10" width="7" height="11" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
    home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
    message: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
  };

  /** 按 key 取图标，未命中返回通用图标 */
  function icon(key) {
    return ICONS[key] || ICONS.sparkle;
  }

  window.ui = {
    esc: esc,
    el: el,
    img: img,
    skeleton: skeleton,
    toast: toast,
    modal: modal,
    accordion: accordion,
    fmtTime: fmtTime,
    empty: empty,
    fallback: fallback,
    ICONS: ICONS,
    icon: icon,
    PLACEHOLDER: PLACEHOLDER
  };
})(window, document);
