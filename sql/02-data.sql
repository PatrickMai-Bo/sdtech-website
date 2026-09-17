-- 强制以 utf8mb4 读取本文件，避免 mysql 客户端默认 latin1 造成中文双编码
SET NAMES utf8mb4;

-- =====================================================================
-- 顺德分布式科技艺术有限公司官网 — 种子数据
-- 约定：
--   1) 不插入任何管理员（由应用 AdminSeedRunner 用环境变量播种 BCrypt 账号）
--   2) 结构化表使用「显式主键 + ON DUPLICATE KEY UPDATE」，可重复执行
--   3) site_content 采用「逐组 DELETE + INSERT」整组替换，直观且幂等
--   4) 不虚构客户名 / 公司名 / 备案号 / 电话 / 微信号，统一使用占位值
-- =====================================================================
USE sdtech;

-- ---------------------------------------------------------------------
-- 2. 业务服务 biz_service（8 项业务 + 4 个页面级标识）
--    slug=web/design/video/office 为页面级，承载各业务页 Banner 与介绍段落
-- ---------------------------------------------------------------------
INSERT INTO biz_service (id, slug, name, subtitle, summary, icon, cover_image, target_url, page_key, sort_order, status, deleted) VALUES
 (1,  'web-redesign', '旧官网改造',   NULL, '在保留原有品牌资产与内容结构的前提下，对旧版官网进行视觉重做与性能适配。', 'refresh',
      'https://picsum.photos/seed/sdtech-svc-web-redesign/800/600', 'web.html#web-redesign', 'web', 0, 1, 0),
 (2,  'web-new',      '新官网设计',   NULL, '从信息架构到视觉呈现整体设计，交付可直接上线的企业官网。', 'layout',
      'https://picsum.photos/seed/sdtech-svc-web-new/800/600',      'web.html#web-new',      'web', 10, 1, 0),
 (3,  'web-miniapp',  '微信小程序开发', NULL, '面向微信生态的小程序定制开发，覆盖展示、预约与下单等常见场景。', 'smartphone',
      'https://picsum.photos/seed/sdtech-svc-web-miniapp/800/600',  'web.html#web-miniapp',  'web', 20, 1, 0),
 (4,  'web-app',      'Web 应用开发', NULL, '按业务需求定制后台管理与业务系统，支持多角色权限与数据看板。', 'code',
      'https://picsum.photos/seed/sdtech-svc-web-app/800/600',      'web.html#web-app',      'web', 30, 1, 0),
 (5,  'design-poster','海报设计',     NULL, '活动海报、长图与社媒封面设计，统一视觉语言，按需输出多尺寸。', 'image',
      'https://picsum.photos/seed/sdtech-svc-design-poster/800/600','design.html#design-poster','design', 40, 1, 0),
 (6,  'design-product','产品图设计',  NULL, '产品主图、详情图与卖点图设计，突出产品信息，适配电商平台规范。', 'box',
      'https://picsum.photos/seed/sdtech-svc-design-product/800/600','design.html#design-product','design', 50, 1, 0),
 (7,  'video-edit',   '视频剪辑',     NULL, '宣传片、口播与活动记录剪辑，含字幕、配乐与节奏把控。', 'video',
      'https://picsum.photos/seed/sdtech-svc-video-edit/800/600',   'video.html#video-edit',  'video', 60, 1, 0),
 (8,  'office-doc',   '办公定制',     NULL, 'PPT、Word 与 Excel 模板定制，兼顾排版规范与后续可维护性。', 'file-text',
      'https://picsum.photos/seed/sdtech-svc-office-doc/800/600',   'office.html#office-doc', 'office', 70, 1, 0),
 (9,  'web',    '网页开发', '网页开发与设计',   '围绕企业展示与业务承载诉求，提供旧站改造、新站设计、小程序与 Web 应用四类服务，交付可维护的源码与部署说明。', 'monitor',
      'https://picsum.photos/seed/sdtech-svc-web/800/600',     'web.html',    'web',    80, 1, 0),
 (10, 'design', '美工设计', '美工设计与视觉输出', '以统一的视觉语言输出海报与产品图，兼顾品牌一致性与投放场景的尺寸规范。', 'palette',
      'https://picsum.photos/seed/sdtech-svc-design/800/600',  'design.html', 'design', 90, 1, 0),
 (11, 'video',  '视频剪辑', '视频拍摄与后期剪辑', '面向宣传、社媒与活动记录场景，提供从素材整理到成片输出的剪辑服务。', 'film',
      'https://picsum.photos/seed/sdtech-svc-video/800/600',   'video.html',  'video',  100, 1, 0),
 (12, 'office', '办公定制', '办公文档与模板定制', '按企业实际使用场景定制演示文稿与文档模板，减少重复排版工作。', 'file',
      'https://picsum.photos/seed/sdtech-svc-office/800/600',  'office.html', 'office', 110, 1, 0)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), subtitle = VALUES(subtitle), summary = VALUES(summary), icon = VALUES(icon),
  cover_image = VALUES(cover_image), target_url = VALUES(target_url), page_key = VALUES(page_key),
  sort_order = VALUES(sort_order), status = VALUES(status), deleted = VALUES(deleted);

