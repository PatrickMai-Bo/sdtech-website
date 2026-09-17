/**
 * messages.js（后台）— 留言管理
 *
 * 接口：GET /admin/messages（分页 + isRead 过滤 + 时间倒序）
 *      GET /admin/messages/unread-count
 *      PATCH /admin/messages/{id}/read  {isRead:1|0}
 *      POST /admin/messages/batch-read  {ids:[]}
 *      DELETE /admin/messages/{id}
 *
 * 交互：未读加粗、单条标记已读/未读、批量已读、删除二次确认。
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var common = window.common;
  var el = ui.el;

  var PAGE_SIZE = 10;
  var state = { page: 1, isRead: '' };
  var listBox = null;
  var pagerBox = null;
  var checkedIds = [];

  /* ---------------- 筛选栏 ---------------- */
  function buildFilters() {
    var filterSelect = common.select([
      { value: '', label: '全部留言' },
      { value: '0', label: '仅未读' },
      { value: '1', label: '仅已读' }
    ], '');
    filterSelect.addEventListener('change', function () {
      state.isRead = filterSelect.value;
      state.page = 1;
      loadList();
    });

    var batchBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-4 !py-2', text: '批量标记已读' });
    batchBtn.addEventListener('click', function () {
      if (!checkedIds.length) { ui.toast('请先勾选留言', 'error'); return; }
      adminApi.post('/admin/messages/batch-read', { body: { ids: checkedIds.slice() } })
        .then(function () { checkedIds = []; loadList(); })
        .catch(function () {});
    });

    return el('div', { class: 'sd-card p-4 mb-4 flex flex-wrap items-center gap-3' }, [filterSelect, batchBtn]);
  }

  /* ---------------- 列表 ---------------- */
  function loadList() {
    listBox.textContent = '';
    listBox.appendChild(el('div', { class: 'p-8 text-center text-sm text-inkWeak', text: '加载中…' }));
    adminApi.get('/admin/messages', {
      params: { page: state.page, size: PAGE_SIZE, isRead: state.isRead || '' }
    })
      .then(function (page) {
        renderList(page || {});
        renderPager(page || {});
      })
      .catch(function (err) {
        console.warn('[sdtech] messages 加载失败：', err && err.message);
        listBox.textContent = '';
        listBox.appendChild(el('div', { class: 'p-8 text-center text-sm text-inkWeak', text: '留言加载失败，请稍后刷新' }));
        pagerBox.textContent = '';
      });
  }

  function renderList(page) {
    listBox.textContent = '';
    var records = page.records || [];
    if (!records.length) {
      listBox.appendChild(el('div', { class: 'p-10 text-center text-sm text-inkWeak', text: '暂无留言' }));
      return;
    }
    var table = el('table', { class: 'sd-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { text: '' }),
          el('th', { text: '姓名' }),
          el('th', { text: '联系电话' }),
          el('th', { text: '需求描述' }),
          el('th', { text: '时间' }),
          el('th', { text: '操作' })
        ])
      ])
    ]);
    var tbody = el('tbody', {});
    records.forEach(function (item) {
      var row = el('tr', { class: item.isRead === 0 ? 'is-unread' : '' });

      var check = el('input', { type: 'checkbox' });
      check.addEventListener('change', function () {
        if (check.checked) {
          if (checkedIds.indexOf(item.id) === -1) checkedIds.push(item.id);
        } else {
          checkedIds = checkedIds.filter(function (id) { return id !== item.id; });
        }
      });

      var readBtn = el('button', {
        type: 'button',
        class: 'px-2 py-1 rounded-ctl border border-line text-xs text-inkMid hover:border-primary hover:text-primary transition-colors duration-200',
        text: item.isRead === 1 ? '标记未读' : '标记已读'
      });
      readBtn.addEventListener('click', function () {
        adminApi.patch('/admin/messages/' + item.id + '/read', { body: { isRead: item.isRead === 1 ? 0 : 1 } })
          .then(loadList)
          .catch(function () {});
      });

      var delBtn = el('button', {
        type: 'button',
        class: 'px-2 py-1 rounded-ctl border border-line text-xs text-inkMid hover:border-inkMid transition-colors duration-200',
        text: '删除'
      });
      delBtn.addEventListener('click', function () {
        common.confirm('删除留言', '确认删除「' + (item.name || '') + '」提交的留言？该操作不可恢复。')
          .then(function (yes) {
            if (!yes) return;
            adminApi.del('/admin/messages/' + item.id).then(loadList).catch(function () {});
          });
      });

      var demand = item.demand || '';
      row.appendChild(el('td', {}, [check]));
      row.appendChild(el('td', { text: item.name || '' }));
      row.appendChild(el('td', { text: item.phone || '' }));
      row.appendChild(el('td', {}, [
        el('span', { class: 'text-inkMid pre-wrap', text: demand.length > 60 ? demand.slice(0, 60) + '…' : demand })
      ]));
      row.appendChild(el('td', { text: ui.fmtTime(item.createTime) }));
      row.appendChild(el('td', {}, [el('div', { class: 'flex flex-wrap gap-2' }, [readBtn, delBtn])]));
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    listBox.appendChild(el('div', { class: 'sd-admin-table-wrap' }, [table]));
  }

  function renderPager(page) {
    pagerBox.textContent = '';
    var pages = page.pages || 1;
    if (pages <= 1) return;
    var row = el('div', { class: 'flex items-center justify-center gap-2 py-4' });
    function pageBtn(label, target, disabled, active) {
      var btn = el('button', {
        type: 'button',
        class: 'min-w-[36px] h-[36px] px-3 rounded-ctl border text-sm transition-colors duration-200 ' +
          (active ? 'border-primary bg-primary text-white' : 'border-line bg-white text-inkMid hover:border-primary hover:text-primary') +
          (disabled ? ' opacity-40 cursor-not-allowed' : ''),
        text: label
      });
      if (!disabled) btn.addEventListener('click', function () { state.page = target; loadList(); });
      return btn;
    }
    row.appendChild(pageBtn('上一页', state.page - 1, state.page <= 1, false));
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 2) {
        row.appendChild(pageBtn(String(i), i, false, i === state.page));
      }
    }
    row.appendChild(pageBtn('下一页', state.page + 1, state.page >= pages, false));
    pagerBox.appendChild(row);
  }

  /* ---------------- 入口 ---------------- */
  function boot() {
    var box = common.mountShell('messages');
    box.textContent = '';
    box.appendChild(el('div', { class: 'mb-6' }, [
      el('h1', { class: 'text-[20px] font-semibold text-ink', text: '留言管理' }),
      el('p', { class: 'mt-1 text-sm text-inkMid', text: '查看客户留言，处理完成后标记已读' })
    ]));
    box.appendChild(buildFilters());
    listBox = el('div', { class: 'sd-card overflow-hidden' });
    pagerBox = el('div', {});
    box.appendChild(listBox);
    box.appendChild(pagerBox);
    loadList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
