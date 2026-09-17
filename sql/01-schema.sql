-- 强制以 utf8mb4 读取本文件，避免 mysql 客户端默认 latin1 造成中文双编码
SET NAMES utf8mb4;

-- =====================================================================
-- 顺德分布式科技艺术有限公司官网 — 数据库结构
-- 编码 utf8mb4 / utf8mb4_unicode_ci / InnoDB，全部 IF NOT EXISTS 可重复执行
-- =====================================================================
CREATE DATABASE IF NOT EXISTS sdtech
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sdtech;

-- 1. 管理员（种子不插此表，由应用 AdminSeedRunner 播种 BCrypt 账号）
CREATE TABLE IF NOT EXISTS admin_user (
  id               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  username         VARCHAR(64)  NOT NULL                COMMENT '登录账号，唯一',
  password_hash    VARCHAR(128) NOT NULL                COMMENT 'BCrypt 密码哈希',
  real_name        VARCHAR(64)  DEFAULT NULL            COMMENT '姓名',
  last_login_time  DATETIME     DEFAULT NULL            COMMENT '最近登录时间',
  status           TINYINT      NOT NULL DEFAULT 1      COMMENT '1 启用 0 禁用',
  create_time      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '管理员';

-- 2. 业务服务（8 项业务 + 4 个页面级标识）
CREATE TABLE IF NOT EXISTS biz_service (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  slug          VARCHAR(64)  NOT NULL                COMMENT '业务标识，唯一',
  name          VARCHAR(64)  NOT NULL                COMMENT '业务名称',
  subtitle      VARCHAR(255) DEFAULT NULL            COMMENT '业务页 Banner 副标题',
  summary       VARCHAR(500) DEFAULT NULL            COMMENT '业务页介绍段落',
  icon          VARCHAR(64)  DEFAULT NULL            COMMENT '图标 key',
  cover_image   VARCHAR(512) DEFAULT NULL            COMMENT '封面图 URL',
  target_url    VARCHAR(255) DEFAULT NULL            COMMENT '跳转地址',
  page_key      VARCHAR(32)  DEFAULT NULL            COMMENT '页面标识 web/design/video/office',
  sort_order    INT          NOT NULL DEFAULT 0      COMMENT '排序，升序',
  status        TINYINT      NOT NULL DEFAULT 1      COMMENT '1 显示 0 隐藏',
  deleted       TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_slug (slug),
  KEY idx_page (page_key, status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '业务服务';

-- 3. 细分服务
CREATE TABLE IF NOT EXISTS service_item (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  service_id    BIGINT       NOT NULL                COMMENT '所属业务 ID',
  title         VARCHAR(128) NOT NULL                COMMENT '标题',
  description   VARCHAR(500) DEFAULT NULL            COMMENT '描述',
  icon          VARCHAR(64)  DEFAULT NULL            COMMENT '图标 key',
  sort_order    INT          NOT NULL DEFAULT 0      COMMENT '排序，升序',
  status        TINYINT      NOT NULL DEFAULT 1      COMMENT '1 显示 0 隐藏',
  deleted       TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_service (service_id, status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '细分服务';

-- 4. 交付物（从表，物理删除）
CREATE TABLE IF NOT EXISTS service_deliverable (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  service_id    BIGINT       NOT NULL                COMMENT '所属业务 ID',
  content       VARCHAR(255) NOT NULL                COMMENT '交付物条目',
  icon          VARCHAR(64)  DEFAULT NULL            COMMENT '图标 key，默认 check',
  sort_order    INT          NOT NULL DEFAULT 0      COMMENT '排序，升序',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_service (service_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '交付物';

-- 5. 案例项目
CREATE TABLE IF NOT EXISTS case_project (
  id               BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  title            VARCHAR(128)  NOT NULL                COMMENT '标题',
  category         VARCHAR(32)   NOT NULL                COMMENT '分类 web/design/video/office',
  cover_image      VARCHAR(512)  DEFAULT NULL            COMMENT '封面图 URL',
  summary          VARCHAR(1000) DEFAULT NULL            COMMENT '项目简介',
  tech_or_method   VARCHAR(500)  DEFAULT NULL            COMMENT '技术/制作方式',
  deliver_result   VARCHAR(1000) DEFAULT NULL            COMMENT '交付成果',
  is_featured      TINYINT       NOT NULL DEFAULT 0      COMMENT '1 精选 0 普通',
  sort_order       INT           NOT NULL DEFAULT 0      COMMENT '排序，升序',
  status           TINYINT       NOT NULL DEFAULT 1      COMMENT '1 显示 0 隐藏',
  view_count       INT           NOT NULL DEFAULT 0      COMMENT '浏览量（预留）',
  deleted          TINYINT       NOT NULL DEFAULT 0      COMMENT '逻辑删除',
  create_time      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_list (category, status, is_featured, sort_order, id),
  KEY idx_featured (is_featured, status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '案例项目';

-- 6. 案例图片（从表，物理删除）
CREATE TABLE IF NOT EXISTS case_image (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  case_id       BIGINT       NOT NULL                COMMENT '所属案例 ID',
  image_url     VARCHAR(512) NOT NULL                COMMENT '图片 URL',
  alt_text      VARCHAR(255) DEFAULT NULL            COMMENT '替代文本',
  sort_order    INT          NOT NULL DEFAULT 0      COMMENT '排序，升序',
  is_cover      TINYINT      NOT NULL DEFAULT 0      COMMENT '1 封面 0 普通',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_case (case_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '案例图片';

-- 7. 报价项（金额为展示文本，不用 DECIMAL）
CREATE TABLE IF NOT EXISTS quote_item (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  service_id    BIGINT       DEFAULT NULL            COMMENT '关联业务 ID，可为空',
  item_name     VARCHAR(128) NOT NULL                COMMENT '报价项名称',
  price_text    VARCHAR(64)  DEFAULT NULL            COMMENT '价格文本，如 2000-6000 / 面议',
  price_unit    VARCHAR(32)  DEFAULT NULL            COMMENT '计价单位，如 元/套',
  description   VARCHAR(500) DEFAULT NULL            COMMENT '说明',
  sort_order    INT          NOT NULL DEFAULT 0      COMMENT '排序，升序',
  status        TINYINT      NOT NULL DEFAULT 1      COMMENT '1 显示 0 隐藏',
  deleted       TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_service (service_id, sort_order),
  KEY idx_status (status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '报价项';

-- 8. 店铺 / 联系方式链接（物理删除）
CREATE TABLE IF NOT EXISTS shop_link (
  id             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  platform       VARCHAR(32)  NOT NULL                COMMENT '平台 wechat/xianyu/taobao/pdd/other',
  title          VARCHAR(64)  NOT NULL                COMMENT '展示标题',
  link_url       VARCHAR(512) DEFAULT NULL            COMMENT '链接地址，# 或空时前端隐藏',
  icon           VARCHAR(64)  DEFAULT NULL            COMMENT '图标 key',
  qrcode_image   VARCHAR(512) DEFAULT NULL            COMMENT '二维码图片 URL',
  show_zone      VARCHAR(128) DEFAULT NULL            COMMENT '展示位置，逗号分隔 home,footer,contact,cta',
  sort_order     INT          NOT NULL DEFAULT 0      COMMENT '排序，升序',
  status         TINYINT      NOT NULL DEFAULT 1      COMMENT '1 显示 0 隐藏',
  create_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '店铺链接';

-- 9. 访客留言（物理删除；ip_address 仅限流用，不下发前端）
CREATE TABLE IF NOT EXISTS contact_message (
  id            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  name          VARCHAR(64)   NOT NULL                COMMENT '姓名，≤30',
  phone         VARCHAR(32)   NOT NULL                COMMENT '手机号，11 位',
  demand        VARCHAR(1000) NOT NULL                COMMENT '需求描述，5-500',
  is_read       TINYINT       NOT NULL DEFAULT 0      COMMENT '1 已读 0 未读',
  source_page   VARCHAR(64)   DEFAULT NULL            COMMENT '来源页面',
  ip_address    VARCHAR(64)   DEFAULT NULL            COMMENT '来源 IP，限流用',
  remark        VARCHAR(500)  DEFAULT NULL            COMMENT '管理员备注',
  create_time   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_read (is_read, create_time),
  KEY idx_create (create_time)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '访客留言';

-- 10. 站点文案 KV（物理删除 + 整组替换，避免唯一键与被删记录冲突）
CREATE TABLE IF NOT EXISTS site_content (
  id             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  content_group  VARCHAR(64)  NOT NULL                COMMENT '分组 hero/advantage/process/faq/nav/footer/cta/contact/pricing_terms/banner/global',
  content_key    VARCHAR(128) NOT NULL                COMMENT '键名，首段为数字时表示列表项',
  content_value  TEXT                                 COMMENT '文本值',
  image_url      VARCHAR(512) DEFAULT NULL            COMMENT '配套图片 URL',
  value_type     VARCHAR(16)  NOT NULL DEFAULT 'text' COMMENT '值类型 text/image/url/switch',
  label          VARCHAR(128) DEFAULT NULL            COMMENT '后台表单中文名',
  sort_order     INT          NOT NULL DEFAULT 0      COMMENT '排序，升序',
  create_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_group_key (content_group, content_key),
  KEY idx_group (content_group, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '站点文案 KV';

-- 11. 上传文件（物理删除，同时删磁盘文件）
CREATE TABLE IF NOT EXISTS upload_file (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  file_name     VARCHAR(255) NOT NULL                COMMENT '原始文件名，仅展示',
  store_name    VARCHAR(255) NOT NULL                COMMENT '存储名 UUID.ext，唯一',
  file_path     VARCHAR(512) NOT NULL                COMMENT '容器内绝对路径',
  file_url      VARCHAR(512) NOT NULL                COMMENT '相对访问地址 /uploads/yyyy/MM/uuid.ext',
  file_size     BIGINT       NOT NULL DEFAULT 0      COMMENT '字节数',
  mime_type     VARCHAR(64)  DEFAULT NULL            COMMENT 'MIME 类型',
  width         INT          DEFAULT NULL            COMMENT '图片宽度',
  height        INT          DEFAULT NULL            COMMENT '图片高度',
  uploader_id   BIGINT       DEFAULT NULL            COMMENT '上传者管理员 ID',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_store (store_name),
  KEY idx_create (create_time)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '上传文件';