-- ---------------------------------------------------------------------
-- 3. 细分服务 service_item（web 4 / design 2 / video 3 / office 3）
--    挂在各业务页（service_id 指向页面级业务 9/10/11/12）
-- ---------------------------------------------------------------------
INSERT INTO service_item (id, service_id, title, description, icon, sort_order, status, deleted) VALUES
 (1,  9,  '旧官网改造',   '保留原内容与结构，重做视觉与移动端适配，降低改版风险。', 'refresh',   0,  1, 0),
 (2,  9,  '新官网设计',   '从信息架构到视觉稿整体设计，交付可直接上线的页面。', 'layout',    10, 1, 0),
 (3,  9,  '微信小程序开发', '展示、预约、下单等常见小程序场景定制开发。', 'smartphone', 20, 1, 0),
 (4,  9,  'Web 应用开发', '后台管理与业务系统定制，支持多角色权限。', 'code',      30, 1, 0),
 (5,  10, '海报设计',     '活动海报、长图与社媒封面，按需输出多尺寸。', 'image',    0,  1, 0),
 (6,  10, '产品图设计',   '产品主图与详情图，突出卖点并适配平台规范。', 'box',      10, 1, 0),
 (7,  11, '宣传片剪辑',   '企业宣传与产品介绍视频的剪辑与包装。', 'film',     0,  1, 0),
 (8,  11, '口播短视频',   '口播类短视频剪辑，含字幕、配乐与节奏把控。', 'mic',      10, 1, 0),
 (9,  11, '活动记录',     '会议与活动现场记录剪辑，输出成片与片段版本。', 'camera',   20, 1, 0),
 (10, 12, 'PPT 定制',     '汇报、提案与培训演示文稿的版式与图表定制。', 'presentation', 0,  1, 0),
 (11, 12, 'Word 模板',    '合同、方案与制度文档模板定制，样式统一。', 'file-text', 10, 1, 0),
 (12, 12, 'Excel 工具',   '台账、看板与统计表格定制，含公式与简单自动化。', 'table',     20, 1, 0)
ON DUPLICATE KEY UPDATE
  service_id = VALUES(service_id), title = VALUES(title), description = VALUES(description),
  icon = VALUES(icon), sort_order = VALUES(sort_order), status = VALUES(status), deleted = VALUES(deleted);

-- ---------------------------------------------------------------------
-- 4. 交付物 service_deliverable（每类 3 条，共 12 条）
-- ---------------------------------------------------------------------
INSERT INTO service_deliverable (id, service_id, content, icon, sort_order) VALUES
 (1,  9,  '可维护的页面源码与部署说明', 'check', 0),
 (2,  9,  '移动端与主流浏览器适配', 'check', 10),
 (3,  9,  '基础 SEO 与站点结构说明', 'check', 20),
 (4,  10, '设计源文件（可编辑格式）', 'check', 0),
 (5,  10, '多尺寸导出成品图', 'check', 10),
 (6,  10, '字体与配色说明', 'check', 20),
 (7,  11, '成片与短视频片段版本', 'check', 0),
 (8,  11, '字幕文件与配乐清单', 'check', 10),
 (9,  11, '素材归档目录', 'check', 20),
 (10, 12, '可复用模板文件', 'check', 0),
 (11, 12, '样式与排版规范说明', 'check', 10),
 (12, 12, '一次使用讲解', 'check', 20)
ON DUPLICATE KEY UPDATE
  service_id = VALUES(service_id), content = VALUES(content), icon = VALUES(icon), sort_order = VALUES(sort_order);

