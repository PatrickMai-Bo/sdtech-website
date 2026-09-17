/**
 * contact.js — 联系我们页
 *
 * 数据来源：
 *   - 站点 KV：banner.contact.*、contact.wechat_id / wechat_note / wechat_qrcode /
 *              form_success_tip / shops_title
 *   - GET /api/public/shop-links?zone=contact   店铺专区
 *   - GET /api/public/faqs                      FAQ 入口
 *   - POST /api/public/messages                 提交留言
 *
 * 表单校验：姓名必填 ≤30 字；手机号 ^1[3-9]\d{9}$；需求 5–500 字；
 * 提交期间禁用按钮防重复提交，3s 内给出反馈。
 */
(function (window, document) {
  'use strict';

  var ui = window.ui;
  var api = window.api;
  var el = ui.el;

  var PHONE_RE = /^1[3-9]\d{9}$/;

  function host(id) {
    var node = document.getElementById(id);
    if (node) node.textContent = '';
    return node;
  }

  function sectionHead(title, desc) {
    return el('div', { class: 'mb-8' }, [
      el('h2', { class: 'text-[22px] md:text-[26px] font-semibold tracking-tight', text: title }),
      desc ? el('p', { class: 'mt-3 text-[15px] text-inkMid pre-wrap', text: desc }) : null
    ]);
  }

  /* ---------------- Banner ---------------- */
  function renderBanner() {
    var box = host('banner-section');
    if (!box) return;
    var title = window.Layout.txt('banner', 'contact.title', '');
    var subtitle = window.Layout.txt('banner', 'contact.subtitle', '');
    if (title) document.title = title;
    box.appendChild(el('div', { class: 'bg-primarySoft border-b border-line' }, [
      el('div', { class: 'sd-container py-12 md:py-16' }, [
        el('h1', { class: 'text-[28px] md:text-[36px] font-semibold tracking-tight text-ink', text: title || '联系我们' }),
        subtitle ? el('p', { class: 'mt-4 text-[15px] text-inkMid pre-wrap max-w-[680px]', text: subtitle }) : null
      ])
    ]));
  }

  /* ---------------- 微信区 ---------------- */
  function renderWechatBox() {
    var wechatId = window.Layout.txt('contact', 'wechat_id', window.Layout.txt('global', 'wechat_id', '待补充'));
    var note = window.Layout.txt('contact', 'wechat_note', '');
    var qrcode = window.Layout.image('contact', 'wechat_qrcode', '');

    var qr = qrcode
      ? ui.img(qrcode, '微信二维码', 480, 480, 'h-[160px] w-[160px] rounded-card object-cover border border-line cursor-zoom-in')
      : el('div', { class: 'h-[160px] w-[160px] rounded-card border border-dashed border-line bg-surfaceSoft flex items-center justify-center text-xs text-inkWeak', text: '二维码待补充' });

    if (qrcode) {
      qr.addEventListener('click', function () {
        var big = ui.img(qrcode, '微信二维码', 800, 800, 'w-full max-w-[420px] rounded-card object-cover');
        ui.modal({ title: '微信二维码', bodyEl: big, size: window.innerWidth < 768 ? 'full' : 'default' });
      });
    }

    var copyTip = el('span', { class: 'ml-2 text-xs text-success hidden', text: '已复制' });
    var copyBtn = el('button', {
      type: 'button',
      class: 'inline-flex items-center gap-1 rounded-ctl border border-line px-3 py-1.5 text-xs text-inkMid hover:border-primary hover:text-primary transition-colors duration-200',
      html: ui.ICONS.copy
    });
    copyBtn.addEventListener('click', function () {
      copyText(wechatId, function (okFlag) {
        copyTip.classList.remove('hidden');
        copyTip.textContent = okFlag ? '已复制' : '复制失败，请手动选择';
        setTimeout(function () { copyTip.classList.add('hidden'); }, 2000);
      });
    });

    var idRow = el('div', { class: 'mt-4 flex items-center gap-2 flex-wrap' }, [
      el('span', { class: 'text-sm text-inkWeak', text: '微信号' }),
      el('span', { class: 'text-[15px] font-medium text-ink select-all', text: wechatId }),
      copyBtn,
      copyTip
    ]);

    return el('div', { class: 'sd-card p-6' }, [
      el('h2', { class: 'text-[18px] font-semibold text-ink', text: '微信咨询' }),
      el('div', { class: 'mt-5 flex items-start gap-5' }, [qr, el('div', {}, [idRow])]),
      note ? el('p', { class: 'mt-4 text-sm text-inkMid pre-wrap', text: note }) : null
    ]);
  }

  /** 复制文本：优先 clipboard API，降级 execCommand */
  function copyText(text, done) {
    if (!text || text === '待补充') { done(false); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { done(true); })
        .catch(function () { legacyCopy(text, done); });
      return;
    }
    legacyCopy(text, done);
  }

  function legacyCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var okFlag = document.execCommand('copy');
      document.body.removeChild(ta);
      done(!!okFlag);
    } catch (err) {
      done(false);
    }
  }

  /* ---------------- 留言表单 ---------------- */
  function field(label, required, control, errorNode) {
    return el('div', { class: 'sd-field' }, [
      el('label', { class: 'sd-label' + (required ? ' sd-required' : ''), text: label }),
      control,
      errorNode
    ]);
  }

  function renderForm() {
    var nameInput = el('input', { type: 'text', class: 'sd-input', maxlength: '30', placeholder: '请输入您的称呼', autocomplete: 'name' });
    var phoneInput = el('input', { type: 'tel', class: 'sd-input', maxlength: '11', placeholder: '请输入 11 位手机号', autocomplete: 'tel' });
    var demandInput = el('textarea', { class: 'sd-input sd-textarea', maxlength: '500', placeholder: '请简要描述您的需求（5–500 字）' });

    var nameErr = el('p', { class: 'sd-error hidden' });
    var phoneErr = el('p', { class: 'sd-error hidden' });
    var demandErr = el('p', { class: 'sd-error hidden' });
    var formTip = el('p', { class: 'text-sm hidden' });

    function setError(node, input, message) {
      if (message) {
        node.textContent = message;
        node.classList.remove('hidden');
        input.classList.add('border-primary');
      } else {
        node.textContent = '';
        node.classList.add('hidden');
        input.classList.remove('border-primary');
      }
    }

    // 聚焦即清除错误提示
    [nameInput, phoneInput, demandInput].forEach(function (input, index) {
      var node = [nameErr, phoneErr, demandErr][index];
      input.addEventListener('input', function () { setError(node, input, ''); });
    });

    var submitBtn = el('button', { type: 'submit', class: 'sd-btn-primary w-full md:w-auto' }, ['提交留言']);

    var form = el('form', { novalidate: 'novalidate', class: 'sd-card p-6' }, [
      el('h2', { class: 'text-[18px] font-semibold text-ink mb-5', text: '需求留言' }),
      field('姓名', true, nameInput, nameErr),
      field('联系电话', true, phoneInput, phoneErr),
      field('需求描述', true, demandInput, demandErr),
      submitBtn,
      formTip
    ]);

    function validate() {
      var okFlag = true;
      var name = nameInput.value.trim();
      var phone = phoneInput.value.trim();
      var demand = demandInput.value.trim();
      if (!name) { setError(nameErr, nameInput, '请填写姓名'); okFlag = false; }
      else if (name.length > 30) { setError(nameErr, nameInput, '姓名不超过 30 字'); okFlag = false; }
      else setError(nameErr, nameInput, '');

      if (!phone) { setError(phoneErr, phoneInput, '请填写联系电话'); okFlag = false; }
      else if (!PHONE_RE.test(phone)) { setError(phoneErr, phoneInput, '请填写正确的 11 位手机号'); okFlag = false; }
      else setError(phoneErr, phoneInput, '');

      if (!demand) { setError(demandErr, demandInput, '请填写需求描述'); okFlag = false; }
      else if (demand.length < 5 || demand.length > 500) { setError(demandErr, demandInput, '需求描述需 5–500 字'); okFlag = false; }
      else setError(demandErr, demandInput, '');

      return okFlag;
    }

    function setTip(message, kind) {
      formTip.textContent = message || '';
      formTip.className = 'text-sm mt-3 ' + (kind === 'error' ? 'text-inkMid' : 'text-success');
      formTip.classList.toggle('hidden', !message);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validate()) return;
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
      submitBtn.textContent = '提交中…';
      setTip('');

      api.post('/public/messages', {
        body: {
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          demand: demandInput.value.trim(),
          sourcePage: 'contact'
        },
        timeout: 3000
      })
        .then(function () {
          var successTip = window.Layout.txt('contact', 'form_success_tip', '提交成功，我们会尽快与您联系');
          setTip(successTip, 'success');
          nameInput.value = '';
          phoneInput.value = '';
          demandInput.value = '';
          ui.toast(successTip, 'success');
        })
        .catch(function (err) {
          console.warn('[sdtech] 留言提交失败：', err && err.message);
          setTip((err && err.message) || '提交失败，请稍后重试', 'error');
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
          submitBtn.textContent = '提交留言';
        });
    });

    return form;
  }

  /* ---------------- 联系方式 + 表单主体 ---------------- */
  function renderContactMain() {
    var box = host('contact-section');
    if (!box) return;
    box.appendChild(el('div', { class: 'sd-container grid gap-8 lg:grid-cols-2' }, [
      renderWechatBox(),
      renderForm()
    ]));
  }

  /* ---------------- 店铺专区 ---------------- */
  function renderShops() {
    var box = host('shops-section');
    if (!box) return;
    var title = window.Layout.txt('contact', 'shops_title', '电商店铺');
    var grid = el('div', { class: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4' });
    box.appendChild(el('div', { class: 'sd-container' }, [sectionHead(title), grid]));

    api.get('/public/shop-links', { params: { zone: 'contact' } })
      .then(function (list) {
        var items = (list || []).filter(function (shop) {
          var url = shop.linkUrl || '';
          return (url && url !== '#') || shop.qrcodeImage;
        });
        items.forEach(function (shop) {
          var url = shop.linkUrl || '';
          var body = el('div', { class: 'sd-card p-5 flex items-center gap-4' }, [
            el('div', { class: 'h-11 w-11 shrink-0 rounded-icon bg-surface flex items-center justify-center text-inkMid', html: ui.icon(shop.icon) }),
            el('div', { class: 'min-w-0' }, [
              el('p', { class: 'text-[15px] font-medium text-ink truncate', text: shop.title || '' }),
              el('p', { class: 'mt-1 text-xs text-inkWeak', text: shop.platform || '' })
            ])
          ]);
          if (url && url !== '#') {
            grid.appendChild(el('a', { href: url, target: '_blank', rel: 'noopener noreferrer', class: 'block' }, [body]));
          } else {
            grid.appendChild(body);
          }
        });
        if (!items.length) grid.appendChild(ui.empty(null, '店铺入口待补充'));
      })
      .catch(function (err) {
        console.warn('[sdtech] shop-links 加载失败：', err && err.message);
        grid.appendChild(ui.fallback(null, '店铺入口'));
      });
  }

  /* ---------------- FAQ 入口 ---------------- */
  function renderFaq() {
    var box = host('faq-section');
    if (!box) return;
    var container = el('div', { class: 'divide-y divide-line border-y border-line' });
    box.appendChild(el('div', { class: 'sd-container' }, [sectionHead('常见问题'), container]));

    api.get('/public/faqs')
      .then(function (list) {
        var items = list || [];
        if (!items.length) { container.appendChild(ui.empty(null, '敬请期待')); return; }
        items.forEach(function (item, index) {
          var bodyId = 'cfaq-body-' + index;
          container.appendChild(el('div', { class: 'sd-acc-item' }, [
            el('button', {
              type: 'button', class: 'w-full flex items-center justify-between gap-4 py-5 text-left',
              'data-acc-trigger': '1', 'aria-expanded': 'false', 'aria-controls': bodyId
            }, [
              el('span', { class: 'text-[15px] font-medium text-ink', text: item.question || '' }),
              el('span', { class: 'sd-acc-icon shrink-0 text-inkWeak', html: ui.ICONS.chevronDown })
            ]),
            el('div', { class: 'sd-acc-body', id: bodyId }, [
              el('p', { class: 'pb-5 text-sm text-inkMid pre-wrap', text: item.answer || '' })
            ])
          ]));
        });
        ui.accordion(container);
      })
      .catch(function (err) {
        console.warn('[sdtech] faqs 加载失败：', err && err.message);
        container.appendChild(ui.fallback(null, '常见问题'));
      });
  }

  /* ---------------- 入口 ---------------- */
  function boot() {
    window.Layout.mount({ active: 'contact' });
    window.Layout.ready().then(function () {
      renderBanner();
      renderContactMain();
      renderShops();
      renderFaq();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
