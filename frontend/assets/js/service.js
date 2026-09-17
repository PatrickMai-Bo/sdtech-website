/**
 * service.js — 四个业务页（web / design / video / office）通用渲染
 *
 * slug 由 location.pathname 推导：/web.html → 'web'
 *
 * 数据来源：
 *   - 站点 KV：banner.<slug>.title / .subtitle
 *   - GET /api/public/services/{slug}                 业务详情（含 items + deliverables）
 *   - GET /api/public/cases?category=<slug>&size=4    该类案例预览
 *   - GET /api/public/quotes/{slug}                   该类参考报价
 *   - GET /api/public/shop-links?zone=cta             咨询渠道入口
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

  /** 从路径推导业务 slug：/web.html → web */
  function currentSlug() {
    var path = window.location.pathname || '/web.html';
    var file = path.substring(path.lastIndexOf('/') + 1) || 'web.html';
    var name = file.indexOf('.') > -1 ? file.substring(0, file.lastIndexOf('.')) : file;
    return name || 'web';
  }

  var SLUG = currentSlug();

  function host(id) {
    var node = document.getElementById(id);
    if (node) node.textContent = '';
    return node;
  }

  function sectionHead(title, desc) {
    return el('div', { class: 'max-w-[720px] mb-10' }, [
      el('h2', { class: 'text-[24px] md:text-[30px] font-semibold tracking-tight', text: title }),
      desc ? el('p', { class: 'mt-3 text-[15px] text-inkMid pre-wrap', text: desc }) : null
    ]);
  }

  /* ---------------- 1. Banner ---------------- */
  function renderBanner() {
    var box = host('banner-section');
    if (!box) return;
    var title = window.Layout.txt('banner', SLUG + '.title', '');
    var subtitle = window.Layout.txt('banner', SLUG + '.subtitle', '');
    if (title) document.title = title;
    box.appendChild(el('div', { class: 'bg-primarySoft border-b border-line' }, [
      el('div', { class: 'sd-container py-12 md:py-16' }, [
        el('h1', { class: 'text-[28px] md:text-[36px] font-semibold tracking-tight text-ink', text: title || '业务详情' }),
        subtitle ? el('p', { class: 'mt-4 text-[15px] text-inkMid pre-wrap max-w-[680px]', text: subtitle }) : null
      ])
    ]));
  }

  /* ---------------- 2. 服务介绍段 ---------------- */
  function renderIntro(detail, ok) {
    var box = host('intro-section');
    if (!box) return;
    if (!ok) { box.appendChild(ui.fallback(null, '服务介绍')); return; }
    var summary = (detail && detail.summary) || '';
    box.appendChild(el('div', { class: 'sd-container py-14 md:py-16' }, [
      el('p', { class: 'text-[15px] md:text-base text-inkMid pre-wrap max-w-[860px]', text: summary })
    ]));
  }

  /* ---------------- 3. 细分服务卡片 ---------------- */
  function renderItems(items, ok) {
    var box = host('items-section');
    if (!box) return;
    if (!ok) { box.appendChild(ui.fallback(null, '细分服务')); return; }
    var grid = el('div', { class: 'grid gap-6 md:grid-cols-2' });
    (items || []).forEach(function (item) {
      grid.appendChild(el('div', { class: 'sd-card sd-card-hover p-6' }, [
        el('div', { class: 'mb-4 inline-flex h-10 w-10 items-center justify-center rounded-icon bg-primarySoft text-primary', html: ui.icon(item.icon) }),
        el('h3', { class: 'text-[16px] font-semibold text-ink', text: item.title || '' }),
        el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap', text: item.description || '' })
      ]));
    });
    box.appendChild(el('div', { class: 'sd-container py-4 md:py-6' }, [
      sectionHead('细分服务'),
      (items && items.length) ? grid : ui.empty(null, '敬请期待')
    ]));
  }

  /* ---------------- 4. 交付物说明 ---------------- */
  function renderDeliverables(list, ok) {
    var box = host('deliverables-section');
    if (!box) return;
    if (!ok) { box.appendChild(ui.fallback(null, '交付物说明')); return; }
    var wrap = el('ul', { class: 'grid gap-3 sm:grid-cols-2' });
    (list || []).forEach(function (item) {
      wrap.appendChild(el('li', { class: 'flex items-start gap-3 text-[15px] text-inkDeep' }, [
        el('span', { class: 'mt-[2px] text-success', html: ui.ICONS.check }),
        el('span', { class: 'pre-wrap', text: item.content || '' })
      ]));
    });
    box.appendChild(el('div', { class: 'sd-container py-14 md:py-16' }, [
      sectionHead('交付物'),
      (list && list.length) ? wrap : ui.empty(null, '敬请期待')
    ]));
  }

  /* ---------------- 5. 该类案例预览 ---------------- */
  function renderCases() {
    var box = host('cases-section');
    if (!box) return;
    var body = el('div', { class: 'sd-container' }, [ui.skeleton(4, 'sm:grid-cols-2 lg:grid-cols-4')]);
    box.appendChild(el('div', { class: 'sd-container pb-8' }, [
      el('div', { class: 'flex flex-wrap items-end justify-between gap-4' }, [
        sectionHead('相关案例'),
        el('a', { href: '/cases.html?category=' + encodeURIComponent(SLUG), class: 'sd-btn-outline shrink-0' }, ['查看全部'])
      ])
    ]));
    box.appendChild(body);

    api.get('/public/cases', { params: { category: SLUG, page: 1, size: 4 } })
      .then(function (page) {
        var records = (page && page.records) || [];
        var grid = el('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4' });
        records.forEach(function (item) {
          grid.appendChild(el('div', { class: 'sd-card overflow-hidden' }, [
            ui.img(item.coverImage, item.title, 800, 600, 'h-[170px] w-full object-cover'),
            el('div', { class: 'p-5' }, [
              el('h3', { class: 'text-[15px] font-semibold text-ink', text: item.title || '' }),
              el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap line-clamp-3', text: item.summary || '' })
            ])
          ]));
        });
        body.textContent = '';
        body.appendChild(records.length ? grid : ui.empty(null, '敬请期待'));
      })
      .catch(function (err) {
        console.warn('[sdtech] cases 加载失败：', err && err.message);
        body.textContent = '';
        body.appendChild(ui.fallback(null, '相关案例'));
      });
  }

  /* ---------------- 6. 参考报价 ---------------- */
  function renderQuotes() {
    var box = host('quotes-section');
    if (!box) return;
    var body = el('div', { class: 'sd-container' }, [ui.skeleton(3, 'md:grid-cols-3')]);
    box.appendChild(el('div', { class: 'sd-container pb-8' }, [
      sectionHead('参考报价'),
      el('p', { class: 'text-xs text-inkWeak', text: '价格仅为参考，最终按需求评估' })
    ]));
    box.appendChild(body);

    api.get('/public/quotes/' + encodeURIComponent(SLUG))
      .then(function (list) {
        var items = list || [];
        var grid = el('div', { class: 'grid gap-6 md:grid-cols-3' });
        items.forEach(function (item) {
          grid.appendChild(el('div', { class: 'sd-card p-6' }, [
            el('p', { class: 'text-sm text-inkWeak', text: item.itemName || '' }),
            el('p', { class: 'mt-3 text-[26px] font-semibold text-ink', text: item.priceText || '面议' }),
            item.priceUnit ? el('p', { class: 'mt-1 text-xs text-inkWeak', text: item.priceUnit }) : null,
            item.description ? el('p', { class: 'mt-4 text-sm text-inkMid pre-wrap', text: item.description }) : null
          ]));
        });
        body.textContent = '';
        body.appendChild(items.length ? grid : ui.empty(null, '敬请期待'));
      })
      .catch(function (err) {
        console.warn('[sdtech] quotes 加载失败：', err && err.message);
        body.textContent = '';
        body.appendChild(ui.fallback(null, '参考报价'));
      });
  }

  /* ---------------- 7. 咨询渠道（zone=cta） ---------------- */
  function renderShops() {
    var box = host('shops-section');
    if (!box) return;
    var grid = el('div', { class: 'sd-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4 py-14 md:py-16' });
    box.appendChild(grid);
    api.get('/public/shop-links', { params: { zone: 'cta' } })
      .then(function (list) {
        var items = (list || []).filter(function (shop) {
          var url = shop.linkUrl || '';
          return (url && url !== '#') || shop.qrcodeImage;
        });
        items.forEach(function (shop) {
          var url = shop.linkUrl || '';
          var body = el('div', { class: 'sd-card p-5 flex items-center gap-4' }, [
            el('div', { class: 'h-11 w-11 shrink-0 rounded-icon bg-surface flex items-center justify-center text-inkMid', html: ui.icon(shop.icon) }),
            el('p', { class: 'text-[15px] font-medium text-ink truncate', text: shop.title || '' })
          ]);
          if (url && url !== '#') {
            grid.appendChild(el('a', { href: url, target: '_blank', rel: 'noopener noreferrer', class: 'block' }, [body]));
          } else {
            grid.appendChild(body);
          }
        });
        if (!items.length) {
          grid.appendChild(el('a', { href: '/contact.html', class: 'sd-btn-primary justify-self-start' }, ['联系咨询']));
        }
      })
      .catch(function () {
        grid.textContent = '';
        grid.appendChild(el('a', { href: '/contact.html', class: 'sd-btn-primary justify-self-start' }, ['联系咨询']));
      });
  }

  /* ---------------- 入口 ---------------- */
  function boot() {
    window.Layout.mount({ active: SLUG });
    window.Layout.ready().then(function (ok) {
      renderBanner();
      renderCases();
      renderQuotes();
      renderShops();
      if (!ok) {
        renderIntro(null, false);
        renderItems(null, false);
        renderDeliverables(null, false);
        return;
      }
      api.get('/public/services/' + encodeURIComponent(SLUG))
        .then(function (detail) {
          renderIntro(detail, true);
          renderItems(detail && detail.items, true);
          renderDeliverables(detail && detail.deliverables, true);
        })
        .catch(function (err) {
          console.warn('[sdtech] service detail 加载失败：', err && err.message);
          renderIntro(null, false);
          renderItems(null, false);
          renderDeliverables(null, false);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