-- ---------------------------------------------------------------------
-- 5. 案例项目 case_project（4 条中性占位示例，全部设为精选）
-- ---------------------------------------------------------------------
INSERT INTO case_project (id, title, category, cover_image, summary, tech_or_method, deliver_result, is_featured, sort_order, status, view_count, deleted) VALUES
 (1, '企业官网改版示例', 'web',
     'https://picsum.photos/seed/sdtech-case-1/800/600',
     '在保留原有栏目结构的前提下完成视觉重做与移动端适配，页面加载与内容维护效率均有改善。',
     'HTML + Tailwind CSS + 原生 JavaScript；接口数据驱动，无构建依赖',
     '交付上线页面、源码与部署说明，后台可自行维护文案与图片', 1, 0, 1, 0, 0),
 (2, '产品主图设计示例', 'design',
     'https://picsum.photos/seed/sdtech-case-2/800/600',
     '围绕产品卖点重做主图与详情图，统一字体与配色，输出多尺寸成品。',
     '按平台尺寸规范输出，保留可编辑源文件',
     '交付源文件与多尺寸导出图，附字体与配色说明', 1, 10, 1, 0, 0),
 (3, '活动记录剪辑示例', 'video',
     'https://picsum.photos/seed/sdtech-case-3/800/600',
     '对现场素材进行筛选、剪辑与字幕包装，输出成片与社媒短视频版本。',
     '时间线剪辑 + 字幕与配乐处理，输出 1080P 成片',
     '交付成片、短视频片段与字幕文件，附素材归档目录', 1, 20, 1, 0, 0),
 (4, '汇报演示文稿示例', 'office',
     'https://picsum.photos/seed/sdtech-case-4/800/600',
     '按汇报场景重排版式与图表，统一页眉页脚与配色，便于后续复用。',
     '母版与版式统一，图表数据可编辑',
     '交付可复用模板文件与排版规范说明，附一次使用讲解', 1, 30, 1, 0, 0)
ON DUPLICATE KEY UPDATE
  title = VALUES(title), category = VALUES(category), cover_image = VALUES(cover_image),
  summary = VALUES(summary), tech_or_method = VALUES(tech_or_method), deliver_result = VALUES(deliver_result),
  is_featured = VALUES(is_featured), sort_order = VALUES(sort_order), status = VALUES(status), deleted = VALUES(deleted);

-- ---------------------------------------------------------------------
-- 6. 案例图片 case_image（每个案例 3 张，第 1 张为封面）
-- ---------------------------------------------------------------------
INSERT INTO case_image (id, case_id, image_url, alt_text, sort_order, is_cover) VALUES
 (1,  1, 'https://picsum.photos/seed/sdtech-case-1/800/600', '企业官网改版示例 首页', 0,  1),
 (2,  1, 'https://picsum.photos/seed/sdtech-case-1b/800/600', '企业官网改版示例 内页', 10, 0),
 (3,  1, 'https://picsum.photos/seed/sdtech-case-1c/800/600', '企业官网改版示例 移动端', 20, 0),
 (4,  2, 'https://picsum.photos/seed/sdtech-case-2/800/600', '产品主图设计示例 主图', 0,  1),
 (5,  2, 'https://picsum.photos/seed/sdtech-case-2b/800/600', '产品主图设计示例 详情图', 10, 0),
 (6,  2, 'https://picsum.photos/seed/sdtech-case-2c/800/600', '产品主图设计示例 尺寸规范', 20, 0),
 (7,  3, 'https://picsum.photos/seed/sdtech-case-3/800/600', '活动记录剪辑示例 成片', 0,  1),
 (8,  3, 'https://picsum.photos/seed/sdtech-case-3b/800/600', '活动记录剪辑示例 分镜', 10, 0),
 (9,  3, 'https://picsum.photos/seed/sdtech-case-3c/800/600', '活动记录剪辑示例 字幕', 20, 0),
 (10, 4, 'https://picsum.photos/seed/sdtech-case-4/800/600', '汇报演示文稿示例 封面页', 0,  1),
 (11, 4, 'https://picsum.photos/seed/sdtech-case-4b/800/600', '汇报演示文稿示例 图表页', 10, 0),
 (12, 4, 'https://picsum.photos/seed/sdtech-case-4c/800/600', '汇报演示文稿示例 版式', 20, 0)
