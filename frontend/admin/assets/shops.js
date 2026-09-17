/**
 * shops.js（后台）— 店铺链接管理
 *
 * 接口：GET /admin/shop-links、POST /admin/shop-links、PUT /admin/shop-links/{id}、DELETE /admin/shop-links/{id}
 * 字段：platform、title、linkUrl、icon、qrcodeImage、showZone（逗号分隔）、sortOrder、status
 * 规则：linkUrl 为空或 '#' 且无二维码时，前台隐藏该入口（不死链）
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var common = window.common;
  var el = ui.el;

  var listBox = null;
  var ZONES = [
    { value: 'home', label: '首页' },
    { value: 'footer', label: '页脚' },
    { value: 'contact', label: '联系页' },
    { value: 'cta', label: '咨询区' }
  ];

  function platformLabel(code) {
    var map = { wechat: '微信', xianyu: '闲鱼', taobao: '淘宝', pdd: '拼多多', other: '其他' };
    return map[code] || code || '—';
  }

  function renderList(records) {
    listBox.textContent = '';
    if (!records.length) {
      listBox.appendChild(el('div', { class: 'p-10 text-center text-sm text-inkWeak', text: '暂无店铺链接，点击右上角新增' }));
      return;
    }
    var table = el('table', { class: 'sd-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { text: '排序' }),
          el('th', { text: '平台' }),
          el('th', { text: '文案' }),
          el('th', { text: '链接' }),
          el('th', { text: '二维码' }),
          el('th', { text: '展示位置' }),
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
          btn.addEventListener('click', function () { removeShop(item); });
          return btn;
        })()
      ]);
      var link = item.linkUrl || '';
      tbody.appendChild(el('tr', {}, [
        el('td', { text: String(item.sortOrder === undefined ? 0 : item.sortOrder) }),
        el('td', { text: platformLabel(item.platform) }),
        el('td', {}, [el('span', { class: 'text-ink font-medium', text: item.title || '' })]),
        el('td', {}, [
          link && link !== '#'
            ? el('a', { href: link, target: '_blank', rel: 'noopener noreferrer', class: 'text-xs text-primary break-all', text: link })
            : el('span', { class: 'text-xs text-inkWeak', text: '未设置' })
        ]),
        el('td', {}, [item.qrcodeImage ? ui.img(item.qrcodeImage, '二维码', 80, 80, 'h-10 w-10 rounded-ctl object-cover') : el('span', { class: 'text-xs text-inkWeak', text: '—' })]),
        el('td', { text: item.showZone || '—' }),
        el('td', {}, [
          el('span', {
            class: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs ' + (item.status === 1 ? 'bg-primarySoft text-primary' : 'bg-surface text-inkWeak'),
            text: item.status === 1 ? '启用' : '停用'
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
    adminApi.get('/admin/shop-links')
      .then(function (list) { renderList(list || []); })
      .catch(function (err) {
        console.warn('[sdtech] shop-links 加载失败：', err && err.message);
        listBox.textContent = '';
        listBox.appendChild(el('div', { class: 'p-8 text-center text-sm text-inkWeak', text: '店铺链接加载失败，请稍后刷新' }));
      });
  }

  function removeShop(item) {
    common.confirm('删除店铺链接', '确认删除「' + (item.title || '') + '」？')
      .then(function (yes) {
        if (!yes) return;
        adminApi.del('/admin/shop-links/' + item.id).then(loadList).catch(function () {});
      });
  }

  function openEdit(item) {
    var isNew = !item;
    var platformSelect = common.select([
      { value: 'wechat', label: '微信' },
      { value: 'xianyu', label: '闲鱼' },
      { value: 'taobao', label: '淘宝' },
      { value: 'pdd', label: '拼多多' },
      { value: 'other', label: '其他' }
    ], item ? item.platform : 'wechat');
    var titleInput = common.input({ value: item ? item.title : '', placeholder: '展示文案' });
    var linkInput = common.input({ value: item ? item.linkUrl : '', placeholder: 'https://… 或留空' });
    var iconSelect = common.select([
      { value: 'wechat', label: 'wechat' },
      { value: 'xianyu', label: 'xianyu' },
      { value: 'taobao', label: 'taobao' },
      { value: 'pdd', label: 'pdd' },
      { value: 'shop', label: 'shop' }
    ], item && item.icon ? item.icon : 'shop');
    var qrField = common.imageField({ value: item ? item.qrcodeImage : '' });
    var sortInput = common.input({ type: 'number', value: item && item.sortOrder !== undefined ? item.sortOrder : 0 });
    var statusToggle = common.toggle({ value: item ? item.status === 1 : true });

    // 展示位置多选
    var selected = (item && item.showZone ? item.showZone.split(',') : []).map(function (zone) { return zone.trim(); });
    var zoneBox = el('div', { class: 'flex flex-wrap gap-3' });
    ZONES.forEach(function (zone) {
      var isChecked = selected.indexOf(zone.value) > -1;
      var box = el('input', { type: 'checkbox', class: 'mr-1' });
      if (isChecked) box.checked = true;
      zoneBox.appendChild(el('label', { class: 'inline-flex items-center text-sm text-inkMid' }, [box, zone.label]));
    });

    var body = el('div', {}, [
      common.field('平台', platformSelect, { required: true }),
      common.field('展示文案', titleInput, { required: true }),
      common.field('链接地址', linkInput, { hint: '留空或 # 且无二维码时，前台自动隐藏该入口' }),
      common.field('图标', iconSelect),
      common.field('二维码', qrField.node),
      common.field('展示位置', zoneBox),
      common.field('排序值', sortInput),
      common.field('是否启用', statusToggle)
    ]);

    var saveBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '保存' });
    var cancelBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-5 !py-2', text: '取消' });
    var dialog = common.drawer({
      title: isNew ? '新增店铺链接' : '编辑店铺链接',
      bodyEl: body,
      footerEl: el('div', { class: 'flex gap-3' }, [cancelBtn, saveBtn])
    });
    cancelBtn.addEventListener('click', dialog.close);

    saveBtn.addEventListener('click', function () {
      var zones = [];
      Array.prototype.forEach.call(zoneBox.querySelectorAll('input[type=checkbox]'), function (box, index) {
        if (box.checked) zones.push(ZONES[index].value);
      });
      var payload = {
        platform: platformSelect.value,
        title: titleInput.value.trim(),
        linkUrl: linkInput.value.trim(),
        icon: iconSelect.value,
        qrcodeImage: qrField.getValue(),
        showZone: zones.join(','),
        sortOrder: parseInt(sortInput.value, 10) || 0,
        status: common.toggleValue(statusToggle)
      };
      if (!payload.title) { ui.toast('请填写展示文案', 'error'); return; }
      saveBtn.disabled = true;
      var request = isNew
        ? adminApi.post('/admin/shop-links', { body: payload })
        : adminApi.put('/admin/shop-links/' + item.id, { body: payload });
      request
        .then(function () { dialog.close(); loadList(); })
        .catch(function () { saveBtn.disabled = false; });
    });
  }

  function boot() {
    var box = common.mountShell('shops');
    box.textContent = '';
    box.appendChild(el('div', { class: 'mb-6 flex flex-wrap items-end justify-between gap-3' }, [
      el('div', {}, [
        el('h1', { class: 'text-[20px] font-semibold text-ink', text: '店铺链接' }),
        el('p', { class: 'mt-1 text-sm text-inkMid', text: '维护微信、闲鱼、淘宝、拼多多等渠道入口' })
      ]),
      (function () {
        var btn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '+ 新增链接' });
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
