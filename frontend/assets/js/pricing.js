/**
 * pricing.js — 合作报价页
 *
 * 数据来源：
 *   - 站点 KV：banner.pricing.*（横幅）、pricing_terms（项目约定，1–N .title/.desc）
 *   - GET /api/public/quotes        8 项参考报价
 *   - GET /api/public/process-steps 合作流程 6 步
 *
 * 注意：所有条款文案均来自接口，前端不写死任何业务文案；
 * 约定区块统一使用中性灰底（不使用红色）。
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

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

  /* ---------------- Banner ---------------- */
  function renderBanner() {
    var box = host('banner-section');
    if (!box) return;
    var title = window.Layout.txt('banner', 'pricing.title', '');
    var subtitle = window.Layout.txt('banner', 'pricing.subtitle', '');
    if (title) document.title = title;
    box.appendChild(el('div', { class: 'bg-primarySoft border-b border-line' }, [
      el('div', { class: 'sd-container py-12 md:py-16' }, [
        el('h1', { class: 'text-[28px] md:text-[36px] font-semibold tracking-tight text-ink', text: title || '合作报价' }),
        subtitle ? el('p', { class: 'mt-4 text-[15px] text-inkMid pre-wrap max-w-[680px]', text: subtitle }) : null
      ])
    ]));
  }

  /* ---------------- 全局声明 ---------------- */
  function renderNotice() {
    var box = host('notice-section');
    if (!box) return;
    box.appendChild(el('div', { class: 'sd-container' }, [
      el('div', { class: 'rounded-card border border-line bg-surfaceSoft px-5 py-4 flex items-start gap-3' }, [
        el('span', { class: 'mt-[2px] text-inkWeak', html: ui.ICONS.info }),
        el('p', { class: 'text-sm text-inkMid', text: '价格仅为参考，最终按需求评估' })
      ])
    ]));
  }

  /* ---------------- 参考报价卡片 ---------------- */
  function renderQuotes() {
    var box = host('quotes-section');
    if (!box) return;
    var body = el('div', { class: 'sd-container' }, [ui.skeleton(6, 'md:grid-cols-2 lg:grid-cols-4')]);
    box.appendChild(el('div', { class: 'sd-container pb-8' }, [sectionHead('参考报价')]));
    box.appendChild(body);

    api.get('/public/quotes')
      .then(function (list) {
        var items = list || [];
        var grid = el('div', { class: 'grid gap-6 md:grid-cols-2 lg:grid-cols-4' });
        items.forEach(function (item) {
          grid.appendChild(el('div', { class: 'sd-card sd-card-hover p-6 flex flex-col' }, [
            el('p', { class: 'text-sm text-inkWeak', text: item.itemName || '' }),
            el('div', { class: 'mt-3 flex items-baseline gap-1' }, [
              el('span', { class: 'text-[26px] font-semibold text-ink', text: item.priceText || '面议' }),
              item.priceUnit ? el('span', { class: 'text-xs text-inkWeak', text: item.priceUnit }) : null
            ]),
            item.description ? el('p', { class: 'mt-4 text-sm text-inkMid pre-wrap flex-1', text: item.description }) : null,
            el('a', { href: '/contact.html', class: 'mt-5 inline-flex items-center gap-1 text-sm text-primary' }, [
              el('span', { text: '咨询报价' }),
              el('span', { html: ui.ICONS.arrowRight })
            ])
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

  /* ---------------- 合作流程时间线 ---------------- */
  function renderProcess() {
    var box = host('process-section');
    if (!box) return;
    var body = el('div', { class: 'sd-container' }, [ui.skeleton(6, 'sm:grid-cols-2 lg:grid-cols-6')]);
    box.appendChild(el('div', { class: 'sd-container pb-8' }, [sectionHead('合作流程')]));
    box.appendChild(body);

    api.get('/public/process-steps')
      .then(function (list) {
        var items = list || [];
        var wrap = el('ol', { class: 'grid gap-6 md:grid-cols-2 lg:grid-cols-6' });
        items.forEach(function (item, index) {
          wrap.appendChild(el('li', { class: 'sd-card p-5' }, [
            el('span', {
              class: 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium',
              text: String(item.seq || (index + 1))
            }),
            el('h3', { class: 'mt-4 text-[15px] font-semibold text-ink', text: item.title || '' }),
            el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap', text: item.desc || '' })
          ]));
        });
        body.textContent = '';
        body.appendChild(items.length ? wrap : ui.empty(null, '敬请期待'));
      })
      .catch(function (err) {
        console.warn('[sdtech] process-steps 加载失败：', err && err.message);
        body.textContent = '';
        body.appendChild(ui.fallback(null, '合作流程'));
      });
  }

  /* ---------------- 项目约定（中性灰底） ---------------- */
  function renderTerms() {
    var box = host('terms-section');
    if (!box) return;
    var items = window.Layout.listOf('pricing_terms', ['title', 'desc']);
    var wrap = el('div', { class: 'grid gap-4 md:grid-cols-2' });
    if (!items.length) {
      wrap = ui.fallback(null, '项目约定');
    } else {
      items.forEach(function (item) {
        wrap.appendChild(el('div', { class: 'rounded-card border border-line bg-surfaceSoft p-5 flex items-start gap-3' }, [
          el('span', { class: 'mt-[2px] text-inkWeak', html: ui.ICONS.check }),
          el('div', {}, [
            el('h3', { class: 'text-[15px] font-semibold text-ink', text: item.title || '' }),
            el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap', text: item.desc || '' })
          ])
        ]));
      });
    }
    box.appendChild(el('div', { class: 'sd-container' }, [sectionHead('项目约定'), wrap]));
  }

  /* ---------------- 入口 ---------------- */
  function boot() {
    window.Layout.mount({ active: 'pricing' });
    window.Layout.ready().then(function (ok) {
      renderBanner();
      renderNotice();
      renderQuotes();
      renderProcess();
      if (ok) {
        renderTerms();
      } else {
        host('terms-section').appendChild(ui.fallback(null, '项目约定'));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
