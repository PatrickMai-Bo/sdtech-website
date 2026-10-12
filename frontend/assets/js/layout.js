/**
 * layout.js — 前台公共布局层（挂载到 window.Layout）
 *
 * 职责：从 GET /api/public/site/content 取全站 KV，渲染
 *   - #site-header：吸顶导航（毛玻璃、滚动阴影、当前页主色 + 底部 2px 指示条、移动端抽屉）
 *   - #site-footer：深色页脚（简介 / 导航 / 联系方式 / 店铺入口 / 备案 / 版权）
 *   - #site-cta  ：深色渐变咨询 CTA（主色渐变 + 白字 + 透明白边按钮 + 几何装饰）
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

    // 桌面导航项：通栏高度，当前页主色 + 底部 2px 指示条
    var desktopList = el('nav', { class: 'hidden lg:flex lg:h-[72px] lg:items-stretch lg:gap-1', 'aria-label': '主导航' });
    items.forEach(function (item) {
      var on = isActive(item.url, active);
      var link = el('a', {
        href: item.url,
        class: 'relative flex items-center px-3 text-[15px] transition-colors duration-200 ' +
          (on ? 'font-medium text-primary' : 'text-inkDeep hover:text-primary')
      }, [item.title]);
      if (on) {
        link.appendChild(el('span', { class: 'absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary' }));
      }
      desktopList.appendChild(link);
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
      class: 'sd-header sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur'
    }, [headerInner]);

    // 滚动状态：下滑后加深底色与淡阴影
    function onScroll() {
      var scrolled = window.scrollY > 8;
      header.classList.toggle('is-scrolled', scrolled);
      header.classList.toggle('bg-white/95', scrolled);
      header.classList.toggle('bg-white/80', !scrolled);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- 移动端抽屉（毛玻璃面板） ----
    var drawerLinks = el('nav', { class: 'flex flex-col gap-1 p-4', 'aria-label': '移动导航' });
    items.forEach(function (item) {
      var on = isActive(item.url, active);
      drawerLinks.appendChild(el('a', {
        href: item.url,
        class: 'flex items-center justify-between rounded-ctl px-4 py-3 text-[15px] transition-colors duration-200 ' +
          (on ? 'bg-primarySoft font-medium text-primary' : 'text-inkDeep'),
      }, [
        el('span', { text: item.title }),
        on ? el('span', { class: 'h-5 w-0.5 rounded-full bg-primary' }) : null
      ]));
    });
    var drawer = el('div', {
      class: 'sd-drawer fixed top-0 right-0 z-50 h-full w-[78%] max-w-[320px] bg-white/90 backdrop-blur-md border-l border-line shadow-[0_8px_32px_rgba(31,35,40,0.12)] lg:hidden'
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
   * 页脚（深色四栏）
   * ------------------------------------------------------------------ */
  function renderFooter(host, navItems, ok) {
    var intro = txt('footer', 'company_intro', '');
    var companyName = txt('global', 'company_name', '');
    var copyright = txt('global', 'copyright', '');
    var icp = txt('global', 'icp', '');
    var phone = txt('global', 'phone', '待补充');
    var wechat = txt('global', 'wechat_id', '待补充');
    var address = txt('global', 'address', '待补充');

    // 第一栏：公司简介 + logo
    var brandBox = el('div', {}, [
      el('div', { class: 'flex items-center gap-3' }, [
        el('div', { class: 'flex h-10 w-10 items-center justify-center rounded-icon bg-white/10' }, [
          ui.img(image('global', 'logo_image', '/assets/img/favicon.svg'), companyName, 40, 40, 'h-10 w-10 rounded-icon object-cover')
        ]),
        el('p', { class: 'text-base font-semibold text-white', text: companyName || 'SDTech' })
      ]),
      el('span', { class: 'mt-5 block h-px w-6 bg-accent' }),
      el('p', {
        class: 'mt-4 max-w-[520px] text-sm leading-relaxed text-white/60 pre-wrap',
        text: intro || (ok ? '' : '内容加载失败，请稍后刷新')
      })
    ]);

    // 第二栏：全站导航
    var navBox = el('nav', { class: 'grid grid-cols-2 gap-x-4 gap-y-2', 'aria-label': '页脚导航' });
    navItems.forEach(function (item) {
      navBox.appendChild(el('a', { href: item.url, class: 'sd-foot-link', text: item.title }));
    });

    // 第三栏：联系方式（电话 / 微信 / 地址）
    function contactRow(iconSvg, text) {
      return el('div', { class: 'flex items-start gap-2.5' }, [
        el('span', { class: 'mt-0.5 shrink-0 text-white/40', html: iconSvg }),
        el('span', { class: 'text-sm text-white/70 pre-wrap', text: text })
      ]);
    }
    var contactBox = el('div', { class: 'flex flex-col gap-3' }, [
      contactRow(ui.ICONS.phone, phone),
      contactRow(ui.ICONS.wechat, wechat),
      contactRow(ui.ICONS.mapPin, address)
    ]);

    // 第四栏：店铺快捷链接
    var shopBox = el('div', { class: 'flex flex-col gap-3' });
    api.get('/public/shop-links', { params: { zone: 'footer' } })
      .then(function (list) {
        (list || []).forEach(function (shop) {
          if (!shop) return;
          var url = shop.linkUrl || '';
          if ((!url || url === '#') && !shop.qrcodeImage) return; // 不死链
          if (!url || url === '#') {
            shopBox.appendChild(el('span', { class: 'inline-flex items-center gap-2 text-sm text-white/70' }, [
              el('span', { class: 'text-white/40', html: ui.icon(shop.icon) }),
              el('span', { text: shop.title || '' })
            ]));
            return;
          }
          shopBox.appendChild(el('a', {
            href: url, target: '_blank', rel: 'noopener noreferrer',
            class: 'inline-flex items-center gap-2 text-sm text-white/70 transition-colors duration-200 hover:text-white'
          }, [
            el('span', { class: 'text-white/40', html: ui.icon(shop.icon) }),
            el('span', { text: shop.title || '' })
          ]));
        });
        if (!shopBox.childNodes.length) {
          shopBox.appendChild(el('span', { class: 'text-sm text-white/40', text: '店铺入口待补充' }));
        }
      })
      .catch(function () {
        shopBox.appendChild(el('span', { class: 'text-sm text-white/40', text: '店铺入口暂时无法显示，请稍后刷新' }));
      });

    function footCol(title, node) {
      return el('div', {}, [
        el('p', { class: 'mb-4 text-sm font-medium text-white', text: title }),
        node
      ]);
    }

    var bottom = el('div', {
      class: 'mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between'
    }, [
      el('p', { class: 'text-xs text-white/40', text: copyright || companyName }),
      el('p', { class: 'text-xs text-white/40', text: icp })
    ]);

    var inner = el('div', { class: 'sd-container py-14' }, [
      el('div', { class: 'grid gap-10 md:grid-cols-2 lg:grid-cols-4' }, [
        brandBox,
        footCol('快速导航', navBox),
        footCol('联系我们', contactBox),
        footCol('店铺入口', shopBox)
      ]),
      bottom
    ]);

    host.textContent = '';
    host.appendChild(el('footer', { class: 'bg-ink' }, [inner]));
  }

  /* ------------------------------------------------------------------ *
   * 底部 CTA（深色主色渐变 + 白字 + 透明白边按钮 + 几何装饰）
   * ------------------------------------------------------------------ */
  function renderCta(host) {
    var title = txt('cta', 'title', '');
    var desc = txt('cta', 'description', '');
    var btnText = txt('cta', 'button_text', '');
    var btnLink = txt('cta', 'button_link', '/contact.html');
    var bg = image('cta', 'background_image', '');
    if (!title && !desc && !btnText) { host.textContent = ''; return; }

    var shell = el('div', {
      class: 'relative overflow-hidden rounded-card bg-gradient-to-r from-[#2E5A87] to-[#3B6EA5] px-8 py-12 md:px-14 md:py-14'
    }, [
      el('span', { class: 'pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/15' }),
      el('span', { class: 'pointer-events-none absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/5' }),
      bg ? ui.img(bg, '', 1600, 600, 'absolute inset-0 h-full w-full object-cover opacity-10') : null,
      el('div', { class: 'relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between' }, [
        el('div', {}, [
          el('h2', { class: 'text-2xl md:text-[32px] font-semibold leading-tight text-white', text: title }),
          desc ? el('p', { class: 'mt-3 max-w-[560px] text-[15px] text-white/80 pre-wrap', text: desc }) : null
        ]),
        btnText ? el('a', { href: btnLink || '/contact.html', class: 'sd-cta-btn group' }, [
          btnText,
          el('span', { class: 'transition-transform duration-200 group-hover:translate-x-1', html: ui.ICONS.arrowRight })
        ]) : null
      ])
    ]);

    host.textContent = '';
    host.appendChild(el('div', { class: 'sd-container py-14' }, [shell]));
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
