/**
 * home.js — 首页内容管理（site_content 分组编辑）
 *
 * 数据：GET  /api/admin/site/content           原始 KV（全量）
 *      PUT  /api/admin/site/content           按组整组替换
 *
 * 交互：
 *   - 按 content_group 分组折叠（global / nav / hero / banner / advantage /
 *     process / faq / cta / footer / contact / pricing_terms）
 *   - text 字段用 input / textarea，image 字段支持「上传图片」与「粘贴 URL」
 *   - 每组独立保存：只回传该组，但回传该组**完整**条目（整组替换语义）
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var common = window.common;
  var el = ui.el;

  /** 期望的分组顺序（未出现的分组追加在末尾） */
  var GROUP_ORDER = ['global', 'nav', 'hero', 'banner', 'advantage', 'process', 'faq', 'cta', 'footer', 'contact', 'pricing_terms'];

  /** 分组中文名（仅后台展示用） */
  var GROUP_LABEL = {
    global: '全站信息',
    nav: '顶部导航',
    hero: '首页主视觉',
    banner: '各页横幅',
    advantage: '核心优势',
    process: '合作流程',
    faq: '常见问题',
    cta: '底部咨询区',
    footer: '页脚',
    contact: '联系我们',
    pricing_terms: '项目约定'
  };

  /** 判断该字段是否适合多行文本域 */
  function isLongText(item) {
    var key = (item.key || '').toLowerCase();
    var value = item.value || '';
    if (value.length > 60) return true;
    return key.indexOf('desc') > -1 || key.indexOf('answer') > -1 ||
      key.indexOf('intro') > -1 || key.indexOf('summary') > -1 ||
      key.indexOf('description') > -1 || key.indexOf('note') > -1;
  }

  /** 构建单个字段控件 */
  function buildControl(item) {
    if (item.valueType === 'image') {
      var imageCtl = common.imageField({ value: item.imageUrl || item.value || '' });
      return {
        node: imageCtl.node,
        read: function () {
          var url = imageCtl.getValue();
          return { value: url, imageUrl: url };
        }
      };
    }
    if (item.valueType === 'switch') {
      var toggleNode = common.toggle({ value: item.value === '1' || item.value === 1 || item.value === true });
      return {
        node: toggleNode,
        read: function () { return { value: String(common.toggleValue(toggleNode)), imageUrl: item.imageUrl || '' }; }
      };
    }
    if (item.valueType === 'url') {
      var urlInput = common.input({ value: item.value || '', placeholder: '如 /cases.html 或 https://…' });
      return { node: urlInput, read: function () { return { value: urlInput.value.trim(), imageUrl: item.imageUrl || '' }; } };
    }
    // text
    var node = isLongText(item) ? common.textarea({ value: item.value || '' }) : common.input({ value: item.value || '' });
    return { node: node, read: function () { return { value: node.value, imageUrl: item.imageUrl || '' }; } };
  }

  /** 构建一个分组的折叠面板 */
  function buildGroup(groupName, items) {
    var fields = [];
    var body = el('div', { class: 'sd-group-body px-6 pb-6' });

    items.forEach(function (item, index) {
      var control = buildControl(item);
      fields.push({ raw: item, control: control });
      body.appendChild(el('div', { class: 'grid gap-4 md:grid-cols-2 border-b border-line/70 py-4 last:border-b-0' }, [
        el('div', { class: 'md:col-span-1' }, [
          el('p', { class: 'text-sm font-medium text-ink', text: item.label || item.key || ('字段 ' + (index + 1)) }),
          el('p', { class: 'mt-1 text-xs text-inkWeak', text: item.group + '.' + item.key })
        ]),
        el('div', { class: 'md:col-span-1' }, [control.node])
      ]));
    });

    var saveBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2' }, ['保存本组']);
    var tipNode = el('span', { class: 'text-xs text-inkWeak' });
    var header = el('button', {
      type: 'button',
      class: 'w-full flex items-center justify-between gap-3 px-6 py-4 text-left'
    }, [
      el('span', { class: 'flex items-center gap-2' }, [
        el('span', { class: 'sd-group-arrow text-inkWeak', html: ui.ICONS.chevronDown }),
        el('span', { class: 'text-[15px] font-medium text-ink', text: GROUP_LABEL[groupName] || groupName }),
        el('span', { class: 'text-xs text-inkWeak', text: '共 ' + items.length + ' 项' })
      ]),
      el('span', { class: 'text-xs text-inkWeak', text: groupName })
    ]);

    var card = el('section', { class: 'sd-group sd-card overflow-hidden mb-4' }, [header, body]);

    header.addEventListener('click', function () {
      var open = card.classList.toggle('is-open');
      body.classList.toggle('is-open', open);
    });

    saveBtn.addEventListener('click', function () {
      var payloadItems = fields.map(function (entry) {
        var read = entry.control.read();
        return {
          key: entry.raw.key,
          value: read.value,
          imageUrl: read.imageUrl || '',
          valueType: entry.raw.valueType || 'text',
          label: entry.raw.label || entry.raw.key
        };
      });
      saveBtn.disabled = true;
      tipNode.textContent = '保存中…';
      adminApi.put('/admin/site/content', {
        body: [{ group: groupName, items: payloadItems }]
      })
        .then(function (data) {
          var updated = (data && data.updated) || payloadItems.length;
          tipNode.textContent = '已保存 ' + updated + ' 项';
        })
        .catch(function () {
          tipNode.textContent = '保存失败，请重试';
        })
        .then(function () {
          saveBtn.disabled = false;
          setTimeout(function () { tipNode.textContent = ''; }, 3000);
        });
    });

    body.appendChild(el('div', { class: 'flex items-center gap-3 pt-5' }, [saveBtn, tipNode]));
    return card;
  }

  /** 渲染整页 */
  function render(list) {
    var box = common.content();
    box.textContent = '';
    box.appendChild(el('div', { class: 'mb-6 flex flex-wrap items-end justify-between gap-3' }, [
      el('div', {}, [
        el('h1', { class: 'text-[20px] font-semibold text-ink', text: '首页内容' }),
        el('p', { class: 'mt-1 text-sm text-inkMid', text: '按分组编辑全站文案与图片，保存后前台刷新即生效' })
      ])
    ]));

    var map = {};
    var order = [];
    (list || []).forEach(function (item) {
      if (!item || !item.group) return;
      if (!map[item.group]) { map[item.group] = []; order.push(item.group); }
      map[item.group].push(item);
    });
    // 排序：已知分组按 GROUP_ORDER，其余追加
    order.sort(function (a, b) {
      var ia = GROUP_ORDER.indexOf(a);
      var ib = GROUP_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    if (!order.length) {
      box.appendChild(el('div', { class: 'sd-card p-10 text-center text-sm text-inkWeak', text: '暂无可编辑内容' }));
      return;
    }

    order.forEach(function (groupName) {
      var items = map[groupName].slice().sort(function (a, b) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
      box.appendChild(buildGroup(groupName, items));
    });

    // 默认展开第一个分组
    var first = box.querySelector('.sd-group');
    if (first) {
      first.classList.add('is-open');
      first.querySelector('.sd-group-body').classList.add('is-open');
    }
  }

  function boot() {
    common.mountShell('home');
    var box = common.content();
    box.appendChild(ui.skeleton(3, 'grid-cols-1'));
    adminApi.get('/admin/site/content')
      .then(render)
      .catch(function (err) {
        console.warn('[sdtech] site/content 加载失败：', err && err.message);
        box.textContent = '';
        box.appendChild(el('div', { class: 'sd-card p-10 text-center text-sm text-inkWeak', text: '内容加载失败，请稍后刷新' }));
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
