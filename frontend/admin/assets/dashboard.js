/**
 * dashboard.js — 后台概览
 *
 * 数据：GET /api/admin/cases（取 total）、/admin/services、/admin/quotes、
 *      /admin/messages/unread-count
 * 展示：案例数 / 业务数 / 未读留言 / 报价项 四张概览卡 + 快捷入口
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var common = window.common;
  var el = ui.el;

  /** 概览卡片：valueNode 为可替换的数字节点 */
  function statCard(label, valueNode, hint, iconKey, href) {
    var valueBox = el('p', { class: 'mt-4 text-[30px] font-semibold text-ink leading-none' });
    valueBox.appendChild(valueNode);
    var body = el('div', { class: 'sd-card p-6' }, [
      el('div', { class: 'flex items-start justify-between' }, [
        el('p', { class: 'text-sm text-inkWeak', text: label }),
        el('span', { class: 'text-inkWeak', html: ui.icon(iconKey) })
      ]),
      valueBox,
      el('p', { class: 'mt-3 text-xs text-inkWeak', text: hint })
    ]);
    return href ? el('a', { href: href, class: 'block' }, [body]) : body;
  }

  function loadingText() {
    return el('span', { class: 'text-inkWeak text-[22px]', text: '—' });
  }

  /** 安全计数：接口失败时显示占位横线 */
  function countFrom(promise, extract) {
    return promise.then(extract).catch(function (err) {
      console.warn('[sdtech] dashboard 统计失败：', err && err.message);
      return el('span', { class: 'text-inkWeak text-[22px]', text: '—' });
    });
  }

  function render() {
    var box = common.mountShell('dashboard');
    box.textContent = '';

    box.appendChild(el('div', { class: 'mb-6' }, [
      el('h1', { class: 'text-[20px] font-semibold text-ink', text: '概览' }),
      el('p', { class: 'mt-1 text-sm text-inkMid', text: '站点数据总览与常用入口' })
    ]));

    var grid = el('div', { class: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4' });

    var caseNode = loadingText();
    var serviceNode = loadingText();
    var unreadNode = loadingText();
    var quoteNode = loadingText();

    grid.appendChild(statCard('案例数量', caseNode, '案例库中已发布与隐藏的案例总数', 'layers', '/admin/cases.html'));
    grid.appendChild(statCard('业务数量', serviceNode, '官网展示的业务条目数', 'grid', '/admin/services.html'));
    grid.appendChild(statCard('未读留言', unreadNode, '待处理的客户留言', 'message', '/admin/messages.html'));
    grid.appendChild(statCard('报价项', quoteNode, '合作报价页展示的报价条目数', 'quote', '/admin/pricing.html'));
    box.appendChild(grid);

    // 快捷入口
    var links = el('div', { class: 'mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3' });
    [
      { title: '首页内容', desc: '编辑导航、横幅、优势、流程、FAQ 等全站文案', url: '/admin/home.html' },
      { title: '案例管理', desc: '新增或编辑案例项目与图集', url: '/admin/cases.html' },
      { title: '留言管理', desc: '查看客户留言并标记已读', url: '/admin/messages.html' }
    ].forEach(function (item) {
      links.appendChild(el('a', {
        href: item.url,
        class: 'sd-card p-5 block hover:border-primary transition-colors duration-200'
      }, [
        el('p', { class: 'text-[15px] font-medium text-ink', text: item.title }),
        el('p', { class: 'mt-1 text-sm text-inkMid', text: item.desc })
      ]));
    });
    box.appendChild(links);

    // 填充数据
    countFrom(adminApi.get('/admin/cases', { params: { page: 1, size: 1 } }), function (page) {
      return el('span', { text: String((page && page.total) || 0) });
    }).then(function (node) { caseNode.replaceWith(node); });

    countFrom(adminApi.get('/admin/services'), function (list) {
      return el('span', { text: String((list || []).length) });
    }).then(function (node) { serviceNode.replaceWith(node); });

    countFrom(adminApi.get('/admin/messages/unread-count'), function (data) {
      var count = (data && data.count) || 0;
      return el('span', { class: count > 0 ? 'text-accent' : '', text: String(count) });
    }).then(function (node) { unreadNode.replaceWith(node); });

    countFrom(adminApi.get('/admin/quotes'), function (list) {
      return el('span', { text: String((list || []).length) });
    }).then(function (node) { quoteNode.replaceWith(node); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})(window, document);
