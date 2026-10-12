/**
 * ui.js — 前台 UI 公共层（挂载到 window.ui）
 *
 * 安全红线：接口字符串入 DOM 只能经 ui.esc() 或 textContent，
 * 严禁使用 innerHTML 承载接口数据。el() 的 props.html 仅限代码内静态串。
 *
 * 导出：
 *   esc / el / img / skeleton / toast / modal / accordion / fmtTime / empty / fallback
 *   sectionHead / banner / timeline / quoteCard / caseCard / shopCard / isNegotiable
 *   ICONS（内联 SVG 图标表，静态常量，可安全用于 innerHTML）
 *
 * 约定：所有 class 均为完整字符串（禁止 'bg-' + x 拼接），保证 Tailwind 预编译可扫描。
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
   *    container 结构：.sd-acc-item > (button, .sd-acc-body)
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
   * 11. sectionHead —— 全站统一的节标题组件
   *     eyebrow（主色 + 前置 24px 短线）+ 标题 + 描述，左对齐；
   *     opts.center 居中变体；opts.bare 去掉自身下边距（由外层控制）。
   * ------------------------------------------------------------------ */
  function sectionHead(eyebrow, title, desc, opts) {
    var options = opts || {};
    var center = !!options.center;
    return el('div', {
      class: 'max-w-[720px] ' + (options.bare ? '' : 'mb-10 md:mb-14 ') + (center ? 'mx-auto text-center' : '')
    }, [
      eyebrow ? el('div', { class: 'mb-3 flex items-center gap-3 ' + (center ? 'justify-center' : '') }, [
        el('span', { class: 'h-px w-6 bg-primary' }),
        el('span', { class: 'text-xs font-medium tracking-[0.18em] text-primary', text: eyebrow })
      ]) : null,
      el('h2', { class: 'text-2xl md:text-[32px] font-semibold tracking-tight text-ink', text: title || '' }),
      desc ? el('p', {
        class: 'mt-4 max-w-2xl text-[15px] text-inkMid pre-wrap ' + (center ? 'mx-auto' : ''),
        text: desc
      }) : null
    ]);
  }

  /* ------------------------------------------------------------------ *
   * 12. banner —— 页面横幅（首页 Hero 之外的各页统一）
   *     opts.dark：炭黑底白字（业务页）；否则极淡主色渐变浅色（案例/报价/联系）。
   *     装饰为纯 CSS 几何（圆环/圆点），无动画、无图片依赖。
   * ------------------------------------------------------------------ */
  function banner(title, subtitle, opts) {
    var options = opts || {};
    var dark = !!options.dark;
    var deco = dark
      ? [
        el('span', { class: 'pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10' }),
        el('span', { class: 'pointer-events-none absolute -right-12 bottom-[-56px] h-44 w-44 rounded-full bg-primary/20' }),
        el('span', { class: 'pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full border border-white/10' })
      ]
      : [
        el('span', { class: 'pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-primary/15' }),
        el('span', { class: 'pointer-events-none absolute right-20 bottom-[-44px] h-32 w-32 rounded-full bg-primary/10' })
      ];
    return el('div', {
      class: dark
        ? 'relative overflow-hidden bg-ink'
        : 'relative overflow-hidden border-b border-line bg-gradient-to-b from-[#F7F9FC] to-white'
    }, deco.concat([
      el('div', { class: 'sd-container relative py-14 md:py-20' }, [
        el('h1', {
          class: 'max-w-[760px] text-3xl md:text-[44px] font-semibold leading-tight ' +
            (dark ? 'text-white' : 'tracking-tight text-ink'),
          text: title || options.fallbackTitle || ''
        }),
        subtitle ? el('p', {
          class: 'mt-5 max-w-[680px] text-base md:text-lg pre-wrap ' + (dark ? 'text-white/70' : 'text-inkMid'),
          text: subtitle
        }) : null
      ])
    ]));
  }

  /* ------------------------------------------------------------------ *
   * 13. timeline —— 合作流程时间线
   *     md 以上横向 6 步（圆形序号节点 + 细连线），以下纵向（左竖线）。
   *     节点 48px 主色实心白字 + 淡光晕。
   * ------------------------------------------------------------------ */
  function timeline(items) {
    var list = items || [];
    var wrap = el('ol', { class: 'grid md:grid-cols-6 md:gap-6' });
    list.forEach(function (item, index) {
      var last = index === list.length - 1;
      var li = el('li', { class: 'relative pb-8 last:pb-0 md:flex md:flex-col md:items-center md:pb-0' });
      if (!last) {
        // 移动端：左侧竖线
        li.appendChild(el('span', { class: 'absolute left-6 top-12 bottom-0 w-0.5 bg-line md:hidden' }));
        // 桌面端：节点间细横线（从本节点圆心连到下一节点左缘）
        li.appendChild(el('span', {
          class: 'absolute top-6 left-[calc(50%+28px)] right-[calc(-50%+4px)] hidden h-0.5 bg-line md:block'
        }));
      }
      li.appendChild(el('span', {
        class: 'absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-[15px] font-medium text-white ring-4 ring-primary/10 md:relative md:mx-auto',
        text: String(item.seq || (index + 1))
      }));
      li.appendChild(el('div', { class: 'pl-16 md:mt-4 md:pl-0 md:text-center' }, [
        el('h3', { class: 'text-[15px] font-semibold text-ink', text: item.title || '' }),
        el('p', { class: 'mt-1.5 text-[13px] leading-relaxed text-inkMid pre-wrap', text: item.desc || '' })
      ]));
      wrap.appendChild(li);
    });
    return wrap;
  }

  /* ------------------------------------------------------------------ *
   * 14. isNegotiable —— 报价是否为“面议”（空值或包含“面议”）
   * ------------------------------------------------------------------ */
  function isNegotiable(priceText) {
    var price = priceText || '';
    return !price || price.indexOf('面议') !== -1;
  }

  /* ------------------------------------------------------------------ *
   * 15. quoteCard —— 报价卡（报价页与业务页共用）
   *     三级视觉：① 面议 → 虚线边框浅灰底、价格 inkWeak；
   *               ② 推荐 → 主色 2px 描边 + 右上角主色 badge；
   *               ③ 常规 → 白底细边框。
   * ------------------------------------------------------------------ */
  function quoteCard(item, opts) {
    var options = opts || {};
    var negotiable = isNegotiable(item.priceText);
    var recommended = !!options.recommended && !negotiable;
    var shellCls = recommended
      ? 'sd-card sd-card-hover relative border-2 border-primary p-6 flex flex-col h-full'
      : (negotiable
        ? 'rounded-card border border-dashed border-line bg-surfaceSoft p-6 flex flex-col h-full transition-all duration-200'
        : 'sd-card sd-card-hover p-6 flex flex-col h-full');
    var priceCls = negotiable ? 'text-inkWeak' : 'text-primary';
    var card = el('div', { class: shellCls }, [
      el('p', { class: 'text-[15px] font-medium text-ink', text: item.itemName || '' }),
      el('div', { class: 'mt-3 flex items-baseline gap-1.5' }, [
        el('span', { class: 'text-2xl font-semibold ' + priceCls, text: item.priceText || '面议' }),
        item.priceUnit ? el('span', { class: 'text-xs text-inkWeak', text: item.priceUnit }) : null
      ]),
      item.description
        ? el('p', { class: 'mt-4 flex-1 text-sm text-inkMid pre-wrap', text: item.description })
        : el('div', { class: 'flex-1' }),
      el('a', { href: '/contact.html', class: 'group/qc mt-5 inline-flex items-center gap-1 text-sm text-primary' }, [
        el('span', { text: '咨询报价' }),
        el('span', { class: 'transition-transform duration-200 group-hover/qc:translate-x-1', html: ICONS.arrowRight })
      ])
    ]);
    if (recommended) {
      card.appendChild(el('span', {
        class: 'absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-white',
        text: '推荐'
      }));
    }
    return card;
  }

  /* ------------------------------------------------------------------ *
   * 16. caseCard —— 案例卡（首页精选 / 案例页网格 / 业务页预览共用）
   *     opts.mode 'button' → 按钮（弹窗）；opts.href → 链接；否则纯展示。
   *     opts.categoryName 左上分类 pill；opts.actionText 底部文字链。
   * ------------------------------------------------------------------ */
  function caseCard(item, opts) {
    var options = opts || {};
    var tag = options.categoryName || '';
    var clampCls = options.summaryClamp === 3 ? 'line-clamp-3' : 'line-clamp-2';
    var media = el('div', { class: 'relative overflow-hidden' }, [
      img(item.coverImage, item.title, 800, 600,
        'aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]'),
      tag ? el('span', {
        class: 'absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm',
        text: tag
      }) : null
    ]);
    var body = el('div', { class: 'flex flex-1 flex-col p-5' }, [
      el('h3', { class: 'text-[16px] font-semibold text-ink', text: item.title || '' }),
      el('p', { class: 'mt-2 flex-1 text-sm text-inkMid pre-wrap ' + clampCls, text: item.summary || '' }),
      options.actionText ? el('span', { class: 'mt-4 inline-flex items-center gap-1 text-sm text-primary' }, [
        el('span', { text: options.actionText }),
        el('span', { class: 'transition-transform duration-200 group-hover:translate-x-1', html: ICONS.arrowRight })
      ]) : null
    ]);
    var shellCls = 'sd-card sd-card-hover group flex w-full flex-col overflow-hidden text-left';
    if (options.mode === 'button') {
      var btn = el('button', {
        type: 'button',
        class: shellCls,
        'aria-label': item.title || '案例详情'
      }, [media, body]);
      if (typeof options.onActivate === 'function') {
        btn.addEventListener('click', function () { options.onActivate(item); });
      }
      return btn;
    }
    if (options.href) {
      return el('a', { href: options.href, class: shellCls }, [media, body]);
    }
    return el('div', { class: shellCls }, [media, body]);
  }

  /* ------------------------------------------------------------------ *
   * 17. shopCard —— 店铺入口卡（首页 / 业务页 / 联系页共用）
   *     有有效链接 → 外链卡片（新窗口）；仅二维码 → 纯展示卡。
   * ------------------------------------------------------------------ */
  function shopCard(shop, opts) {
    var options = opts || {};
    var url = shop.linkUrl || '';
    var clickable = !!url && url !== '#';
    var inner = el('div', { class: 'sd-card sd-card-hover flex items-center gap-4 p-5' }, [
      el('div', {
        class: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-icon bg-primarySoft text-primary',
        html: icon(shop.icon)
      }),
      el('div', { class: 'min-w-0 flex-1' }, [
        el('p', { class: 'truncate text-[15px] font-medium text-ink', text: shop.title || '' }),
        (options.showPlatform && shop.platform)
          ? el('p', { class: 'mt-0.5 text-xs text-inkWeak', text: shop.platform })
          : null
      ]),
      clickable
        ? el('span', {
          class: 'shrink-0 text-inkWeak transition-colors duration-200 group-hover:text-primary',
          html: ICONS.externalLink
        })
        : null
    ]);
    if (clickable) {
      return el('a', {
        href: url, target: '_blank', rel: 'noopener noreferrer', class: 'group block'
      }, [inner]);
    }
    return inner;
  }

  /* ------------------------------------------------------------------ *
   * 18. ICONS —— 内联 SVG 图标表（lucide outline 风格，静态常量）
   * ------------------------------------------------------------------ */
  var ICONS = {
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    checkCircle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5"/></svg>',
    arrowRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    arrowLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    chevronDown: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>',
    image: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.35-4.35a2 2 0 0 0-2.83 0L3 21"/></svg>',
    chart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 14v3"/><path d="M12 9v8"/><path d="M17 5v12"/></svg>',
    wechat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3C5.13 3 2 5.58 2 8.86c0 1.84.99 3.48 2.54 4.56L3.8 16.2l2.6-1.35c.83.24 1.72.37 2.6.37h.5"/><path d="M22 14.2c0-2.9-3.13-5.2-7-5.2s-7 2.3-7 5.2c0 2.9 3.13 5.2 7 5.2.8 0 1.6-.1 2.35-.3l2.25 1.15-.6-2.2c1.2-.9 2-2.2 2-3.85Z"/></svg>',
    xianyu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
    taobao: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16"/><path d="M5 8l1.5 11h11L19 8"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    pdd: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h6"/><path d="M10 10v6"/></svg>',
    shop: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-1 11H4L3 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    mapPin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    externalLink: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
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
    sectionHead: sectionHead,
    banner: banner,
    timeline: timeline,
    isNegotiable: isNegotiable,
    quoteCard: quoteCard,
    caseCard: caseCard,
    shopCard: shopCard,
    ICONS: ICONS,
    icon: icon,
    PLACEHOLDER: PLACEHOLDER
  };
})(window, document);
