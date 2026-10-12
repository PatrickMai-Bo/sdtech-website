/**
 * pricing.js — 合作报价页
 *
 * 数据来源：
 *   - 站点 KV：banner.pricing.*（横幅）、pricing_terms（项目约定，1–N .title/.desc）
 *   - GET /api/public/quotes        8 项参考报价
 *   - GET /api/public/process-steps 合作流程 6 步
 *
 * 报价卡三级视觉（ui.quoteCard）：
 *   ① 面议 → 虚线边框 + 浅灰底 + inkWeak 价格；
 *   ② 推荐 → 主色 2px 描边 + 右上角主色 badge（取前两个有具体数值的报价项）；
 *   ③ 常规 → 白底细边框。
 *
 * 注意：所有条款文案均来自接口，前端不写死任何业务文案；
 * 约定区块统一使用中性灰底（不使用红色）。
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

  /** 推荐卡数量（0-2） */
  var RECOMMENDED_MAX = 2;

  function host(id) {
    var node = document.getElementById(id);
    if (node) node.textContent = '';
    return node;
  }

  /* ---------------- Banner ---------------- */
  function renderBanner() {
    var box = host('banner-section');
    if (!box) return;
    var title = window.Layout.txt('banner', 'pricing.title', '');
    var subtitle = window.Layout.txt('banner', 'pricing.subtitle', '');
    if (title) document.title = title;
    box.appendChild(ui.banner(title, subtitle, { fallbackTitle: '合作报价' }));
  }

  /* ---------------- 全局声明 ---------------- */
  function renderNotice() {
    var box = host('notice-section');
    if (!box) return;
    box.appendChild(el('div', { class: 'sd-container' }, [
      el('div', { class: 'rounded-card border border-line bg-surfaceSoft px-5 py-4 flex items-start gap-3' }, [
        el('span', { class: 'mt-0.5 shrink-0 text-inkWeak', html: ui.ICONS.info }),
        el('p', { class: 'text-sm text-inkMid', text: '价格仅为参考，最终按需求评估' })
      ])
    ]));
  }

  /* ---------------- 参考报价卡片 ---------------- */
  function renderQuotes() {
    var box = host('quotes-section');
    if (!box) return;
    var body = el('div', { class: 'sd-container' }, [ui.skeleton(6, 'md:grid-cols-2 lg:grid-cols-4')]);
    box.appendChild(el('div', { class: 'sd-container pb-8' }, [
      ui.sectionHead('PRICING', '参考报价', '')
    ]));
    box.appendChild(body);

    api.get('/public/quotes')
      .then(function (list) {
        var items = list || [];
        var recommendedUsed = 0;
        var grid = el('div', { class: 'grid gap-6 md:grid-cols-2 lg:grid-cols-4' });
        items.forEach(function (item) {
          var negotiable = ui.isNegotiable(item.priceText);
          var recommended = !negotiable && recommendedUsed < RECOMMENDED_MAX;
          if (recommended) recommendedUsed += 1;
          grid.appendChild(ui.quoteCard(item, { recommended: recommended }));
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
    box.appendChild(el('div', { class: 'sd-container pb-8' }, [
      ui.sectionHead('PROCESS', '合作流程', '')
    ]));
    box.appendChild(body);

    api.get('/public/process-steps')
      .then(function (list) {
        var items = list || [];
        body.textContent = '';
        body.appendChild(items.length ? ui.timeline(items) : ui.empty(null, '敬请期待'));
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
          el('span', { class: 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success', html: ui.ICONS.checkCircle }),
          el('div', {}, [
            el('h3', { class: 'text-[15px] font-semibold text-ink', text: item.title || '' }),
            el('p', { class: 'mt-2 text-sm text-inkMid pre-wrap', text: item.desc || '' })
          ])
        ]));
      });
    }
    box.appendChild(el('div', { class: 'sd-container' }, [
      ui.sectionHead('TERMS', '项目约定', ''),
      wrap
    ]));
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