ON DUPLICATE KEY UPDATE
  case_id = VALUES(case_id), image_url = VALUES(image_url), alt_text = VALUES(alt_text),
  sort_order = VALUES(sort_order), is_cover = VALUES(is_cover);

-- ---------------------------------------------------------------------
-- 7. 报价项 quote_item（8 项，每类 2 项；金额为展示文本）
-- ---------------------------------------------------------------------
INSERT INTO quote_item (id, service_id, item_name, price_text, price_unit, description, sort_order, status, deleted) VALUES
 (1,  9,  '旧官网改造',   '2000-6000', '元/套',  '按页面数量与改动范围评估，含移动端适配', 0,  1, 0),
 (2,  9,  '新官网设计',   '面议',      '元/套',  '按栏目数量与设计深度评估，含源码与部署说明', 10, 1, 0),
 (3,  10, '海报设计',     '200-800',   '元/张',  '含源文件与两轮修改，多尺寸另计', 20, 1, 0),
 (4,  10, '产品图设计',   '300-1000',  '元/张',  '含主图与详情图，按平台规范输出', 30, 1, 0),
 (5,  11, '宣传片剪辑',   '800-3000',  '元/条',  '按时长与素材量评估，含字幕与配乐', 40, 1, 0),
 (6,  11, '口播短视频',   '200-800',   '元/条',  '含字幕、配乐与节奏处理，成片 1080P', 50, 1, 0),
 (7,  12, 'PPT 定制',     '300-1500',  '元/份',  '按页数与图表复杂度评估，交付可编辑文件', 60, 1, 0),
 (8,  12, 'Excel 工具',   '面议',      '元/套',  '按表格复杂度与自动化需求评估', 70, 1, 0)
ON DUPLICATE KEY UPDATE
  service_id = VALUES(service_id), item_name = VALUES(item_name), price_text = VALUES(price_text),
  price_unit = VALUES(price_unit), description = VALUES(description),
  sort_order = VALUES(sort_order), status = VALUES(status), deleted = VALUES(deleted);

-- ---------------------------------------------------------------------
-- 8. 店铺 / 联系方式 shop_link（4 条，链接为 # 占位，待后台替换）
-- ---------------------------------------------------------------------
INSERT INTO shop_link (id, platform, title, link_url, icon, qrcode_image, show_zone, sort_order, status) VALUES
 (1, 'wechat', '微信咨询',   '#', 'wechat', 'https://picsum.photos/seed/sdtech-qr/320/320', 'home,footer,contact,cta', 0,  1),
 (2, 'xianyu', '闲鱼店铺',   '#', 'xianyu', NULL, 'home,footer,contact', 10, 1),
 (3, 'taobao', '淘宝店铺',   '#', 'taobao', NULL, 'home,footer,contact', 20, 1),
 (4, 'pdd',    '拼多多店铺', '#', 'pdd',    NULL, 'home,footer,contact', 30, 1)
ON DUPLICATE KEY UPDATE
  platform = VALUES(platform), title = VALUES(title), link_url = VALUES(link_url), icon = VALUES(icon),
  qrcode_image = VALUES(qrcode_image), show_zone = VALUES(show_zone),
  sort_order = VALUES(sort_order), status = VALUES(status);

-- ---------------------------------------------------------------------
-- 10. 站点文案 site_content（逐组整组替换，覆盖全部前端所需键）
-- ---------------------------------------------------------------------

-- 全站信息 global
DELETE FROM site_content WHERE content_group = 'global';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('global', 'company_name',   '顺德分布式科技艺术有限公司', NULL, 'text',  '公司全称', 0),
 ('global', 'company_short',  '分布式科技艺术',             NULL, 'text',  '公司简称', 10),
 ('global', 'slogan',         '数字化视觉与 Web 应用定制服务商', NULL, 'text', '一句话定位', 20),
 ('global', 'logo_image',     NULL, '/assets/img/favicon.svg', 'image', '站点 Logo', 30),
 ('global', 'phone',          '待补充', NULL, 'text', '联系电话', 40),
 ('global', 'email',          '待补充', NULL, 'text', '邮箱', 50),
 ('global', 'wechat_id',      '待补充', NULL, 'text', '微信号', 60),
 ('global', 'address',        '待补充', NULL, 'text', '联系地址', 70),
 ('global', 'icp',            '备案号：待填写', NULL, 'text', '备案号', 80),
 ('global', 'copyright',      '© 2026 顺德分布式科技艺术有限公司 保留所有权利', NULL, 'text', '版权信息', 90);

