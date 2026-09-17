/**
 * pricing.js（后台）— 报价管理
 *
 * 接口：GET /admin/quotes、POST /admin/quotes、PUT /admin/quotes/{id}、DELETE /admin/quotes/{id}
 * 字段：serviceId（可空）、itemName、priceText、priceUnit、description、sortOrder、status
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var common = window.common;
  var el = ui.el;

  var listBox = null;

  function renderList(records) {
    listBox.textContent = '';
    if (!records.length) {
      listBox.appendChild(el('div', { class: 'p-10 text-center text-sm text-inkWeak', text: '暂无报价项，点击右上角新增' }));
      return;
    }
    var table = el('table', { class: 'sd-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { text: '排序' }),
          el('th', { text: '报价项' }),
          el('th', { text: '价格' }),
          el('th', { text: '单位' }),
          el('th', { text: '说明' }),
          el('th', { text: '状态' }),
          el('th', { text: '操作' })
        ])
      ])
    ]);
    var tbody = el('tbody', {});
    records.forEach(function (item) {
      var ops = el('div', { class: 'flex flex-wrap gap-2' }, [
        (function () {
          var btn = el('button', { type: 'button', class: 'px-2 py-1 rounded-ctl border border-line text-xs text-inkMid hover:border-primary hover:text-primary transition-colors duration-200', text: '编辑' });
          btn.addEventListener('click', function () { openEdit(item); });
          return btn;
        })(),
        (function () {
          var btn = el('button', { type: 'button', class: 'px-2 py-1 rounded-ctl border border-line text-xs text-inkMid hover:border-inkMid transition-colors duration-200', text: '删除' });
          btn.addEventListener('click', function () { removeQuote(item); });
          return btn;
        })()
      ]);
      var desc = item.description || '';
      tbody.appendChild(el('tr', {}, [
        el('td', { text: String(item.sortOrder === undefined ? 0 : item.sortOrder) }),
        el('td', {}, [el('span', { class: 'text-ink font-medium', text: item.itemName || '' })]),
        el('td', { text: item.priceText || '面议' }),
        el('td', { text: item.priceUnit || '—' }),
        el('td', {}, [el('span', { class: 'text-xs text-inkMid pre-wrap', text: desc.length > 40 ? desc.slice(0, 40) + '…' : desc })]),
        el('td', {}, [
          el('span', {
            class: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs ' + (item.status === 1 ? 'bg-primarySoft text-primary' : 'bg-surface text-inkWeak'),
            text: item.status === 1 ? '显示' : '隐藏'
          })
        ]),
        el('td', {}, [ops])
      ]));
    });
    table.appendChild(tbody);
    listBox.appendChild(el('div', { class: 'sd-admin-table-wrap' }, [table]));
  }

  function loadList() {
    listBox.textContent = '';
    listBox.appendChild(el('div', { class: 'p-8 text-center text-sm text-inkWeak', text: '加载中…' }));
    adminApi.get('/admin/quotes')
      .then(function (list) { renderList(list || []); })
      .catch(function (err) {
        console.warn('[sdtech] quotes 加载失败：', err && err.message);
        listBox.textContent = '';
        listBox.appendChild(el('div', { class: 'p-8 text-center text-sm text-inkWeak', text: '报价列表加载失败，请稍后刷新' }));
      });
  }

  function removeQuote(item) {
    common.confirm('删除报价', '确认删除「' + (item.itemName || '') + '」？')
      .then(function (yes) {
        if (!yes) return;
        adminApi.del('/admin/quotes/' + item.id).then(loadList).catch(function () {});
      });
  }

  function openEdit(item) {
    var isNew = !item;
    var nameInput = common.input({ value: item ? item.itemName : '', placeholder: '如 企业官网设计' });
    var priceInput = common.input({ value: item ? item.priceText : '', placeholder: '如 2000-6000 或 面议' });
    var unitInput = common.input({ value: item ? item.priceUnit : '', placeholder: '如 元/套' });
    var descInput = common.textarea({ value: item ? item.description : '', placeholder: '报价说明' });
    var sortInput = common.input({ type: 'number', value: item && item.sortOrder !== undefined ? item.sortOrder : 0 });
    var statusToggle = common.toggle({ value: item ? item.status === 1 : true });

    var body = el('div', {}, [
      common.field('报价项名称', nameInput, { required: true }),
      common.field('价格文本', priceInput, { hint: '留空则前台显示“面议”' }),
      common.field('价格单位', unitInput),
      common.field('说明', descInput),
      common.field('排序值', sortInput, { hint: '数字越小越靠前' }),
      common.field('是否显示', statusToggle)
    ]);

    var saveBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '保存' });
    var cancelBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-5 !py-2', text: '取消' });
    var dialog = common.drawer({
      title: isNew ? '新增报价' : '编辑报价',
      bodyEl: body,
      footerEl: el('div', { class: 'flex gap-3' }, [cancelBtn, saveBtn])
    });
    cancelBtn.addEventListener('click', dialog.close);

    saveBtn.addEventListener('click', function () {
      var payload = {
        itemName: nameInput.value.trim(),
        priceText: priceInput.value.trim(),
        priceUnit: unitInput.value.trim(),
        description: descInput.value,
        sortOrder: parseInt(sortInput.value, 10) || 0,
        status: common.toggleValue(statusToggle)
      };
      if (!payload.itemName) { ui.toast('请填写报价项名称', 'error'); return; }
      saveBtn.disabled = true;
      var request = isNew
        ? adminApi.post('/admin/quotes', { body: payload })
        : adminApi.put('/admin/quotes/' + item.id, { body: payload });
      request
        .then(function () { dialog.close(); loadList(); })
        .catch(function () { saveBtn.disabled = false; });
    });
  }

  function boot() {
    var box = common.mountShell('pricing');
    box.textContent = '';
    box.appendChild(el('div', { class: 'mb-6 flex flex-wrap items-end justify-between gap-3' }, [
      el('div', {}, [
        el('h1', { class: 'text-[20px] font-semibold text-ink', text: '报价管理' }),
        el('p', { class: 'mt-1 text-sm text-inkMid', text: '维护合作报价页与业务页的参考报价' })
      ]),
      (function () {
        var btn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '+ 新增报价' });
        btn.addEventListener('click', function () { openEdit(null); });
        return btn;
      })()
    ]));
    listBox = el('div', { class: 'sd-card overflow-hidden' });
    box.appendChild(listBox);
    loadList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
