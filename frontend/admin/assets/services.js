/**
 * services.js — 业务管理
 *
 * 接口：业务 5 个（列表/新增/修改/删除/排序）+ 细分服务 4 个 + 交付物 4 个
 *   GET    /admin/services
 *   POST   /admin/services
 *   PUT    /admin/services/{id}
 *   DELETE /admin/services/{id}
 *   POST   /admin/services/{id}/sort   {direction:'up'|'down'}
 *   GET    /admin/services/{id}/items
 *   POST   /admin/service-items        {serviceId,title,description,icon,sortOrder,status}
 *   PUT    /admin/service-items/{id}
 *   DELETE /admin/service-items/{id}
 *   GET    /admin/services/{id}/deliverables
 *   POST   /admin/deliverables         {serviceId,content,icon,sortOrder}
 *   PUT    /admin/deliverables/{id}
 *   DELETE /admin/deliverables/{id}
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var common = window.common;
  var el = ui.el;

  var listBox = null;

  /* ------------------------------------------------------------------ *
   * 业务列表
   * ------------------------------------------------------------------ */
  function actionBtn(label, cls, onClick) {
    var btn = el('button', {
      type: 'button',
      class: 'px-2 py-1 rounded-ctl border border-line text-xs transition-colors duration-200 ' + (cls || 'text-inkMid hover:border-primary hover:text-primary')
    }, [label]);
    btn.addEventListener('click', onClick);
    return btn;
  }

  function statusTag(status) {
    return el('span', {
      class: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs ' +
        (status === 1 ? 'bg-primarySoft text-primary' : 'bg-surface text-inkWeak'),
      text: status === 1 ? '显示' : '隐藏'
    });
  }

  function renderList(records) {
    listBox.textContent = '';
    if (!records.length) {
      listBox.appendChild(el('div', { class: 'p-10 text-center text-sm text-inkWeak', text: '暂无业务，点击右上角新增' }));
      return;
    }
    var table = el('table', { class: 'sd-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { text: '排序' }),
          el('th', { text: '名称' }),
          el('th', { text: '标识' }),
          el('th', { text: '页面键' }),
          el('th', { text: '状态' }),
          el('th', { text: '操作' })
        ])
      ])
    ]);
    var tbody = el('tbody', {});
    records.forEach(function (item, index) {
      var ops = el('div', { class: 'flex flex-wrap gap-2' }, [
        actionBtn('编辑', '', function () { openEdit(item); }),
        actionBtn('细分服务', '', function () { openItems(item); }),
        actionBtn('交付物', '', function () { openDeliverables(item); }),
        actionBtn('上移', '', function () { moveSort(item, 'up'); }),
        actionBtn('下移', '', function () { moveSort(item, 'down'); }),
        actionBtn('删除', 'text-inkMid hover:border-inkMid', function () { removeService(item); })
      ]);
      tbody.appendChild(el('tr', {}, [
        el('td', { text: String(item.sortOrder === undefined || item.sortOrder === null ? index : item.sortOrder) }),
        el('td', {}, [
          el('div', { class: 'flex items-center gap-3' }, [
            el('span', { class: 'w-8 h-8 shrink-0 rounded-icon bg-surface flex items-center justify-center text-inkMid', html: ui.icon(item.icon) }),
            el('span', { class: 'text-ink font-medium', text: item.name || '' })
          ])
        ]),
        el('td', { text: item.slug || '' }),
        el('td', { text: item.pageKey || '—' }),
        el('td', {}, [statusTag(item.status)]),
        el('td', {}, [ops])
      ]));
    });
    table.appendChild(tbody);
    listBox.appendChild(el('div', { class: 'sd-admin-table-wrap' }, [table]));
  }

  function loadList() {
    listBox.textContent = '';
    listBox.appendChild(ui.skeleton(3, 'grid-cols-1'));
    adminApi.get('/admin/services')
      .then(function (list) { renderList(list || []); })
      .catch(function (err) {
        console.warn('[sdtech] services 加载失败：', err && err.message);
        listBox.textContent = '';
        listBox.appendChild(el('div', { class: 'p-10 text-center text-sm text-inkWeak', text: '业务列表加载失败，请稍后刷新' }));
      });
  }

  function moveSort(item, direction) {
    adminApi.post('/admin/services/' + item.id + '/sort', { body: { direction: direction } })
      .then(loadList)
      .catch(function () { /* Toast 已提示 */ });
  }

  function removeService(item) {
    common.confirm('删除业务', '确认删除「' + (item.name || '') + '」？其细分服务会一并下线。')
      .then(function (yes) {
        if (!yes) return;
        adminApi.del('/admin/services/' + item.id).then(loadList).catch(function () {});
      });
  }

  /* ------------------------------------------------------------------ *
   * 业务编辑抽屉
   * ------------------------------------------------------------------ */
  function openEdit(item) {
    var isNew = !item;
    var iconOptions = ['monitor', 'palette', 'video', 'file', 'sparkle', 'link', 'layers', 'shop', 'quote', 'image', 'check', 'star'];

    var slugInput = common.input({ value: item ? item.slug : '', placeholder: '如 web-redesign' });
    var nameInput = common.input({ value: item ? item.name : '', placeholder: '业务名称' });
    var subtitleInput = common.input({ value: item ? item.subtitle : '', placeholder: '业务页副标题（页面级业务填）' });
    var summaryInput = common.textarea({ value: item ? item.summary : '', placeholder: '业务简介' });
    var iconSelect = common.select(iconOptions.map(function (key) { return { value: key, label: key }; }), item ? item.icon : 'sparkle');
    var pageKeyInput = common.input({ value: item ? item.pageKey : '', placeholder: 'web / design / video / office，可留空' });
    var targetInput = common.input({ value: item ? item.targetUrl : '', placeholder: '如 web.html#web-redesign' });
    var sortInput = common.input({ type: 'number', value: item && item.sortOrder !== undefined ? item.sortOrder : 0 });
    var statusToggle = common.toggle({ value: item ? item.status === 1 : true });
    var coverField = common.imageField({ value: item ? item.coverImage : '' });

    var body = el('div', {}, [
      common.field('业务标识 slug', slugInput, { required: true, hint: '唯一英文标识，如 web-new' }),
      common.field('业务名称', nameInput, { required: true }),
      common.field('副标题', subtitleInput),
      common.field('业务简介', summaryInput),
      common.field('图标', iconSelect),
      common.field('页面键 page_key', pageKeyInput, { hint: '仅页面级业务填写：web / design / video / office' }),
      common.field('跳转链接', targetInput),
      common.field('排序值', sortInput, { hint: '数字越小越靠前' }),
      common.field('封面图', coverField.node),
      common.field('是否显示', statusToggle)
    ]);

    var saveBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2' }, ['保存']);
    var cancelBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-5 !py-2' }, ['取消']);
    var dialog = common.drawer({ title: isNew ? '新增业务' : '编辑业务', bodyEl: body, footerEl: el('div', { class: 'flex gap-3' }, [cancelBtn, saveBtn]) });
    cancelBtn.addEventListener('click', dialog.close);

    saveBtn.addEventListener('click', function () {
      var payload = {
        slug: slugInput.value.trim(),
        name: nameInput.value.trim(),
        subtitle: subtitleInput.value.trim(),
        summary: summaryInput.value,
        icon: iconSelect.value,
        coverImage: coverField.getValue(),
        targetUrl: targetInput.value.trim(),
        pageKey: pageKeyInput.value.trim(),
        sortOrder: parseInt(sortInput.value, 10) || 0,
        status: common.toggleValue(statusToggle)
      };
      if (!payload.slug || !payload.name) { ui.toast('请填写业务标识与名称', 'error'); return; }
      saveBtn.disabled = true;
      var request = isNew
        ? adminApi.post('/admin/services', { body: payload })
        : adminApi.put('/admin/services/' + item.id, { body: payload });
      request
        .then(function () { dialog.close(); loadList(); })
        .catch(function () { saveBtn.disabled = false; });
    });
  }

  /* ------------------------------------------------------------------ *
   * 细分服务子项管理
   * ------------------------------------------------------------------ */
  function openItems(service) {
    var bodyWrap = el('div', {});
    var dialog = common.drawer({ title: '细分服务 · ' + (service.name || ''), bodyEl: bodyWrap, width: 'max-w-[640px]' });

    function renderRows(records) {
      bodyWrap.textContent = '';
      (records || []).forEach(function (sub, index) {
        var titleInput = common.input({ value: sub.title, placeholder: '标题' });
        var descInput = common.textarea({ value: sub.description, placeholder: '描述' });
        var iconInput = common.input({ value: sub.icon, placeholder: '图标 key' });
        var sortInput = common.input({ type: 'number', value: sub.sortOrder === undefined ? index : sub.sortOrder });
        var statusToggle = common.toggle({ value: sub.status === 1 });

        var saveBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-4 !py-1.5', text: '保存' });
        var delBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-4 !py-1.5', text: '删除' });

        saveBtn.addEventListener('click', function () {
          adminApi.put('/admin/service-items/' + sub.id, {
            body: {
              serviceId: service.id,
              title: titleInput.value.trim(),
              description: descInput.value,
              icon: iconInput.value.trim(),
              sortOrder: parseInt(sortInput.value, 10) || 0,
              status: common.toggleValue(statusToggle)
            }
          }).then(function () { ui.toast('保存成功', 'success'); }).catch(function () {});
        });
        delBtn.addEventListener('click', function () {
          common.confirm('删除细分服务', '确认删除「' + (sub.title || '') + '」？').then(function (yes) {
            if (!yes) return;
            adminApi.del('/admin/service-items/' + sub.id).then(loadRows).catch(function () {});
          });
        });

        bodyWrap.appendChild(el('div', { class: 'sd-card p-4 mb-3' }, [
          common.field('标题', titleInput),
          common.field('描述', descInput),
          common.field('图标 key', iconInput),
          common.field('排序值', sortInput),
          common.field('是否显示', statusToggle),
          el('div', { class: 'flex gap-2' }, [saveBtn, delBtn])
        ]));
      });

      var newBtn = el('button', { type: 'button', class: 'sd-btn-outline w-full' }, ['+ 新增细分服务']);
      newBtn.addEventListener('click', function () {
        adminApi.post('/admin/service-items', {
          body: { serviceId: service.id, title: '新细分服务', description: '', icon: 'check', sortOrder: (records || []).length, status: 1 }
        }).then(loadRows).catch(function () {});
      });
      bodyWrap.appendChild(newBtn);
    }

    function loadRows() {
      bodyWrap.textContent = '';
      bodyWrap.appendChild(el('p', { class: 'text-sm text-inkWeak', text: '加载中…' }));
      adminApi.get('/admin/services/' + service.id + '/items')
        .then(renderRows)
        .catch(function (err) {
          console.warn('[sdtech] service items 加载失败：', err && err.message);
          bodyWrap.textContent = '';
          bodyWrap.appendChild(el('p', { class: 'text-sm text-inkWeak', text: '加载失败，请稍后刷新' }));
        });
    }
    loadRows();
    return dialog;
  }

  /* ------------------------------------------------------------------ *
   * 交付物管理
   * ------------------------------------------------------------------ */
  function openDeliverables(service) {
    var bodyWrap = el('div', {});
    common.drawer({ title: '交付物 · ' + (service.name || ''), bodyEl: bodyWrap, width: 'max-w-[640px]' });

    function loadRows() {
      bodyWrap.textContent = '';
      bodyWrap.appendChild(el('p', { class: 'text-sm text-inkWeak', text: '加载中…' }));
      adminApi.get('/admin/services/' + service.id + '/deliverables')
        .then(function (records) {
          bodyWrap.textContent = '';
          (records || []).forEach(function (row, index) {
            var contentInput = common.textarea({ value: row.content, placeholder: '交付物内容' });
            var iconInput = common.input({ value: row.icon || 'check', placeholder: '图标 key' });
            var saveBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-4 !py-1.5', text: '保存' });
            var delBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-4 !py-1.5', text: '删除' });
            saveBtn.addEventListener('click', function () {
              adminApi.put('/admin/deliverables/' + row.id, {
                body: { serviceId: service.id, content: contentInput.value.trim(), icon: iconInput.value.trim() || 'check', sortOrder: index }
              }).catch(function () {});
            });
            delBtn.addEventListener('click', function () {
              common.confirm('删除交付物', '确认删除该交付物？').then(function (yes) {
                if (!yes) return;
                adminApi.del('/admin/deliverables/' + row.id).then(loadRows).catch(function () {});
              });
            });
            bodyWrap.appendChild(el('div', { class: 'sd-card p-4 mb-3' }, [
              common.field('交付物内容', contentInput),
              common.field('图标 key', iconInput),
              el('div', { class: 'flex gap-2' }, [saveBtn, delBtn])
            ]));
          });
          var newBtn = el('button', { type: 'button', class: 'sd-btn-outline w-full' }, ['+ 新增交付物']);
          newBtn.addEventListener('click', function () {
            adminApi.post('/admin/deliverables', {
              body: { serviceId: service.id, content: '新交付物', icon: 'check', sortOrder: (records || []).length }
            }).then(loadRows).catch(function () {});
          });
          bodyWrap.appendChild(newBtn);
        })
        .catch(function (err) {
          console.warn('[sdtech] deliverables 加载失败：', err && err.message);
          bodyWrap.textContent = '';
          bodyWrap.appendChild(el('p', { class: 'text-sm text-inkWeak', text: '加载失败，请稍后刷新' }));
        });
    }
    loadRows();
  }

  /* ------------------------------------------------------------------ *
   * 入口
   * ------------------------------------------------------------------ */
  function boot() {
    var box = common.mountShell('services');
    box.textContent = '';
    box.appendChild(el('div', { class: 'mb-6 flex flex-wrap items-end justify-between gap-3' }, [
      el('div', {}, [
        el('h1', { class: 'text-[20px] font-semibold text-ink', text: '业务管理' }),
        el('p', { class: 'mt-1 text-sm text-inkMid', text: '维护官网八大业务、细分服务与交付物' })
      ]),
      (function () {
        var btn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2' }, ['+ 新增业务']);
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