-- 导航 nav（8 项）
DELETE FROM site_content WHERE content_group = 'nav';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('nav', '1.title', '首页',     NULL, 'text', '第 1 项名称', 0),
 ('nav', '1.url',   '/index.html', NULL, 'url', '第 1 项链接', 1),
 ('nav', '2.title', '网页开发', NULL, 'text', '第 2 项名称', 10),
 ('nav', '2.url',   '/web.html', NULL, 'url', '第 2 项链接', 11),
 ('nav', '3.title', '美工设计', NULL, 'text', '第 3 项名称', 20),
 ('nav', '3.url',   '/design.html', NULL, 'url', '第 3 项链接', 21),
 ('nav', '4.title', '视频剪辑', NULL, 'text', '第 4 项名称', 30),
 ('nav', '4.url',   '/video.html', NULL, 'url', '第 4 项链接', 31),
 ('nav', '5.title', '办公定制', NULL, 'text', '第 5 项名称', 40),
 ('nav', '5.url',   '/office.html', NULL, 'url', '第 5 项链接', 41),
 ('nav', '6.title', '案例作品', NULL, 'text', '第 6 项名称', 50),
 ('nav', '6.url',   '/cases.html', NULL, 'url', '第 6 项链接', 51),
 ('nav', '7.title', '合作报价', NULL, 'text', '第 7 项名称', 60),
 ('nav', '7.url',   '/pricing.html', NULL, 'url', '第 7 项链接', 61),
 ('nav', '8.title', '联系我们', NULL, 'text', '第 8 项名称', 70),
 ('nav', '8.url',   '/contact.html', NULL, 'url', '第 8 项链接', 71);

-- 首页 Hero
DELETE FROM site_content WHERE content_group = 'hero';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('hero', 'title',                 '为企业提供可维护的网站与视觉设计服务', NULL, 'text', '主标题', 0),
 ('hero', 'subtitle',              '网页开发 · 美工设计 · 视频剪辑 · 办公定制', NULL, 'text', '副标题', 10),
 ('hero', 'description',           '从旧站改造到新站设计，从海报到产品图，按需求范围明确交付物与排期，源码与文件全部交付。', NULL, 'text', '描述', 20),
 ('hero', 'primary_button_text',   '查看案例', NULL, 'text', '主按钮文案', 30),
 ('hero', 'primary_button_link',   '/cases.html', NULL, 'url',  '主按钮链接', 40),
 ('hero', 'secondary_button_text', '立即咨询', NULL, 'text', '次按钮文案', 50),
 ('hero', 'secondary_button_link', '/contact.html', NULL, 'url', '次按钮链接', 60),
 ('hero', 'background_image',      NULL, 'https://picsum.photos/seed/sdtech-hero/1600/900', 'image', '背景图', 70);

-- 首页优势 advantage（4 条）
DELETE FROM site_content WHERE content_group = 'advantage';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('advantage', '1.title', '一站式能力',     NULL, 'text', '优势 1 标题', 0),
 ('advantage', '1.desc',  '网页、设计、视频与办公文档可在同一处沟通，减少多方对接成本。', NULL, 'text', '优势 1 说明', 1),
 ('advantage', '1.icon',  'layers',         NULL, 'text', '优势 1 图标', 2),
 ('advantage', '2.title', '老站兼容改造',   NULL, 'text', '优势 2 标题', 10),
 ('advantage', '2.desc',  '支持在保留原有结构与内容的前提下改造，不必推倒重来。', NULL, 'text', '优势 2 说明', 11),
 ('advantage', '2.icon',  'refresh',        NULL, 'text', '优势 2 图标', 12),
 ('advantage', '3.title', 'AI 增效',        NULL, 'text', '优势 3 标题', 20),
 ('advantage', '3.desc',  '在素材整理与初稿环节合理使用 AI 工具提效，关键内容由人工确认。', NULL, 'text', '优势 3 说明', 21),
 ('advantage', '3.icon',  'sparkles',       NULL, 'text', '优势 3 图标', 22),
 ('advantage', '4.title', '多渠道下单',     NULL, 'text', '优势 4 标题', 30),
 ('advantage', '4.desc',  '支持微信、闲鱼、淘宝与拼多多等渠道沟通，流程与交付标准一致。', NULL, 'text', '优势 4 说明', 31),
 ('advantage', '4.icon',  'store',          NULL, 'text', '优势 4 图标', 32);

