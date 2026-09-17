/**
 * home.js — 首页各区块渲染
 *
 * 数据来源（全部来自接口，HTML 内零业务文案）：
 *   - 站点 KV：hero / cta（由 layout.js 统一加载并缓存）
 *   - GET /api/public/services              8 项业务卡
 *   - GET /api/public/cases/featured        精选案例 4 条
 *   - GET /api/public/advantages            核心优势 4 条
 *   - GET /api/public/process-steps         合作流程 6 步
 *   - GET /api/public/faqs                  FAQ 5 条
 *   - GET /api/public/shop-links?zone=home  多平台店铺入口
 *
 * 任一请求失败 → 局部兜底文案 + console.warn，不抛未捕获异常、不白屏。
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

  /** 页面级业务标识（承载 Banner，不作为业务卡展示） */
  var PAGE_SLUGS = ['web', 'design', 'video', 'office'];

  /** 分区标题组件 */
  function sectionHead(eyebrow, title, desc) {
    return el('div', { class: 'max-w-[720px] mb-10 md:mb-14' }, [
      eyebrow ? el('p', { class: 'sd-eyebrow mb-3', text: eyebrow }) : null,
      el('h2', { class: 'text-[26px] md:text-[32px] font-semibold tracking-tight', text: title }),
      desc ? el('p', { class: 'mt-4 text-[15px] text-inkMid pre-wrap', text: desc }) : null
    ]);
  }

  /** 取容器并清空 */
  function host(id) {
    var node = document.getElementById(id);
    if (node) node.textContent = '';
    return node;
  }

  /* ================================================================== *
   * 1. Hero
   * ================================================================== */
  function renderHero() {
    var box = host('hero-section');
    if (!box) return;
    var title = window.Layout.txt('hero', 'title', '');
    var subtitle = window.Layout.txt('hero', 'subtitle', '');
    var description = window.Layout.txt('hero', 'description', '');
    var p1 = window.Layout.txt('hero', 'primary_button_text', '');
    var p1Link = window.Layout.txt('hero', 'primary_button_link', '/cases.html');
    var p2 = window.Layout.txt('hero', 'secondary_button_text', '');
    var p2Link = window.Layout.txt('hero', 'secondary_button_link', '/contact.html');
    var bg = window.Layout.image('hero', 'background_image', '');

    if (!title && !subtitle && !description) {
      box.appendChild(ui.fallback(null, '首页内容'));
      return;
    }

    var left = el('div', { class: 'max-w-[640px]' }, [
      subtitle ? el('p', { class: 'sd-eyebrow mb-4', text: subtitle }) : null,
      el('h1', { class: 'text-[30px] md:text-[42px] font-semibold leading-[1.25] tracking-tight text-ink', text: title }),
      description ? el('p', { class: 'mt-5 text-[15px] md:text-base text-inkMid pre-wrap', text: description }) : null,
      el('div', { class: 'mt-8 flex flex-wrap gap-3' }, [
        p1 ? el('a', { href: p1Link, class: 'sd-btn-primary' }, [p1, el('span', { html: ui.ICONS.arrowRight })]) : null,
        p2 ? el('a', { href: p2Link, class: 'sd-btn-outline' }, [p2]) : null
      ])
    ]);

    var inner = el('div', {
      class: 'relative overflow-hidden bg-primarySoft'
    }, [
      bg ? ui.img(bg, '', 1600, 900, 'absolute inset-0 h-full w-full object-cover opacity-20') : null,
      el('div', { class: 'relative sd-container py-16 md:py-24 lg:py-28' }, [left])
    ]);
    box.appendChild(inner);
  }

  /* ================================================================== *
   * 2. 八大业务卡片
   * ================================================================== */
  function serviceCard(item) {
    var card = el('a', {
      href: item.targetUrl || '#',
      class: 'sd-card sd-card-hover p-6 flex flex-col h-full'
    }, [
      el('div', { class: 'mb-5 inline-flex h-11 w-11 items-center justify-center rounded-icon bg-primarySoft text-primary', html: ui.icon(item.icon) }),
      el('h3', { class: 'text-[17px] font-semibold text-ink', text: item.name || '' }),
      el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap flex-1', text: item.summary || item.subtitle || '' }),
      el('div', { class: 'mt-5 inline-flex items-center gap-1 text-sm text-primary' }, [
        el('span', { text: '了解详情' }),
        el('span', { class: 'transition-transform duration-200', html: ui.ICONS.arrowRight })
      ])
    ]);
    return card;
  }

  function renderServices() {
    var box = host('services-section');
    if (!box) return;
    var inner = el('div', { class: 'sd-container' }, [
      sectionHead('SERVICES', '业务能力', ''),
      ui.skeleton(6, 'sm:grid-cols-2 lg:grid-cols-4')
    ]);
    box.appendChild(inner);

    api.get('/public/services')
      .then(function (list) {
        var all = list || [];
        var cards = all.filter(function (item) { return PAGE_SLUGS.indexOf(item.slug) === -1; });
        if (!cards.length) cards = all;
        var grid = el('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4' });
        cards.forEach(function (item) { grid.appendChild(serviceCard(item)); });
        if (!cards.length) grid = ui.empty(null, '敬请期待');
        inner.removeChild(inner.lastChild);
        inner.appendChild(grid);
      })
      .catch(function (err) {
        console.warn('[sdtech] services 加载失败：', err && err.message);
        inner.removeChild(inner.lastChild);
        inner.appendChild(ui.fallback(null, '业务内容'));
      });
  }

  /* ================================================================== *
   * 3. 核心优势 4 卡
   * ================================================================== */
  function renderAdvantages() {
    var box = host('advantages-section');
    if (!box) return;
    var inner = el('div', { class: 'sd-container' }, [
      sectionHead('ADVANTAGES', '核心优势', ''),
      ui.skeleton(4, 'sm:grid-cols-2 lg:grid-cols-4')
    ]);
    box.appendChild(inner);

    api.get('/public/advantages')
      .then(function (list) {
        var items = list || [];
        var grid = el('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4' });
        items.forEach(function (item) {
          grid.appendChild(el('div', { class: 'sd-card p-6' }, [
            el('div', { class: 'mb-4 inline-flex h-10 w-10 items-center justify-center rounded-icon bg-primarySoft text-primary', html: ui.icon(item.icon) }),
            el('h3', { class: 'text-base font-semibold text-ink', text: item.title || '' }),
            el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap', text: item.desc || '' })
          ]));
        });
        inner.removeChild(inner.lastChild);
        inner.appendChild(items.length ? grid : ui.empty(null, '敬请期待'));
      })
      .catch(function (err) {
        console.warn('[sdtech] advantages 加载失败：', err && err.message);
        inner.removeChild(inner.lastChild);
        inner.appendChild(ui.fallback(null, '核心优势'));
      });
  }

  /* ================================================================== *
   * 4. 精选案例 4 卡 + 查看全部
   * ================================================================== */
  function caseCard(item) {
    return el('a', {
      href: '/cases.html?category=' + encodeURIComponent(item.category || '') + '&case=' + encodeURIComponent(item.id),
      class: 'sd-card sd-card-hover overflow-hidden flex flex-col'
    }, [
      ui.img(item.coverImage, item.title, 800, 600, 'h-[200px] w-full object-cover'),
      el('div', { class: 'p-5 flex-1 flex flex-col' }, [
        el('h3', { class: 'text-[16px] font-semibold text-ink', text: item.title || '' }),
        el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap line-clamp-3 flex-1', text: item.summary || '' })
      ])
    ]);
  }

  function renderFeaturedCases() {
    var box = host('featured-cases-section');
    if (!box) return;
    var head = el('div', { class: 'sd-container flex flex-wrap items-end justify-between gap-4 mb-10' }, [
      sectionHead('CASE STUDIES', '精选案例', ''),
      el('a', { href: '/cases.html', class: 'sd-btn-outline' }, ['查看全部案例', el('span', { html: ui.ICONS.arrowRight })])
    ]);
    var body = el('div', { class: 'sd-container' }, [ui.skeleton(4, 'sm:grid-cols-2 lg:grid-cols-4')]);
    box.appendChild(head);
    box.appendChild(body);

    api.get('/public/cases/featured', { params: { limit: 4 } })
      .then(function (list) {
        var items = list || [];
        var grid = el('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4' });
        items.forEach(function (item) { grid.appendChild(caseCard(item)); });
        body.textContent = '';
        body.appendChild(items.length ? grid : ui.empty(null, '敬请期待'));
      })
      .catch(function (err) {
        console.warn('[sdtech] featured cases 加载失败：', err && err.message);
        body.textContent = '';
        body.appendChild(ui.fallback(null, '精选案例'));
      });
  }

  /* ================================================================== *
   * 5. 合作流程 6 步（≥1024 横向 / <768 纵向）
   * ================================================================== */
  function renderProcess() {
    var box = host('process-section');
    if (!box) return;
    var inner = el('div', { class: 'sd-container' }, [
      sectionHead('PROCESS', '合作流程', ''),
      ui.skeleton(6, 'sm:grid-cols-2 lg:grid-cols-6')
    ]);
    box.appendChild(inner);

    api.get('/public/process-steps')
      .then(function (list) {
        var items = list || [];
        var wrap = el('ol', { class: 'grid gap-6 md:grid-cols-2 lg:grid-cols-6' });
        items.forEach(function (item, index) {
          wrap.appendChild(el('li', { class: 'relative' }, [
            el('div', { class: 'flex items-center gap-3 lg:flex-col lg:items-start lg:gap-0' }, [
              el('span', {
                class: 'shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-medium lg:mb-4',
                text: String(item.seq || (index + 1))
              }),
              el('span', { class: 'hidden lg:block absolute left-[18px] top-[18px] h-[2px] w-full bg-line -z-10' })
            ]),
            el('h3', { class: 'mt-3 text-[15px] font-semibold text-ink', text: item.title || '' }),
            el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap', text: item.desc || '' })
          ]));
        });
        inner.removeChild(inner.lastChild);
        inner.appendChild(items.length ? wrap : ui.empty(null, '敬请期待'));
      })
      .catch(function (err) {
        console.warn('[sdtech] process-steps 加载失败：', err && err.message);
        inner.removeChild(inner.lastChild);
        inner.appendChild(ui.fallback(null, '合作流程'));
      });
  }

  /* ================================================================== *
   * 6. 多平台店铺入口
   * ================================================================== */
  function renderShops() {
    var box = host('shops-section');
    if (!box) return;
    var inner = el('div', { class: 'sd-container' }, [
      sectionHead('CHANNELS', '多平台店铺', '')
    ]);
    var grid = el('div', { class: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4' });
    inner.appendChild(grid);
    box.appendChild(inner);

    api.get('/public/shop-links', { params: { zone: 'home' } })
      .then(function (list) {
        var items = (list || []).filter(function (shop) {
          var url = shop.linkUrl || '';
          return (url && url !== '#') || shop.qrcodeImage;
        });
        items.forEach(function (shop) {
          var url = shop.linkUrl || '';
          var body = el('div', { class: 'sd-card p-5 flex items-center gap-4' }, [
            el('div', { class: 'h-11 w-11 shrink-0 rounded-icon bg-surface flex items-center justify-center text-inkMid', html: ui.icon(shop.icon) }),
            el('div', { class: 'min-w-0' }, [
              el('p', { class: 'text-[15px] font-medium text-ink truncate', text: shop.title || '' }),
              el('p', { class: 'mt-1 text-xs text-inkWeak', text: shop.platform || '' })
            ])
          ]);
          if (url && url !== '#') {
            grid.appendChild(el('a', { href: url, target: '_blank', rel: 'noopener noreferrer', class: 'block' }, [body]));
          } else {
            grid.appendChild(body);
          }
        });
        if (!items.length) grid.appendChild(ui.empty(null, '店铺入口待补充'));
      })
      .catch(function (err) {
        console.warn('[sdtech] shop-links 加载失败：', err && err.message);
        grid.textContent = '';
        grid.appendChild(ui.fallback(null, '店铺入口'));
      });
  }

  /* ================================================================== *
   * 7. FAQ 手风琴
   * ================================================================== */
  function renderFaq() {
    var box = host('faq-section');
    if (!box) return;
    var container = el('div', { class: 'divide-y divide-line border-y border-line' });
    var inner = el('div', { class: 'sd-container' }, [
      sectionHead('FAQ', '常见问题', ''),
      container
    ]);
    box.appendChild(inner);

    api.get('/public/faqs')
      .then(function (list) {
        var items = list || [];
        if (!items.length) {
          container.appendChild(ui.empty(null, '敬请期待'));
          return;
        }
        items.forEach(function (item, index) {
          var bodyId = 'faq-body-' + index;
          var item_ = el('div', { class: 'sd-acc-item' }, [
            el('button', {
              type: 'button',
              class: 'w-full flex items-center justify-between gap-4 py-5 text-left',
              'data-acc-trigger': '1',
              'aria-expanded': 'false',
              'aria-controls': bodyId
            }, [
              el('span', { class: 'text-[15px] font-medium text-ink', text: item.question || '' }),
              el('span', { class: 'sd-acc-icon shrink-0 text-inkWeak', html: ui.ICONS.chevronDown })
            ]),
            el('div', { class: 'sd-acc-body', id: bodyId }, [
              el('p', { class: 'pb-5 text-sm text-inkMid pre-wrap', text: item.answer || '' })
            ])
          ]);
          container.appendChild(item_);
        });
        ui.accordion(container);
      })
      .catch(function (err) {
        console.warn('[sdtech] faqs 加载失败：', err && err.message);
        container.appendChild(ui.fallback(null, '常见问题'));
      });
  }

  /* ================================================================== *
   * 入口
   * ================================================================== */
  function boot() {
    window.Layout.mount({ active: 'index' });
    window.Layout.ready().then(function (ok) {
      // 用接口信息补全文档标题
      var company = window.Layout.txt('global', 'company_name', '');
      var slogan = window.Layout.txt('global', 'slogan', '');
      if (company) document.title = company + (slogan ? ' · ' + slogan : '');
      renderHero();
      if (!ok) {
        ['services-section', 'advantages-section', 'featured-cases-section', 'process-section', 'shops-section', 'faq-section']
          .forEach(function (id) {
            var node = document.getElementById(id);
            if (node) { node.textContent = ''; node.appendChild(ui.fallback(null, '页面内容')); }
          });
        return;
      }
      renderServices();
      renderAdvantages();
      renderFeaturedCases();
      renderProcess();
      renderShops();
      renderFaq();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
