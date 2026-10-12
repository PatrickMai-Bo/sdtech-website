/**
 * home.js — 首页各区块渲染
 *
 * 数据来源（全部来自接口，HTML 内零业务文案）：
 *   - 站点 KV：hero / cta（由 layout.js 统一加载并缓存）
 *   - GET /api/public/services              8 项业务卡
 *   - GET /api/public/cases/featured        精选案例 4 条
 *   - GET /api/public/cases/categories      分类名（案例卡 pill 文案）
 *   - GET /api/public/advantages            核心优势 4 条
 *   - GET /api/public/process-steps         合作流程 6 步
 *   - GET /api/public/shop-links?zone=home  多平台店铺入口 / Hero 信任条
 *   - GET /api/public/faqs                  FAQ 5 条
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

  /** 取容器并清空 */
  function host(id) {
    var node = document.getElementById(id);
    if (node) node.textContent = '';
    return node;
  }

  /** 两位序号：1 → '01' */
  function pad(index) {
    return ('0' + (index + 1)).slice(-2);
  }

  /* ================================================================== *
   * 1. Hero：左栏文案 + 右栏纯 CSS/SVG 装饰组合
   * ================================================================== */

  /** Hero 右栏装饰：错位叠放的主图卡 + 倾斜“设计稿”卡 + 浮动数据小卡（纯图形） */
  function heroDecoration(bg) {
    // 主图卡（图片位仍走 ui.img 占位）
    var mainCard = el('div', { class: 'relative rounded-card border border-line bg-white p-2 shadow-[0_12px_32px_rgba(31,35,40,0.08)]' }, [
      el('div', { class: 'overflow-hidden rounded-[10px]' }, [
        ui.img(bg, '', 800, 600, 'aspect-[4/3] w-full object-cover')
      ])
    ]);

    // 浮动数据小卡：图标 + 柱状条 + 占位线（无文字，避免写死文案）
    var floatCard = el('div', {
      class: 'absolute -bottom-6 left-4 hidden w-44 rounded-card border border-line bg-white p-4 shadow-[0_8px_24px_rgba(31,35,40,0.10)] sm:block md:-left-8'
    }, [
      el('div', { class: 'mb-3 flex h-8 w-8 items-center justify-center rounded-icon bg-primarySoft text-primary', html: ui.ICONS.chart }),
      el('div', { class: 'flex h-16 items-end gap-1.5' }, [
        el('span', { class: 'w-4 rounded-t-[3px] bg-primary/20', style: { height: '45%' } }),
        el('span', { class: 'w-4 rounded-t-[3px] bg-primary/40', style: { height: '70%' } }),
        el('span', { class: 'w-4 rounded-t-[3px] bg-primary', style: { height: '100%' } }),
        el('span', { class: 'w-4 rounded-t-[3px] bg-primary/30', style: { height: '58%' } })
      ]),
      el('span', { class: 'mt-3 block h-2 w-20 rounded-full bg-surface' })
    ]);
    mainCard.appendChild(floatCard);

    // 倾斜“设计稿”卡：窗口圆点 + 线条 + 双色块（纯图形）
    var draftCard = el('div', {
      class: 'absolute -right-3 top-8 hidden w-[44%] rotate-[6deg] rounded-card border border-line bg-white p-4 shadow-[0_8px_24px_rgba(31,35,40,0.06)] md:block'
    }, [
      el('div', { class: 'mb-3 flex gap-1.5' }, [
        el('span', { class: 'h-2 w-2 rounded-full bg-line' }),
        el('span', { class: 'h-2 w-2 rounded-full bg-line' }),
        el('span', { class: 'h-2 w-2 rounded-full bg-primary/50' })
      ]),
      el('span', { class: 'block h-2.5 w-3/4 rounded-full bg-surface' }),
      el('span', { class: 'mt-2 block h-2.5 w-1/2 rounded-full bg-surface' }),
      el('div', { class: 'mt-3 flex gap-2' }, [
        el('span', { class: 'h-10 flex-1 rounded-ctl bg-primarySoft' }),
        el('span', { class: 'h-10 flex-1 rounded-ctl bg-surface' })
      ])
    ]);

    return el('div', { class: 'relative mx-auto w-full max-w-[560px]' }, [draftCard, mainCard]);
  }

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

    // 平台信任条（与店铺区同源，取自 shop-links zone=home）
    var trustBar = el('div', { class: 'mt-10 flex flex-wrap items-center gap-2' });
    api.get('/public/shop-links', { params: { zone: 'home' } })
      .then(function (list) {
        var items = (list || []).filter(function (shop) { return shop && (shop.title || shop.icon); });
        items.slice(0, 4).forEach(function (shop) {
          trustBar.appendChild(el('span', { class: 'sd-trust-tag' }, [
            el('span', { class: 'text-inkWeak', html: ui.icon(shop.icon) }),
            el('span', { text: shop.title || '' })
          ]));
        });
      })
      .catch(function () { /* 信任条为增强元素，失败时静默隐藏 */ });

    var left = el('div', { class: 'max-w-[640px]' }, [
      subtitle ? el('p', { class: 'sd-eyebrow-pill mb-5', text: subtitle }) : null,
      el('h1', { class: 'text-4xl md:text-5xl font-semibold leading-tight text-ink', text: title }),
      description ? el('p', { class: 'mt-5 max-w-xl text-lg text-inkMid pre-wrap', text: description }) : null,
      el('div', { class: 'mt-8 flex flex-wrap gap-3' }, [
        p1 ? el('a', { href: p1Link, class: 'sd-btn-primary group' }, [
          p1,
          el('span', { class: 'transition-transform duration-200 group-hover:translate-x-1', html: ui.ICONS.arrowRight })
        ]) : null,
        p2 ? el('a', { href: p2Link, class: 'sd-btn-outline' }, [p2]) : null
      ]),
      trustBar
    ]);

    var grid = el('div', {
      class: 'relative sd-container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28'
    }, [left, heroDecoration(bg)]);

    box.appendChild(el('div', { class: 'relative overflow-hidden bg-gradient-to-b from-[#F7F9FC] to-white' }, [grid]));
  }

  /* ================================================================== *
   * 2. 八大业务卡片（编号 01-08，第一张深色 feature 卡）
   * ================================================================== */
  function serviceCard(item, index, featured) {
    var iconCls = featured ? 'bg-white/10 text-white' : 'bg-primarySoft text-primary';
    var numCls = featured ? 'text-white/40' : 'text-inkWeak';
    var titleCls = featured ? 'text-white' : 'text-ink';
    var descCls = featured ? 'text-white/70' : 'text-inkMid';
    var linkCls = featured ? 'text-white/80' : 'text-primary';
    var shellCls = featured ? 'sd-feature-dark sd-card-hover' : 'sd-card sd-card-hover';
    return el('a', {
      href: item.targetUrl || '#',
      class: shellCls + ' group flex h-full flex-col p-6'
    }, [
      el('div', { class: 'flex items-start justify-between' }, [
        el('div', { class: 'flex h-12 w-12 items-center justify-center rounded-icon ' + iconCls, html: ui.icon(item.icon) }),
        el('span', { class: 'text-sm font-mono ' + numCls, text: pad(index) })
      ]),
      el('h3', { class: 'mt-5 text-[17px] font-semibold ' + titleCls, text: item.name || '' }),
      el('p', { class: 'mt-2 flex-1 text-sm leading-relaxed pre-wrap ' + descCls, text: item.summary || item.subtitle || '' }),
      el('span', { class: 'mt-5 inline-flex items-center gap-1 text-sm ' + linkCls }, [
        el('span', { text: '了解详情' }),
        el('span', { class: 'transition-transform duration-200 group-hover:translate-x-1', html: ui.ICONS.arrowRight })
      ])
    ]);
  }

  function renderServices() {
    var box = host('services-section');
    if (!box) return;
    var inner = el('div', { class: 'sd-container' }, [
      ui.sectionHead('SERVICES', '业务能力', ''),
      ui.skeleton(6, 'sm:grid-cols-2 lg:grid-cols-4')
    ]);
    box.appendChild(inner);

    api.get('/public/services')
      .then(function (list) {
        var all = list || [];
        var cards = all.filter(function (item) { return PAGE_SLUGS.indexOf(item.slug) === -1; });
        if (!cards.length) cards = all;
        var grid = el('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4' });
        cards.forEach(function (item, index) { grid.appendChild(serviceCard(item, index, index === 0)); });
        inner.removeChild(inner.lastChild);
        inner.appendChild(cards.length ? grid : ui.empty(null, '敬请期待'));
      })
      .catch(function (err) {
        console.warn('[sdtech] services 加载失败：', err && err.message);
        inner.removeChild(inner.lastChild);
        inner.appendChild(ui.fallback(null, '业务内容'));
      });
  }

  /* ================================================================== *
   * 3. 核心优势 4 卡（顶部 3px 主色短色条，节标题居中变体）
   * ================================================================== */
  function renderAdvantages() {
    var box = host('advantages-section');
    if (!box) return;
    var inner = el('div', { class: 'sd-container' }, [
      ui.sectionHead('ADVANTAGES', '核心优势', '', { center: true }),
      ui.skeleton(4, 'sm:grid-cols-2 lg:grid-cols-4')
    ]);
    box.appendChild(inner);

    api.get('/public/advantages')
      .then(function (list) {
        var items = list || [];
        var grid = el('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4' });
        items.forEach(function (item) {
          grid.appendChild(el('div', { class: 'sd-card sd-card-hover p-6' }, [
            el('span', { class: 'block h-[3px] w-8 rounded-full bg-primary' }),
            el('div', { class: 'mt-5 inline-flex h-10 w-10 items-center justify-center rounded-icon bg-primarySoft text-primary', html: ui.icon(item.icon) }),
            el('h3', { class: 'mt-4 text-base font-semibold text-ink', text: item.title || '' }),
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
   * 4. 精选案例 4 卡（4:3 封面 + 分类 pill + hover 放大）
   * ================================================================== */
  function renderFeaturedCases() {
    var box = host('featured-cases-section');
    if (!box) return;
    var head = el('div', { class: 'sd-container mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14' }, [
      ui.sectionHead('CASE STUDIES', '精选案例', '', { bare: true }),
      el('a', { href: '/cases.html', class: 'sd-btn-outline group shrink-0' }, [
        '查看全部案例',
        el('span', { class: 'transition-transform duration-200 group-hover:translate-x-1', html: ui.ICONS.arrowRight })
      ])
    ]);
    var body = el('div', { class: 'sd-container' }, [ui.skeleton(4, 'sm:grid-cols-2 lg:grid-cols-4')]);
    box.appendChild(head);
    box.appendChild(body);

    api.get('/public/cases/featured', { params: { limit: 4 } })
      .then(function (list) {
        var items = list || [];
        // 分类名映射（pill 文案）；取不到则不显示 pill
        var renderCards = function (cats) {
          var nameMap = {};
          (cats || []).forEach(function (cat) {
            if (cat && cat.code) nameMap[cat.code] = cat.name || cat.code;
          });
          var grid = el('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4' });
          items.forEach(function (item) {
            grid.appendChild(ui.caseCard(item, {
              href: '/cases.html?category=' + encodeURIComponent(item.category || '') + '&case=' + encodeURIComponent(item.id),
              categoryName: nameMap[item.category] || '',
              summaryClamp: 2,
              actionText: '查看详情'
            }));
          });
          body.textContent = '';
          body.appendChild(items.length ? grid : ui.empty(null, '敬请期待'));
        };
        api.get('/public/cases/categories')
          .then(function (cats) { renderCards(cats); })
          .catch(function () { renderCards([]); });
      })
      .catch(function (err) {
        console.warn('[sdtech] featured cases 加载失败：', err && err.message);
        body.textContent = '';
        body.appendChild(ui.fallback(null, '精选案例'));
      });
  }

  /* ================================================================== *
   * 5. 合作流程时间线（md 以上横向 / 以下纵向）
   * ================================================================== */
  function renderProcess() {
    var box = host('process-section');
    if (!box) return;
    var inner = el('div', { class: 'sd-container' }, [
      ui.sectionHead('PROCESS', '合作流程', ''),
      ui.skeleton(6, 'sm:grid-cols-2 lg:grid-cols-6')
    ]);
    box.appendChild(inner);

    api.get('/public/process-steps')
      .then(function (list) {
        var items = list || [];
        inner.removeChild(inner.lastChild);
        inner.appendChild(items.length ? ui.timeline(items) : ui.empty(null, '敬请期待'));
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
      ui.sectionHead('CHANNELS', '多平台店铺', '')
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
        items.forEach(function (shop) { grid.appendChild(ui.shopCard(shop, { showPlatform: true })); });
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
      ui.sectionHead('FAQ', '常见问题', ''),
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
          container.appendChild(el('div', { class: 'sd-acc-item' }, [
            el('button', {
              type: 'button',
              class: 'w-full flex items-center justify-between gap-4 py-5 text-left transition-colors duration-200',
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
          ]));
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
