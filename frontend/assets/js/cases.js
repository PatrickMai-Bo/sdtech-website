/**
 * cases.js — 案例作品页
 *
 * 功能：
 *   - 分类筛选 pills（全部 + /public/cases/categories 返回的分类；选中=主色实心白字）
 *   - 网格卡片（3 / 2 / 1 列响应式，4:3 封面 + 分类 pill + hover 放大）
 *   - 点击卡片弹窗展示详情（左图右信息 / 项目简介 / 技术或制作方式 / 交付成果 / 多图）
 *   - 分页 + URL 参数 ?category=&page=&case= 还原
 *
 * 数据：GET /api/public/cases、/public/cases/categories、/public/cases/{id}
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

  var PAGE_SIZE = 9;
  var state = {
    category: '',
    page: 1,
    pages: 1,
    total: 0,
    categories: []
  };

  /* ---------------- URL 参数读写 ---------------- */
  function readUrlState() {
    var params = new URLSearchParams(window.location.search || '');
    state.category = params.get('category') || '';
    var page = parseInt(params.get('page'), 10);
    state.page = (!isNaN(page) && page > 0) ? page : 1;
    return { caseId: params.get('case') };
  }

  function syncUrl() {
    var params = new URLSearchParams();
    if (state.category) params.set('category', state.category);
    if (state.page > 1) params.set('page', String(state.page));
    var query = params.toString();
    var url = window.location.pathname + (query ? '?' + query : '');
    window.history.replaceState(null, '', url);
  }

  function host(id) {
    var node = document.getElementById(id);
    if (node) node.textContent = '';
    return node;
  }

  /* ---------------- Banner ---------------- */
  function renderBanner() {
    var box = host('banner-section');
    if (!box) return;
    var title = window.Layout.txt('banner', 'cases.title', '');
    var subtitle = window.Layout.txt('banner', 'cases.subtitle', '');
    if (title) document.title = title;
    box.appendChild(ui.banner(title, subtitle, { fallbackTitle: '案例作品' }));
  }

  /* ---------------- 分类 pills ---------------- */
  function chip(label, code, active) {
    return el('button', {
      type: 'button',
      class: 'sd-chip ' + (active ? 'sd-chip-on' : 'sd-chip-off'),
      text: label,
      onclick: function () {
        if (state.category === code && code !== '') return;
        state.category = code;
        state.page = 1;
        syncUrl();
        renderChips();
        loadCases();
      }
    });
  }

  function renderChips() {
    var box = host('filter-section');
    if (!box) return;
    var row = el('div', { class: 'sd-container flex flex-wrap gap-3' }, [
      chip('全部', '', state.category === '')
    ]);
    state.categories.forEach(function (cat) {
      row.appendChild(chip(cat.name || cat.code || '', cat.code || '', state.category === (cat.code || '')));
    });
    box.appendChild(row);
  }

  /* ---------------- 案例卡片 ---------------- */
  function caseCard(item) {
    return ui.caseCard(item, {
      mode: 'button',
      categoryName: categoryName(item.category),
      summaryClamp: 2,
      actionText: '查看详情',
      onActivate: function (target) { openDetail(target.id); }
    });
  }

  /** 分类 code → 展示名（取不到时返回空，则不显示 pill） */
  function categoryName(code) {
    if (!code) return '';
    for (var i = 0; i < state.categories.length; i++) {
      if (state.categories[i] && state.categories[i].code === code) {
        return state.categories[i].name || code;
      }
    }
    return '';
  }

  /* ---------------- 列表 + 分页 ---------------- */
  function loadCases() {
    var gridBox = host('grid-section');
    var pagerBox = host('pager-section');
    if (!gridBox) return;
    var gridWrap = el('div', { class: 'sd-container' }, [ui.skeleton(6, 'md:grid-cols-2 lg:grid-cols-3')]);
    gridBox.appendChild(gridWrap);

    api.get('/public/cases', {
      params: { category: state.category || '', page: state.page, size: PAGE_SIZE }
    })
      .then(function (page) {
        var records = (page && page.records) || [];
        state.pages = (page && page.pages) || 1;
        state.total = (page && page.total) || 0;
        var grid = el('div', { class: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' });
        records.forEach(function (item) { grid.appendChild(caseCard(item)); });
        gridWrap.textContent = '';
        gridWrap.appendChild(records.length ? grid : ui.empty(null, '敬请期待'));
        renderPager(pagerBox);
      })
      .catch(function (err) {
        console.warn('[sdtech] cases 加载失败：', err && err.message);
        gridWrap.textContent = '';
        gridWrap.appendChild(ui.fallback(null, '案例列表'));
        if (pagerBox) pagerBox.textContent = '';
      });
  }

  function renderPager(box) {
    if (!box) return;
    if (!state.pages || state.pages <= 1) { box.textContent = ''; return; }
    var row = el('div', { class: 'sd-container flex items-center justify-center gap-2 pt-4' });

    function pageBtn(label, target, active, disabled) {
      return el('button', {
        type: 'button',
        disabled: disabled ? 'disabled' : null,
        class: 'min-w-[38px] h-[38px] px-3 rounded-ctl border text-sm transition-colors duration-200 ' +
          (active ? 'border-primary bg-primary text-white' : 'border-line bg-white text-inkMid hover:border-primary hover:text-primary') +
          (disabled ? ' opacity-40 cursor-not-allowed' : ''),
        text: label,
        onclick: function () {
          if (disabled || target === state.page) return;
          state.page = target;
          syncUrl();
          loadCases();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    row.appendChild(pageBtn('上一页', state.page - 1, false, state.page <= 1));
    var start = Math.max(1, state.page - 2);
    var end = Math.min(state.pages, start + 4);
    start = Math.max(1, end - 4);
    for (var i = start; i <= end; i++) {
      row.appendChild(pageBtn(String(i), i, i === state.page, false));
    }
    row.appendChild(pageBtn('下一页', state.page + 1, false, state.page >= state.pages));
    box.appendChild(row);
  }

  /* ---------------- 详情弹窗（左图 + 右信息） ---------------- */
  function infoBlock(title, text) {
    if (!text) return null;
    return el('div', { class: 'mb-5 last:mb-0' }, [
      el('h4', { class: 'text-sm font-medium text-inkWeak mb-2', text: title }),
      el('p', { class: 'text-[15px] text-inkDeep pre-wrap', text: text })
    ]);
  }

  function galleryBlock(images) {
    if (!images || !images.length) return null;
    var row = el('div', { class: 'flex gap-3 overflow-x-auto sd-noscrollbar pb-2' });
    images.forEach(function (image) {
      row.appendChild(ui.img(image.imageUrl, image.altText || '', 800, 600, 'h-[160px] w-[240px] shrink-0 rounded-ctl object-cover'));
    });
    return el('div', { class: 'mb-5' }, [
      el('h4', { class: 'text-sm font-medium text-inkWeak mb-2', text: '项目图集' }),
      row
    ]);
  }

  function openDetail(id) {
    if (!id) return;
    var loading = el('div', { class: 'py-10 text-center text-sm text-inkWeak', text: '加载中…' });
    var dialog = ui.modal({
      title: '案例详情',
      bodyEl: loading,
      size: window.innerWidth < 768 ? 'full' : 'default'
    });

    api.get('/public/cases/' + encodeURIComponent(id))
      .then(function (detail) {
        var meta = (detail.categoryName || detail.category || '') +
          (detail.createTime ? ' · ' + ui.fmtTime(detail.createTime) : '');
        var body = el('div', { class: 'px-6 py-5 overflow-y-auto' }, [
          el('div', { class: 'grid gap-6 md:grid-cols-2' }, [
            el('div', { class: 'overflow-hidden rounded-card border border-line bg-surfaceSoft' }, [
              ui.img(detail.coverImage, detail.title, 800, 600, 'aspect-[4/3] w-full object-cover')
            ]),
            el('div', {}, [
              el('h3', { class: 'text-lg font-semibold text-ink', text: detail.title || '' }),
              meta ? el('p', { class: 'mt-1 text-xs text-inkWeak', text: meta }) : null,
              el('div', { class: 'mt-4' }, [
                infoBlock('项目简介', detail.summary),
                infoBlock('技术 / 制作方式', detail.techOrMethod),
                infoBlock('交付成果', detail.deliverResult)
              ])
            ])
          ]),
          galleryBlock(detail.images)
        ]);
        var target = dialog.panel.querySelector('.overflow-y-auto');
        if (target) target.replaceWith(body);
      })
      .catch(function (err) {
        console.warn('[sdtech] case detail 加载失败：', err && err.message);
        var errorBox = el('div', { class: 'px-6 py-5 overflow-y-auto' }, [ui.fallback(null, '案例详情')]);
        var target = dialog.panel.querySelector('.overflow-y-auto');
        if (target) target.replaceWith(errorBox);
      });
  }

  /* ---------------- 入口 ---------------- */
  function boot() {
    window.Layout.mount({ active: 'cases' });
    var url = readUrlState();
    window.Layout.ready().then(function () {
      renderBanner();
      api.get('/public/cases/categories')
        .then(function (list) {
          state.categories = list || [];
          renderChips();
        })
        .catch(function (err) {
          console.warn('[sdtech] categories 加载失败：', err && err.message);
          state.categories = [];
          renderChips();
        })
        .then(function () {
          loadCases();
          if (url.caseId) openDetail(url.caseId);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