-- 合作流程 process（6 步）
DELETE FROM site_content WHERE content_group = 'process';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('process', '1.title', '需求沟通', NULL, 'text', '步骤 1 标题', 0),
 ('process', '1.desc',  '说明使用场景、页面数量与期望交付时间。', NULL, 'text', '步骤 1 说明', 1),
 ('process', '2.title', '方案报价', NULL, 'text', '步骤 2 标题', 10),
 ('process', '2.desc',  '按需求范围给出明确报价与交付物清单。', NULL, 'text', '步骤 2 说明', 11),
 ('process', '3.title', '支付定金', NULL, 'text', '步骤 3 标题', 20),
 ('process', '3.desc',  '确认方案后支付定金，进入排期。', NULL, 'text', '步骤 3 说明', 21),
 ('process', '4.title', '项目制作', NULL, 'text', '步骤 4 标题', 30),
 ('process', '4.desc',  '按确认的方案执行，关键节点同步进度。', NULL, 'text', '步骤 4 说明', 31),
 ('process', '5.title', '修改优化', NULL, 'text', '步骤 5 标题', 40),
 ('process', '5.desc',  '在约定范围内完成修改与细节优化。', NULL, 'text', '步骤 5 说明', 41),
 ('process', '6.title', '交付源文件', NULL, 'text', '步骤 6 标题', 50),
 ('process', '6.desc',  '结清尾款后交付源文件与说明，支持后续自行维护。', NULL, 'text', '步骤 6 说明', 51);

-- 常见问题 faq（5 条）
DELETE FROM site_content WHERE content_group = 'faq';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('faq', '1.question', '报价是怎么核算的？', NULL, 'text', '问题 1', 0),
 ('faq', '1.answer',   '按需求范围核算，主要看页面或成品数量、设计深度与修改轮次；页面报价会给出区间，特殊需求标注为面议。', NULL, 'text', '回答 1', 1),
 ('faq', '2.question', '需要支付定金吗？', NULL, 'text', '问题 2', 10),
 ('faq', '2.answer',   '确认方案后支付定金进入排期，尾款在交付源文件前结清，具体比例在报价单中写明。', NULL, 'text', '回答 2', 11),
 ('faq', '3.question', '包含几次免费修改？', NULL, 'text', '问题 3', 20),
 ('faq', '3.answer',   '报价范围内包含约定次数的修改；超出部分按改动范围另行沟通，改动前会先说明。', NULL, 'text', '回答 3', 21),
 ('faq', '4.question', '会交付源文件吗？', NULL, 'text', '问题 4', 30),
 ('faq', '4.answer',   '会。网页类交付源码与部署说明，设计类交付可编辑源文件，视频类交付素材归档目录。', NULL, 'text', '回答 4', 31),
 ('faq', '5.question', 'AI 生成素材的版权怎么算？', NULL, 'text', '问题 5', 40),
 ('faq', '5.answer',   '如使用 AI 生成素材，会在交付前告知并说明可商用范围；涉及第三方字体与图库的授权由双方确认后再使用。', NULL, 'text', '回答 5', 41);

-- 项目约定 pricing_terms（5 条）
DELETE FROM site_content WHERE content_group = 'pricing_terms';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('pricing_terms', '1.title', '定金与尾款', NULL, 'text', '条款 1 标题', 0),
 ('pricing_terms', '1.desc',  '确认方案后支付定金进入排期，尾款在交付源文件前结清。', NULL, 'text', '条款 1 说明', 1),
 ('pricing_terms', '2.title', '免费修改', NULL, 'text', '条款 2 标题', 10),
 ('pricing_terms', '2.desc',  '报价范围内包含约定次数的修改，超出部分按改动范围另行沟通。', NULL, 'text', '条款 2 说明', 11),
 ('pricing_terms', '3.title', '源文件交付', NULL, 'text', '条款 3 标题', 20),
 ('pricing_terms', '3.desc',  '结清尾款后交付源文件与说明，便于后续自行维护。', NULL, 'text', '条款 3 说明', 21),
 ('pricing_terms', '4.title', 'AI 版权', NULL, 'text', '条款 4 标题', 30),
 ('pricing_terms', '4.desc',  '使用 AI 生成素材会事先说明可商用范围，第三方授权素材需双方确认后使用。', NULL, 'text', '条款 4 说明', 31),
 ('pricing_terms', '5.title', '拒单范围', NULL, 'text', '条款 5 标题', 40),
 ('pricing_terms', '5.desc',  '涉及违法违规、侵权素材与虚假宣传的需求不予承接，恕不另行说明。', NULL, 'text', '条款 5 说明', 41);

