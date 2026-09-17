/**
 * layout.js — 前台公共布局层（挂载到 window.Layout）
 *
 * 职责：从 GET /api/public/site/content 取全站 KV，渲染
 *   - #site-header：顶部导航（8 项，当前页高亮，移动端汉堡抽屉）
 *   - #site-footer：页脚（简介 / 导航 / 联系方式 / 店铺入口 / 备案 / 版权）
 *   - #site-cta  ：底部咨询 CTA
 *
 * 兜底：接口失败时注入纯结构兜底导航（不白屏），页脚显示失败提示，CTA 隐藏。
 * 所有接口字符串一律经 ui.esc / textContent 入 DOM。
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

  /** 站点内容 Map：'group.key' -> item */
  var contentMap = new Map();
  var loadPromise = null;
  var loadOk = false;

  /** 导航纯结构兜底（接口失败时使用；属导航结构而非业务文案） */
  var FALLBACK_NAV = [
    { title: '首页', url: '/index.html' },
    { title: '网页开发', url: '/web.html' },
    { title: '美工设计', url: '/design.html' },
    { title: '视频剪辑', url: '/video.html' },
    { title: '办公定制', url: '/office.html' },
    { title: '案例作品', url: '/cases.html' },
    { title: '合作报价', url: '/pricing.html' },
    { title: '联系我们', url: '/contact.html' }
  ];

  /**
   * 加载全站 KV（全局只请求一次，页面 JS 可复用）
   * @returns {Promise<boolean>} 是否加载成功
   */
  function ready() {
    if (loadPromise) return loadPromise;
    loadPromise = api.get('/public/site/content')
      .then(function (list) {
        contentMap = new Map();
        (list || []).forEach(function (item) {
          if (!item || !item.group || !item.key) return;
          contentMap.set(item.group + '.' + item.key, item);
        });
        loadOk = true;
        return true;
      })
      .catch(function (err) {
        console.warn('[sdtech] site/content 加载失败：', err && err.message);
        loadOk = false;
        return false;
      });
    return loadPromise;
  }

  /** 取文本值；缺失时返回 fallback */
  function txt(group, key, fallback) {
    var item = contentMap.get(group + '.' + key);
    if (!item) return fallback === undefined ? '' : fallback;
    var value = item.value;
    if (value === null || value === undefined || String(value).trim() === '') {
      return fallback === undefined ? '' : fallback;
    }
    return String(value);
  }

  /** 取图片 URL（优先 imageUrl，其次把 value 当 URL） */
  function image(group, key, fallback) {
    var item = contentMap.get(group + '.' + key);
    if (!item) return fallback || '';
    return item.imageUrl || item.value || fallback || '';
  }

  /** 取同构列表：group=nav/advantage/process/faq/… 的 "序号.字段" */
  function listOf(group, fields) {
    var result = [];
    var maxSeq = 0;
    contentMap.forEach(function (item, mapKey) {
      if (mapKey.indexOf(group + '.') !== 0) return;
      var rest = mapKey.slice(group.length + 1);
      var seq = parseInt(rest.split('.')[0], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    });
    for (var i = 1; i <= maxSeq; i++) {
      var row = { seq: i };
      var hasValue = false;
      fields.forEach(function (field) {
        row[field] = txt(group, i + '.' + field, '');
        if (row[field]) hasValue = true;
      });
      if (hasValue) result.push(row);
    }
    return result;
  }

  /** 当前路径是否命中导航项 */
  function isActive(url, active) {
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    var target = String(url || '').replace(/\/+$/, '');
    if (!target) return false;
    if (active) {
      // 页面显式声明 active（如 'index'）
      return target.indexOf('/' + active + '.html') !== -1;
    }
    if (target === '/' || target.indexOf('/index.html') !== -1) return path === '/' || path.indexOf('/index.html') !== -1;
    return path.indexOf(target) !== -1;
  }

  /* ------------------------------------------------------------------ *
   * 顶部导航
   * ------------------------------------------------------------------ */
  function buildNavItems() {
    var items = listOf('nav', ['title', 'url']);
    if (!items.length) return FALLBACK_NAV.slice();
    return items.filter(function (item) { return !!item.title && !!item.url; })
      .map(function (item) { return { title: item.title, url: item.url }; });
  }

  function renderHeader(host, active) {
    var items = buildNavItems();
    var brand = txt('global', 'company_short', txt('global', 'company_name', 'SDTech'));
    var logo = image('global', 'logo_image', '/assets/img/favicon.svg');

    // 桌面导航项
    var desktopList = el('nav', { class: 'hidden lg:flex items-center gap-1', 'aria-label': '主导航' });
    items.forEach(function (item) {
      var activeCls = isActive(item.url, active) ? ' text-primary font-medium' : ' text-inkDeep hover:text-primary';
      desktopList.appendChild(el('a', {
        href: item.url,
        class: 'px-3 py-2 text-[15px] rounded-ctl transition-colors duration-200' + activeCls
      }, [item.title]));
    });

    // 右侧咨询按钮
    var ctaBtn = el('a', {
      href: '/contact.html',
      class: 'hidden lg:inline-flex sd-btn-primary !px-5 !py-2'
    }, ['立即咨询']);

    // 汉堡按钮
    var menuBtn = el('button', {
      type: 'button',
      class: 'lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-ctl border border-line text-inkDeep',
      'aria-label': '打开菜单',
      html: ui.ICONS.menu
    });

    var headerInner = el('div', { class: 'sd-container flex items-center justify-between h-[72px]' }, [
      el('a', { href: '/index.html', class: 'flex items-center gap-3 min-w-0' }, [
        ui.img(logo, brand, 32, 32, 'h-8 w-8 rounded-icon object-cover'),
        el('span', { class: 'text-[16px] font-semibold text-ink truncate', text: brand })
      ]),
      el('div', { class: 'flex items-center gap-2' }, [desktopList, ctaBtn, menuBtn])
    ]);

    var header = el('header', {
      class: 'sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line'
    }, [headerInner]);

    // ---- 移动端抽屉 ----
    var drawerLinks = el('nav', { class: 'flex flex-col gap-1 p-4', 'aria-label': '移动导航' });
    items.forEach(function (item) {
      var activeCls = isActive(item.url, active) ? ' bg-primarySoft text-primary font-medium' : ' text-inkDeep';
      drawerLinks.appendChild(el('a', {
        href: item.url,
        class: 'px-4 py-3 rounded-ctl text-[15px] transition-colors duration-200' + activeCls
      }, [item.title]));
    });
    var drawer = el('div', {
      class: 'sd-drawer fixed top-0 right-0 z-50 h-full w-[78%] max-w-[320px] bg-white border-l border-line shadow-[0_8px_32px_rgba(31,35,40,0.12)] lg:hidden'
    }, [
      el('div', { class: 'flex items-center justify-between h-[72px] px-4 border-b border-line' }, [
        el('span', { class: 'text-sm text-inkWeak', text: '导航' }),
        el('button', {
          type: 'button', class: 'w-9 h-9 inline-flex items-center justify-center rounded-ctl border border-line text-inkWeak',
          'aria-label': '关闭菜单', html: ui.ICONS.close
        })
      ]),
      drawerLinks
    ]);
    var mask = el('div', {
      class: 'fixed inset-0 z-40 bg-ink/40 hidden lg:hidden'
    });

    function openDrawer() {
      drawer.classList.add('is-open');
      mask.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('is-open');
      mask.classList.add('hidden');
      document.body.style.overflow = '';
    }
    menuBtn.addEventListener('click', openDrawer);
    drawer.querySelector('button').addEventListener('click', closeDrawer);
    mask.addEventListener('click', closeDrawer);

    host.textContent = '';
    host.appendChild(header);
    host.appendChild(mask);
    host.appendChild(drawer);
  }

  /* ------------------------------------------------------------------ *
   * 页脚
   * ------------------------------------------------------------------ */
  function renderFooter(host, navItems, ok) {
    var intro = txt('footer', 'company_intro', '');
    var companyName = txt('global', 'company_name', '');
    var copyright = txt('global', 'copyright', '');
    var icp = txt('global', 'icp', '');
    var phone = txt('global', 'phone', '待补充');
    var email = txt('global', 'email', '待补充');
    var address = txt('global', 'address', '待补充');

    var contactBox = el('div', { class: 'flex flex-col gap-2 text-sm text-inkMid' }, [
      el('div', { class: 'flex items-center gap-2' }, [
        el('span', { class: 'text-inkWeak', html: ui.ICONS.phone }),
        el('span', { text: phone })
      ]),
      el('div', { class: 'flex items-center gap-2' }, [
        el('span', { class: 'text-inkWeak', html: ui.ICONS.mail }),
        el('span', { text: email })
      ]),
      el('div', { class: 'flex items-center gap-2' }, [
        el('span', { class: 'text-inkWeak', html: ui.ICONS.info }),
        el('span', { text: address })
      ])
    ]);

    var navBox = el('nav', { class: 'grid grid-cols-2 gap-2', 'aria-label': '页脚导航' });
    navItems.forEach(function (item) {
      navBox.appendChild(el('a', {
        href: item.url,
        class: 'text-sm text-inkMid hover:text-primary transition-colors duration-200',
        text: item.title
      }));
    });

    var shopBox = el('div', { class: 'flex flex-wrap gap-3' });
    api.get('/public/shop-links', { params: { zone: 'footer' } })
      .then(function (list) {
        (list || []).forEach(function (shop) {
          if (!shop) return;
          var url = shop.linkUrl || '';
          if ((!url || url === '#') && !shop.qrcodeImage) return; // 不死链
          if (!url || url === '#') {
            shopBox.appendChild(el('span', { class: 'inline-flex items-center gap-2 text-sm text-inkMid' }, [
              el('span', { class: 'text-inkWeak', html: ui.icon(shop.icon) }),
              el('span', { text: shop.title || '' })
            ]));
            return;
          }
          shopBox.appendChild(el('a', {
            href: url, target: '_blank', rel: 'noopener noreferrer',
            class: 'inline-flex items-center gap-2 text-sm text-inkMid hover:text-primary transition-colors duration-200'
          }, [
            el('span', { class: 'text-inkWeak', html: ui.icon(shop.icon) }),
            el('span', { text: shop.title || '' })
          ]));
        });
        if (!shopBox.childNodes.length) {
          shopBox.appendChild(el('span', { class: 'text-sm text-inkWeak', text: '店铺入口待补充' }));
        }
      })
      .catch(function () {
        shopBox.appendChild(el('span', { class: 'text-sm text-inkWeak', text: '店铺入口暂时无法显示，请稍后刷新' }));
      });

    var bottom = el('div', { class: 'mt-10 pt-6 border-t border-line flex flex-col md:flex-row md:items-center md:justify-between gap-2' }, [
      el('p', { class: 'text-xs text-inkWeak', text: copyright || companyName }),
      el('p', { class: 'text-xs text-inkWeak', text: icp })
    ]);

    var inner = el('div', { class: 'sd-container py-12' }, [
      el('div', { class: 'grid gap-8 md:grid-cols-2 lg:grid-cols-4' }, [
        el('div', { class: 'lg:col-span-2' }, [
          el('p', { class: 'text-base font-semibold text-ink mb-3', text: companyName }),
          el('p', { class: 'text-sm text-inkMid pre-wrap max-w-[520px]', text: intro || (ok ? '' : '内容加载失败，请稍后刷新') })
        ]),
        el('div', {}, [
          el('p', { class: 'text-sm font-medium text-ink mb-3', text: '快速导航' }),
          navBox
        ]),
        el('div', {}, [
          el('p', { class: 'text-sm font-medium text-ink mb-3', text: '联系我们' }),
          contactBox,
          el('div', { class: 'mt-4' }, [
            el('p', { class: 'text-sm font-medium text-ink mb-3', text: '店铺入口' }),
            shopBox
          ])
        ])
      ]),
      bottom
    ]);

    host.textContent = '';
    host.appendChild(el('footer', { class: 'bg-surfaceSoft border-t border-line' }, [inner]));
  }

  /* ------------------------------------------------------------------ *
   * 底部 CTA
   * ------------------------------------------------------------------ */
  function renderCta(host) {
    var title = txt('cta', 'title', '');
    var desc = txt('cta', 'description', '');
    var btnText = txt('cta', 'button_text', '');
    var btnLink = txt('cta', 'button_link', '/contact.html');
    var bg = image('cta', 'background_image', '');
    if (!title && !desc && !btnText) { host.textContent = ''; return; }

    var inner = el('div', { class: 'sd-container py-14' }, [
      el('div', {
        class: 'relative overflow-hidden rounded-card bg-primarySoft border border-line px-8 py-12 md:px-16 md:py-16'
      }, [
        bg ? ui.img(bg, '', 1600, 600, 'absolute inset-0 h-full w-full object-cover opacity-10') : null,
        el('div', { class: 'relative flex flex-col md:flex-row md:items-center md:justify-between gap-6' }, [
          el('div', {}, [
            el('h2', { class: 'text-2xl md:text-[28px] font-semibold text-ink', text: title }),
            el('p', { class: 'mt-3 text-[15px] text-inkMid pre-wrap max-w-[560px]', text: desc })
          ]),
          btnText ? el('a', { href: btnLink || '/contact.html', class: 'sd-btn-primary shrink-0' }, [
            btnText,
            el('span', { class: 'ml-1', html: ui.ICONS.arrowRight })
          ]) : null
        ])
      ])
    ]);
    host.textContent = '';
    host.appendChild(inner);
  }

  /* ------------------------------------------------------------------ *
   * mount：每页 body 末尾调用一次
   * ------------------------------------------------------------------ */
  async function mount(options) {
    var opts = options || {};
    var navHost = document.getElementById('site-header');
    var footerHost = document.getElementById('site-footer');
    var ctaHost = document.getElementById('site-cta');

    if (navHost) navHost.appendChild(el('div', { class: 'h-[72px]' })); // 占位防跳动
    var ok = await ready();
    var navItems = buildNavItems();

    if (navHost) renderHeader(navHost, opts.active);
    if (footerHost) renderFooter(footerHost, navItems.length ? navItems : FALLBACK_NAV, ok);
    if (ctaHost && ok) renderCta(ctaHost);
    return ok;
  }

  window.Layout = {
    mount: mount,
    ready: ready,
    txt: txt,
    image: image,
    listOf: listOf,
    isOk: function () { return loadOk; }
  };
})(window, document);
