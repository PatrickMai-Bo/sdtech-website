/**
 * cases.js（后台）— 案例管理
 *
 * 接口：GET /admin/cases（分页+分类+精选）、POST /admin/cases、
 *      GET /admin/cases/{id}、PUT /admin/cases/{id}、DELETE /admin/cases/{id}、
 *      PATCH /admin/cases/{id}/featured、POST /admin/cases/{id}/images、
 *      DELETE /admin/case-images/{id}、POST /admin/upload
 *
 * 交互：列表筛选（分类/精选/关键词）→ 抽屉新增/编辑（含多图上传与排序、
 *      指定封面、精选开关）→ 删除二次确认。
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var adminApi = window.adminApi;
  var common = window.common;
  var el = ui.el;

  var PAGE_SIZE = 10;
  var state = { page: 1, category: '', featured: '', keyword: '' };
  var categories = [];
  var listBox = null;
  var pagerBox = null;

  /* ---------------- 筛选栏 ---------------- */
  function buildFilters() {
    var categorySelect = common.select([{ value: '', label: '全部分类' }], '');
    var keywordInput = common.input({ placeholder: '按标题搜索' });
    var featuredSelect = common.select([
      { value: '', label: '全部' },
      { value: '1', label: '仅精选' },
      { value: '0', label: '非精选' }
    ], '');
    var searchBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '查询' });

    function apply() {
      state.category = categorySelect.value;
      state.featured = featuredSelect.value;
      state.keyword = keywordInput.value.trim();
      state.page = 1;
      loadList();
    }
    searchBtn.addEventListener('click', apply);
    keywordInput.addEventListener('keydown', function (event) { if (event.key === 'Enter') apply(); });
    categorySelect.addEventListener('change', apply);
    featuredSelect.addEventListener('change', apply);

    // 分类选项来自公开接口
    window.api.get('/public/cases/categories')
      .then(function (list) {
        categories = list || [];
        categorySelect.textContent = '';
        categorySelect.appendChild(el('option', { value: '', text: '全部分类' }));
        categories.forEach(function (cat) {
          categorySelect.appendChild(el('option', { value: cat.code || '', text: cat.name || cat.code || '' }));
        });
        categorySelect.value = state.category;
      })
      .catch(function () { /* 保留“全部分类”即可 */ });

    return el('div', { class: 'sd-card p-4 mb-4 grid gap-3 md:grid-cols-[180px_180px_1fr_auto]' }, [
      categorySelect, featuredSelect, keywordInput, searchBtn
    ]);
  }

  /* ---------------- 列表 ---------------- */
  function loadList() {
    listBox.textContent = '';
    listBox.appendChild(el('div', { class: 'p-8 text-center text-sm text-inkWeak', text: '加载中…' }));
    adminApi.get('/admin/cases', {
      params: {
        page: state.page,
        size: PAGE_SIZE,
        category: state.category || '',
        featured: state.featured || '',
        keyword: state.keyword || ''
      }
    })
      .then(function (page) {
        renderList(page || {});
        renderPager(page || {});
      })
      .catch(function (err) {
        console.warn('[sdtech] admin cases 加载失败：', err && err.message);
        listBox.textContent = '';
        listBox.appendChild(el('div', { class: 'p-8 text-center text-sm text-inkWeak', text: '案例列表加载失败，请稍后刷新' }));
        pagerBox.textContent = '';
      });
  }

  function renderList(page) {
    listBox.textContent = '';
    var records = page.records || [];
    if (!records.length) {
      listBox.appendChild(el('div', { class: 'p-10 text-center text-sm text-inkWeak', text: '暂无案例' }));
      return;
    }
    var table = el('table', { class: 'sd-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { text: '封面' }),
          el('th', { text: '标题' }),
          el('th', { text: '分类' }),
          el('th', { text: '精选' }),
          el('th', { text: '排序' }),
          el('th', { text: '状态' }),
          el('th', { text: '操作' })
        ])
      ])
    ]);
    var tbody = el('tbody', {});
    records.forEach(function (item) {
      var featuredToggle = common.toggle({
        value: item.isFeatured === 1,
        onChange: function (on) {
          adminApi.patch('/admin/cases/' + item.id + '/featured', { body: { isFeatured: on ? 1 : 0 } })
            .catch(function () { loadList(); });
        }
      });
      var ops = el('div', { class: 'flex flex-wrap gap-2' }, [
        (function () {
          var btn = el('button', { type: 'button', class: 'px-2 py-1 rounded-ctl border border-line text-xs text-inkMid hover:border-primary hover:text-primary transition-colors duration-200', text: '编辑' });
          btn.addEventListener('click', function () { openEdit(item.id); });
          return btn;
        })(),
        (function () {
          var btn = el('button', { type: 'button', class: 'px-2 py-1 rounded-ctl border border-line text-xs text-inkMid hover:border-inkMid transition-colors duration-200', text: '删除' });
          btn.addEventListener('click', function () { removeCase(item); });
          return btn;
        })()
      ]);
      tbody.appendChild(el('tr', {}, [
        el('td', {}, [ui.img(item.coverImage, item.title, 120, 90, 'h-[54px] w-[72px] rounded-ctl object-cover')]),
        el('td', {}, [el('span', { class: 'text-ink font-medium', text: item.title || '' })]),
        el('td', { text: categoryName(item.category) }),
        el('td', {}, [featuredToggle]),
        el('td', { text: String(item.sortOrder === undefined ? 0 : item.sortOrder) }),
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

  function categoryName(code) {
    var found = categories.filter(function (cat) { return cat.code === code; })[0];
    return found ? (found.name || code) : (code || '—');
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
      if (!disabled) {
        btn.addEventListener('click', function () { state.page = target; loadList(); });
      }
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

  function removeCase(item) {
    common.confirm('删除案例', '确认删除「' + (item.title || '') + '」？删除后可在数据库中恢复，但前台不再展示。')
      .then(function (yes) {
        if (!yes) return;
        adminApi.del('/admin/cases/' + item.id).then(loadList).catch(function () {});
      });
  }

  /* ---------------- 编辑抽屉 ---------------- */
  function openEdit(id) {
    var body = el('div', {});
    body.appendChild(el('p', { class: 'text-sm text-inkWeak', text: '加载中…' }));
    var saveBtn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '保存' });
    var cancelBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-5 !py-2', text: '取消' });
    var dialog = common.drawer({
      title: id ? '编辑案例' : '新增案例',
      bodyEl: body,
      footerEl: el('div', { class: 'flex gap-3' }, [cancelBtn, saveBtn]),
      width: 'max-w-[720px]'
    });
    cancelBtn.addEventListener('click', dialog.close);

    var request = id
      ? adminApi.get('/admin/cases/' + id)
      : Promise.resolve({
        id: null, title: '', category: '', coverImage: '', summary: '',
        techOrMethod: '', deliverResult: '', isFeatured: 0, sortOrder: 0, status: 1, images: []
      });

    request
      .then(function (detail) { buildForm(detail, body, saveBtn, dialog); })
      .catch(function (err) {
        console.warn('[sdtech] case detail 加载失败：', err && err.message);
        body.textContent = '';
        body.appendChild(el('p', { class: 'text-sm text-inkWeak', text: '加载失败，请稍后刷新' }));
      });
  }

  function buildForm(detail, body, saveBtn, dialog) {
    var images = (detail.images || []).map(function (image) {
      return { id: image.id || null, imageUrl: image.imageUrl || '', altText: image.altText || '', sortOrder: image.sortOrder || 0, isCover: image.isCover || 0 };
    });

    var titleInput = common.input({ value: detail.title, placeholder: '案例标题' });
    var categorySelect = common.select([
      { value: 'web', label: '网页开发' },
      { value: 'design', label: '美工设计' },
      { value: 'video', label: '视频剪辑' },
      { value: 'office', label: '办公定制' }
    ], detail.category || 'web');
    var summaryInput = common.textarea({ value: detail.summary, placeholder: '项目简介' });
    var techInput = common.textarea({ value: detail.techOrMethod, placeholder: '技术 / 制作方式' });
    var resultInput = common.textarea({ value: detail.deliverResult, placeholder: '交付成果' });
    var sortInput = common.input({ type: 'number', value: detail.sortOrder === undefined ? 0 : detail.sortOrder });
    var statusToggle = common.toggle({ value: detail.status === 1 });
    var featuredToggle = common.toggle({ value: detail.isFeatured === 1 });

    // ---- 图集 ----
    var gallery = el('div', { class: 'flex flex-wrap gap-3' });
    function renderGallery() {
      gallery.textContent = '';
      images.forEach(function (image, index) {
        var isCover = image.isCover === 1;
        var card = el('div', { class: 'sd-image-item' + (isCover ? ' is-cover' : '') }, [
          ui.img(image.imageUrl, image.altText || '', 224, 168, 'h-[84px] w-full object-cover'),
          el('div', { class: 'p-2 flex flex-col gap-1' }, [
            el('div', { class: 'flex gap-1' }, [
              (function () {
                var btn = el('button', { type: 'button', class: 'text-[11px] px-1.5 py-0.5 rounded border border-line text-inkWeak hover:text-primary hover:border-primary transition-colors duration-200', text: '↑' });
                btn.addEventListener('click', function () {
                  if (index === 0) return;
                  var tmp = images[index]; images[index] = images[index - 1]; images[index - 1] = tmp;
                  renumber(); renderGallery();
                });
                return btn;
              })(),
              (function () {
                var btn = el('button', { type: 'button', class: 'text-[11px] px-1.5 py-0.5 rounded border border-line text-inkWeak hover:text-primary hover:border-primary transition-colors duration-200', text: '↓' });
                btn.addEventListener('click', function () {
                  if (index === images.length - 1) return;
                  var tmp = images[index]; images[index] = images[index + 1]; images[index + 1] = tmp;
                  renumber(); renderGallery();
                });
                return btn;
              })(),
              (function () {
                var btn = el('button', { type: 'button', class: 'text-[11px] px-1.5 py-0.5 rounded border border-line text-inkWeak hover:text-primary hover:border-primary transition-colors duration-200', text: isCover ? '封面' : '设封面' });
                btn.addEventListener('click', function () {
                  images.forEach(function (one) { one.isCover = 0; });
                  image.isCover = 1;
                  renderGallery();
                });
                return btn;
              })(),
              (function () {
                var btn = el('button', { type: 'button', class: 'text-[11px] px-1.5 py-0.5 rounded border border-line text-inkWeak hover:border-inkMid transition-colors duration-200', text: '删' });
                btn.addEventListener('click', function () {
                  common.confirm('删除图片', '确认移除这张图片？').then(function (yes) {
                    if (!yes) return;
                    if (image.id) {
                      adminApi.del('/admin/case-images/' + image.id).catch(function () {});
                    }
                    images.splice(index, 1);
                    renumber();
                    renderGallery();
                  });
                });
                return btn;
              })()
            ])
          ])
        ]);
        gallery.appendChild(card);
      });
      if (!images.length) {
        gallery.appendChild(el('p', { class: 'text-xs text-inkWeak', text: '暂无图片，点击右侧上传' }));
      }
    }
    function renumber() {
      images.forEach(function (image, index) { image.sortOrder = index; });
    }

    var uploadBtn = el('button', { type: 'button', class: 'sd-btn-outline !px-4 !py-1.5' }, ['+ 上传图片']);
    uploadBtn.addEventListener('click', function () {
      common.pickUpload({}).then(function (url) {
        if (!url) return;
        images.push({ id: null, imageUrl: url, altText: '', sortOrder: images.length, isCover: images.length === 0 ? 1 : 0 });
        renumber();
        renderGallery();
      });
    });

    var coverField = common.imageField({ value: detail.coverImage || '' });

    body.textContent = '';
    body.appendChild(common.field('案例标题', titleInput, { required: true }));
    body.appendChild(common.field('分类', categorySelect, { required: true }));
    body.appendChild(common.field('封面图', coverField.node, { hint: '也可在下方图集中点「设封面」自动填充' }));
    body.appendChild(common.field('项目简介', summaryInput));
    body.appendChild(common.field('技术 / 制作方式', techInput));
    body.appendChild(common.field('交付成果', resultInput));
    body.appendChild(common.field('排序值', sortInput, { hint: '数字越小越靠前' }));
    body.appendChild(common.field('是否显示', statusToggle));
    body.appendChild(common.field('设为精选', featuredToggle));
    body.appendChild(el('div', { class: 'sd-field' }, [
      el('label', { class: 'sd-label', text: '项目图集' }),
      el('div', { class: 'flex items-start gap-3' }, [gallery, uploadBtn])
    ]));
    renderGallery();

    saveBtn.addEventListener('click', function () {
      var cover = coverField.getValue();
      var coverImage = images.filter(function (image) { return image.isCover === 1; })[0];
      var payload = {
        title: titleInput.value.trim(),
        category: categorySelect.value,
        coverImage: cover || (coverImage ? coverImage.imageUrl : ''),
        summary: summaryInput.value,
        techOrMethod: techInput.value,
        deliverResult: resultInput.value,
        isFeatured: common.toggleValue(featuredToggle),
        sortOrder: parseInt(sortInput.value, 10) || 0,
        status: common.toggleValue(statusToggle),
        images: images.map(function (image) {
          return { imageUrl: image.imageUrl, altText: image.altText || '', sortOrder: image.sortOrder, isCover: image.isCover };
        })
      };
      if (!payload.title) { ui.toast('请填写案例标题', 'error'); return; }
      saveBtn.disabled = true;
      var request = detail.id
        ? adminApi.put('/admin/cases/' + detail.id, { body: payload })
        : adminApi.post('/admin/cases', { body: payload });
      request
        .then(function () { dialog.close(); loadList(); })
        .catch(function () { saveBtn.disabled = false; });
    });
  }

  /* ---------------- 入口 ---------------- */
  function boot() {
    var box = common.mountShell('cases');
    box.textContent = '';
    box.appendChild(el('div', { class: 'mb-6 flex flex-wrap items-end justify-between gap-3' }, [
      el('div', {}, [
        el('h1', { class: 'text-[20px] font-semibold text-ink', text: '案例管理' }),
        el('p', { class: 'mt-1 text-sm text-inkMid', text: '维护案例项目、图集与精选状态' })
      ]),
      (function () {
        var btn = el('button', { type: 'button', class: 'sd-btn-primary !px-5 !py-2', text: '+ 新增案例' });
        btn.addEventListener('click', function () { openEdit(null); });
        return btn;
      })()
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