-- 底部行动区 cta
DELETE FROM site_content WHERE content_group = 'cta';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('cta', 'title',            '准备启动你的项目？欢迎咨询', NULL, 'text', '标题', 0),
 ('cta', 'description',      '说明你的场景与期望时间，我们会给出明确的报价与交付物清单。', NULL, 'text', '描述', 10),
 ('cta', 'button_text',      '联系我们', NULL, 'text', '按钮文案', 20),
 ('cta', 'button_link',      '/contact.html', NULL, 'url', '按钮链接', 30),
 ('cta', 'background_image', NULL, 'https://picsum.photos/seed/sdtech-cta/1600/600', 'image', '背景图', 40);

-- 页脚 footer
DELETE FROM site_content WHERE content_group = 'footer';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('footer', 'company_intro', '顺德分布式科技艺术有限公司提供网页开发、美工设计、视频剪辑与办公定制服务，按需求范围明确交付物与排期。', NULL, 'text', '公司简介', 0),
 ('footer', 'social_note',   '可通过微信与各电商平台店铺联系我们，渠道不同，流程与交付标准一致。', NULL, 'text', '渠道说明', 10);

-- 联系页 contact
DELETE FROM site_content WHERE content_group = 'contact';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('contact', 'wechat_id',        '待补充', NULL, 'text', '微信号', 0),
 ('contact', 'wechat_note',      '添加微信时请备注「官网咨询 + 需求类型」，便于快速对接。', NULL, 'text', '微信说明', 10),
 ('contact', 'form_success_tip', '已收到你的需求，我们会尽快与你联系，请保持电话畅通。', NULL, 'text', '提交成功提示', 20),
 ('contact', 'shops_title',      '也可通过以下店铺与我们联系', NULL, 'text', '店铺专区标题', 30),
 ('contact', 'wechat_qrcode',    NULL, 'https://picsum.photos/seed/sdtech-qr/320/320', 'image', '微信二维码', 40);

-- 各页 Banner banner
DELETE FROM site_content WHERE content_group = 'banner';
INSERT INTO site_content (content_group, content_key, content_value, image_url, value_type, label, sort_order) VALUES
 ('banner', 'web.title',     '网页开发与设计', NULL, 'text', '网页开发页标题', 0),
 ('banner', 'web.subtitle',  '旧站改造 · 新站设计 · 小程序 · Web 应用', NULL, 'text', '网页开发页副标题', 1),
 ('banner', 'design.title',    '美工设计与视觉输出', NULL, 'text', '美工设计页标题', 10),
 ('banner', 'design.subtitle', '海报设计 · 产品图设计', NULL, 'text', '美工设计页副标题', 11),
 ('banner', 'video.title',    '视频拍摄与后期剪辑', NULL, 'text', '视频剪辑页标题', 20),
 ('banner', 'video.subtitle', '宣传片 · 口播短视频 · 活动记录', NULL, 'text', '视频剪辑页副标题', 21),
 ('banner', 'office.title',    '办公文档与模板定制', NULL, 'text', '办公定制页标题', 30),
 ('banner', 'office.subtitle', 'PPT · Word 模板 · Excel 工具', NULL, 'text', '办公定制页副标题', 31),
 ('banner', 'cases.title',    '案例作品', NULL, 'text', '案例页标题', 40),
 ('banner', 'cases.subtitle', '以下为示例展示，正式案例将在交付后补充', NULL, 'text', '案例页副标题', 41),
 ('banner', 'pricing.title',    '合作报价', NULL, 'text', '报价页标题', 50),
 ('banner', 'pricing.subtitle', '按需求范围核算，报价仅作参考，最终以方案确认为准', NULL, 'text', '报价页副标题', 51),
 ('banner', 'contact.title',    '联系我们', NULL, 'text', '联系页标题', 60),
 ('banner', 'contact.subtitle', '说明你的场景与期望时间，我们会尽快回复', NULL, 'text', '联系页副标题', 61);
