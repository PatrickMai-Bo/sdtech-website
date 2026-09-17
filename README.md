# 顺德分布式科技艺术有限公司 — 企业官网

企业官网一站式交付：前台展示站（8 个页面）+ 后台管理系统（7 个模块）。

**核心特性：所有文案、图片、报价、店铺链接全部由数据库驱动，在后台可视化替换，保存后前台刷新即生效，不用改代码、不用重新构建。**

---

## 一、项目简介

| 项 | 内容 |
| --- | --- |
| 前台展示站 | 首页、网页开发、美工设计、视频剪辑、办公定制、案例作品、合作报价、联系我们（共 8 页） |
| 后台管理系统 | 首页内容、业务管理、案例管理、报价管理、店铺链接、留言管理、修改密码（共 7 个模块） |
| 前端 | 多页面纯 HTML + Tailwind CSS + 原生 JavaScript（无构建、无框架、无 npm 运行时依赖） |
| 后端 | Spring Boot 3.2.5 + Java 17 + MyBatis-Plus 3.5.7 + MySQL 8.0 + Maven |
| 部署 | Docker + Docker Compose（nginx + app + mysql 三容器），对外仅暴露 80 端口 |

设计要点：

- **同源零跨域**：nginx 托管静态页，`/api/**` 反向代理到后端，前端 API 基址恒为相对路径 `/api`。
- **后台鉴权**：Session + Cookie（HttpOnly + SameSite=Lax），有效时长 8 小时，不使用 JWT。
- **管理员凭据**：由环境变量注入，应用首次启动播种并 BCrypt 加密落库，**种子 SQL 不插管理员，全仓库无明文密码**。
- **内容零缓存**：HTML 与接口响应均设为不缓存，保证「后台保存 → 前台刷新即生效」零偏差。

---

## 二、在线访问地址

> 已实际部署上线，可直接访问。

| 用途 | 地址 |
| --- | --- |
| 前台首页 | http://106.52.219.144/ |
| 后台登录 | http://106.52.219.144/admin/login.html |
| 健康检查 | http://106.52.219.144/api/public/health |

健康检查返回示例：

```json
{ "code": 0, "message": "成功", "data": { "status": "UP", "time": "2026-09-16 16:30:00" } }
```

---

## 三、目录结构说明

```
sdtech/
├── README.md                  # 本文档
├── docker-compose.yml         # 三容器编排（nginx / app / mysql）
├── tailwind.config.js         # Tailwind 扫描配置（新增 class 后重新预编译用）
├── .env.example               # 环境变量模板（复制为 .env 后改密码）
├── .dockerignore              # 镜像构建上下文排除项
├── .gitignore                 # Git 忽略（target / uploads / .env / node_modules 等）
│
├── backend/                   # 后端 Spring Boot 工程
│   ├── pom.xml                # Maven 依赖（Spring Boot 3.2.5 / MyBatis-Plus 3.5.7）
│   └── src/main/
│       ├── java/com/sdtech/website/
│       │   ├── WebsiteApplication.java   # 启动入口（@MapperScan + @EnableScheduling）
│       │   ├── common/                   # Result / ResultCode / BusinessException
│       │   │                             # GlobalExceptionHandler / MetaObjectHandler
│       │   │                             # PageVO / SessionContext
│       │   ├── config/                   # WebMvcConfig（拦截器 + 上传映射 + 密码编码器）
│       │   │                             # MybatisPlusConfig（分页插件）
│       │   │                             # JacksonConfig（时间格式 yyyy-MM-dd HH:mm:ss）
│       │   │                             # AdminAuthInterceptor（后台鉴权）
│       │   │                             # AdminSeedRunner（管理员播种）
│       │   ├── util/                     # IpUtil / RateLimiter / ValidatorUtil
│       │   ├── entity/                   # 11 张表对应的实体类
│       │   ├── mapper/                   # 11 个 MyBatis-Plus Mapper
│       │   ├── dto/req/                  # 12 个请求 DTO（含 @Valid 校验注解）
│       │   ├── dto/vo/                   # 18 个响应 VO
│       │   ├── service/ + service/impl/  # 9 组业务服务接口与实现
│       │   └── controller/               # 6 个公开控制器 + 8 个后台控制器
│       └── resources/
│           ├── application.yml           # 数据源 / Session / 上传 / 播种配置
│           └── logback-spring.xml        # 日志配置
│
├── frontend/                  # 前端（nginx 静态根）
│   ├── index.html             # 前台：首页
│   ├── web.html               # 前台：网页开发
│   ├── design.html            # 前台：美工设计
│   ├── video.html             # 前台：视频剪辑
│   ├── office.html            # 前台：办公定制
│   ├── cases.html             # 前台：案例作品
│   ├── pricing.html           # 前台：合作报价
│   ├── contact.html           # 前台：联系我们
│   ├── admin/                 # 后台：8 个页面（index/home/services/cases/pricing/
│   │   │                      #            shops/messages/login）
│   │   └── assets/            # 后台专用 JS（按模块拆分）
│   └── assets/
│       ├── css/               # tailwind.min.css（预编译产物，已入库）
│       │                      # tailwind.src.css（源入口）/ app.css / admin.css
│       ├── js/                # api.js / ui.js / layout.js 及各页面脚本
│       └── img/               # favicon.svg / placeholder.svg 及图标
│
├── sql/
│   ├── 01-schema.sql          # 建库 + 11 张表（全部 IF NOT EXISTS，可重复执行）
│   └── 02-data.sql            # 种子数据（业务/案例/报价/店铺/全站文案 KV）
│
├── docker/
│   ├── Dockerfile             # 多阶段构建：maven:3.9-17 编译 → temurin:17-jre 运行
│   └── maven-settings.xml     # 腾讯 Maven 镜像（服务器无法访问官方源时使用）
│
├── nginx/
│   └── default.conf           # 静态托管 + /api 反代 + /uploads 直出 + gzip + 缓存策略
│
└── docs/
    ├── PRD.md                 # 产品需求文档
    └── DESIGN.md              # 系统设计 & 任务分解（权威设计文档）
```

---

## 四、Docker 部署步骤（推荐）

### 4.1 前置条件

- Linux 服务器（推荐 Ubuntu 20.04+ / CentOS 7+）
- Docker 20.10+ 与 Docker Compose v2（`docker compose version` 可查）
- 服务器安全组放行 **80 端口**（如需 HTTPS 再放行 443）

### 4.2 部署命令

```bash
# 1) 上传整个项目目录到服务器（例如 /opt/sdtech），进入目录
cd /opt/sdtech

# 2) 生成 .env 并修改密码（务必执行，见第七节）
cp .env.example .env
vi .env

# 3) 构建并后台启动（首次会编译后端，约 3-10 分钟）
docker compose up -d --build

# 4) 查看容器状态，三个容器都应为 Up / healthy
docker compose ps

# 5) 访问
#    前台   http://服务器IP/
#    后台   http://服务器IP/admin/login.html
```

### 4.3 三个容器与两个数据卷

| 容器 | 端口 | 说明 |
| --- | --- | --- |
| `sdtech-nginx` | **80:80（唯一对外暴露）** | 托管 `frontend/` 静态页；`/api/` 反代到 app；`/uploads/` 直出上传图片 |
| `sdtech-app` | 8080（内网，调试用映射） | Spring Boot 后端；上线后如端口冲突，可注释 compose 中 `app.ports` 整段，对外只经 nginx |
| `sdtech-mysql` | **仅内网 3306，不映射主机** | MySQL 8.0；**刻意不映射主机 3306**，避免与服务器上已有 MySQL 服务冲突 |

命名卷（数据持久化，`docker compose down` 不会丢失）：

| 卷 | 挂载点 | 内容 |
| --- | --- | --- |
| `sdtech-mysql-data` | `/var/lib/mysql` | 数据库文件 |
| `sdtech-uploads` | app `/app/uploads` ↔ nginx `/var/www/uploads` | 后台上传的图片（两容器共享同一卷） |

其他：`TZ=Asia/Shanghai` 三个容器统一；`app` 通过 `depends_on: service_healthy` 等待 MySQL 健康检查通过后再启动。

### 4.4 常用命令

```bash
# 实时看后端日志（排查问题首选）
docker compose logs -f app

# 看 nginx / mysql 日志
docker compose logs -f nginx
docker compose logs -f mysql

# 重启某个服务（改了 nginx 配置后）
docker compose restart nginx

# 停止（保留数据卷）
docker compose down

# 停止并删除数据卷（会清空数据库与上传图片，慎用！）
docker compose down -v

# 改了后端代码后重新构建并启动
docker compose up -d --build app

# 进入 MySQL 命令行
docker compose exec mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" sdtech

# 查看各容器资源占用
docker compose stats
```

---

## 五、本地部署步骤（无 Docker）

### 5.1 环境要求

- JDK 17、Maven 3.8+、MySQL 8.0

### 5.2 建库与导入数据

```bash
# 建库（utf8mb4_unicode_ci，与 01-schema.sql 保持一致）
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS sdtech DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;"

# 导入表结构与种子数据
mysql -uroot -p sdtech < sql/01-schema.sql
mysql -uroot -p sdtech < sql/02-data.sql
```

Windows 本机（在 `sql/` 所在目录执行，或用绝对路径）：

```bash
mysql -uroot -p sdtech < C:/path/to/sdtech/sql/01-schema.sql
mysql -uroot -p sdtech < C:/path/to/sdtech/sql/02-data.sql
```

### 5.3 环境变量与启动

```bash
# Linux / macOS
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=请改成强密码
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/sdtech?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false"
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=你的数据库密码
export UPLOAD_DIR=./uploads        # 本地上传目录，可选

cd backend
mvn spring-boot:run
```

Windows PowerShell：

```powershell
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="请改成强密码"
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/sdtech?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="你的数据库密码"
$env:UPLOAD_DIR="C:/temp/sdtech-uploads"

cd backend
mvn spring-boot:run
```

### 5.4 前端必须用反向代理访问（重要）

前端所有接口都是**同源相对路径 `/api`**，因此：

> **⚠️ 直接双击打开 `frontend/index.html`（file:// 协议）会因 `/api` 请求 404 而只显示兜底内容（"内容加载中 / 加载失败"）。本地调试必须走 HTTP 反向代理。**

方式一：只用 Docker 起依赖，前端仍由本地后端提供服务

```bash
# 只起 mysql（本地后端连它），前端由 nginx 或本地后端托管
docker compose up -d mysql
```

方式二：本机 nginx 反代（把下面配置加入 `nginx.conf` 的 `http{}` 内，或替换 `nginx/default.conf` 后单独运行 nginx）

```nginx
server {
    listen 80;
    server_name localhost;

    # 静态页面根：指向本地 frontend 目录
    root   C:/path/to/sdtech/frontend;   # Linux 改成 /opt/sdtech/frontend
    index  index.html;

    # 上传图片（与 UPLOAD_DIR 对应）
    location /uploads/ {
        alias C:/temp/sdtech-uploads/;
    }

    # 接口反代到本地 Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

然后浏览器访问 `http://localhost/`。

---

## 六、数据库导入方法

三种方式，任选其一：

### 6.1 Docker 首次启动自动导入（推荐）

`docker-compose.yml` 把 `./sql` 挂载到 MySQL 容器的 `/docker-entrypoint-initdb.d`，MySQL **仅当数据卷为空时**自动按文件名顺序执行：

1. `01-schema.sql` —— 建库 + 11 张表
2. `02-data.sql` —— 种子数据

两个脚本均幂等：建表用 `IF NOT EXISTS`；结构化数据用「显式主键 + `ON DUPLICATE KEY UPDATE`」；`site_content` 用「逐组 `DELETE` + `INSERT`」。重复执行不会报错、不会产生重复数据。

> 注意：数据卷一旦有数据，重启不会再执行导入。如需重置，先 `docker compose down -v` 清空卷（**会丢失全部数据**）。

### 6.2 手动导入

```bash
mysql -uroot -p sdtech < sql/01-schema.sql
mysql -uroot -p sdtech < sql/02-data.sql
```

Docker 环境内：

```bash
docker compose exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" sdtech < sql/01-schema.sql
docker compose exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" sdtech < sql/02-data.sql
```

### 6.3 管理员表（admin_user）不导入

**种子 SQL 故意不包含任何管理员账号。** 管理员由后端 `AdminSeedRunner` 在应用启动时创建：

- 读取环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- 仅当 `admin_user` 表为空时创建一条记录
- 密码经 **BCrypt** 加密后落库，数据库中永无明文密码
- 日志只打印账号，绝不打印密码

---

## 七、后台账号说明

| 项 | 说明 |
| --- | --- |
| 默认账号 | `admin`（由 `.env` 的 `ADMIN_USERNAME` 决定） |
| 默认密码 | **来自 `.env` 的 `ADMIN_PASSWORD`，请务必修改** |
| 创建时机 | 应用首次启动自动创建（`admin_user` 表非空则跳过） |
| 密码强度 | 建议 12 位以上，含大小写字母 + 数字 + 符号，且不要与其他站点复用 |
| 会话时长 | 8 小时；**容器重启后需要重新登录**（已知权衡：Session 保存在内存中，未做持久化） |

安全建议：

1. 部署前把 `.env` 里的 `ADMIN_PASSWORD` 改成你自己的强密码，**不要使用 `admin123` 之类默认值**。
2. 首次登录后建议立刻在「修改密码」中再改一次，并定期更换口令。
3. 若忘记密码，可停掉应用、删除 `admin_user` 表中的记录、改好 `.env` 后重启，系统会用新密码重新播种。

---

## 八、素材替换指引（最常用）

### 8.1 入口

登录后台 → 左侧导航：

| 后台菜单 | 对应页面 | 管什么 |
| --- | --- | --- |
| 首页内容 | `admin/home.html` | 全站文案与图片（11 个分组） |
| 业务管理 | `admin/services.html` | 8 项业务卡、细分服务、交付物 |
| 案例管理 | `admin/cases.html` | 案例项目、封面图、多图、精选开关 |
| 报价管理 | `admin/pricing.html` | 8 项报价（名称 / 价格 / 单位 / 说明） |
| 店铺链接 | `admin/shops.html` | 微信 / 闲鱼 / 淘宝 / 拼多多入口与二维码 |
| 留言管理 | `admin/messages.html` | 访客留言查看、已读标记、删除 |

### 8.2 图片有两种改法

后台所有图片字段都同时提供两种输入方式：

1. **上传本地图片**：点「上传图片」按钮选择文件
   - 单文件 **≤ 5MB**
   - 支持格式：**jpg / jpeg / png / webp / gif / svg**
   - 上传后自动重命名为 `UUID.ext`，落在 `/uploads/yyyy/MM/` 下，并回填图片地址
2. **直接粘贴图片 URL**：在图片地址输入框里粘贴外链（如 CDN 地址）即可，不占服务器空间

> 提示：SVG 允许上传，但 SVG 可内嵌脚本，**只上传自己制作或可信来源的 SVG**。

### 8.3 各模块替换对照表

| 想改什么 | 去哪改 | 具体位置 |
| --- | --- | --- |
| 首页主视觉背景图 | 首页内容 → **首页主视觉（hero）** | `background_image` 字段 |
| 首页主标题 / 副标题 / 按钮 | 首页内容 → **首页主视觉（hero）** | `title` / `subtitle` / `description` / 两个按钮文案与链接 |
| 核心优势（4 条） | 首页内容 → **核心优势（advantage）** | 每条有 `标题 / 说明 / 图标` |
| 合作流程（6 步） | 首页内容 → **合作流程（process）** | 每步有 `标题 / 说明` |
| 常见问题（5 条） | 首页内容 → **常见问题（faq）** | 每条有 `问题 / 答案` |
| 底部咨询区背景与文案 | 首页内容 → **底部咨询区（cta）** | `title` / `description` / 按钮 / `background_image` |
| 各页 Banner 标题副标题 | 首页内容 → **各页横幅（banner）** | `web/design/video/office/cases/pricing/contact` 各自的 `.title` `.subtitle` |
| 导航栏 8 个菜单 | 首页内容 → **导航（nav）** | 每项有 `名称 / 链接` |
| 页脚简介 | 首页内容 → **页脚（footer）** | `company_intro` / `social_note` |
| **备案号 / 电话 / 邮箱 / 微信号 / 地址** | 首页内容 → **全站信息（global）** | `icp` / `phone` / `email` / `wechat_id` / `address` / `copyright` |
| **微信二维码** | 首页内容 → **联系我们（contact）** 的 `wechat_qrcode`，或 **店铺链接** 里微信那条 | 二选一即可，后者全站生效 |
| 业务卡片图与文案 | **业务管理** | 每条业务的封面图、名称、介绍 |
| 细分服务与交付物 | **业务管理** | 选中业务后管理其细分项与交付物 |
| 案例封面与多图 | **案例管理** | 案例编辑页可增删图片、设置封面、切换精选 |
| 报价项与价格 | **报价管理** | 改完前台报价页与业务页同步生效 |
| 店铺 / 联系方式链接 | **店铺链接** | 改完首页、页脚、联系页、咨询区**全站生效** |

### 8.4 默认占位图

- 默认图片来自 `picsum.photos`（使用固定 seed，保证每次刷新同一张图，不会乱跳）。
- 图片加载失败时会自动降级到本地 `frontend/assets/img/placeholder.svg`，页面不会出现破图。
- 上线前建议把占位图全部替换成自己的真实素材。

### 8.5 建议图片尺寸

| 位置 | 建议尺寸 | 比例 |
| --- | --- | --- |
| 首页 Hero 背景 | 1600 × 900 | 16:9 |
| 业务卡片图 | 800 × 600 | 4:3 |
| 案例封面 / 案例多图 | 800 × 600 | 4:3 |
| 微信二维码 | 400 × 400 | 1:1 |
| Logo / favicon | 200 × 200 | 1:1 |

### 8.6 生效范围

- 所有内容改动**保存后全局生效**，前台**刷新页面即可看到**，无需重新构建、无需重启容器。
- HTML 与接口响应均设置了不缓存；若浏览器仍显示旧内容，用 `Ctrl + F5` 强制刷新。

---

## 九、Tailwind CSS 说明

本项目采用**预编译模式**：`frontend/assets/css/tailwind.min.css` 已生成并入库，线上与离线环境都不依赖 CDN、不需要 npm 运行时。

### 9.1 什么时候需要重新编译

**只要你修改了 HTML / JS 并新增了 Tailwind 工具类**（例如新写了 `md:grid-cols-4`、`bg-brand-600` 等原来没用过的 class），就必须在本机重新预编译，否则新样式不会出现在 CSS 里：

```bash
# 在项目根目录执行（需要 Node.js 环境）
npx --yes tailwindcss@3 -c tailwind.config.js -i frontend/assets/css/tailwind.src.css -o frontend/assets/css/tailwind.min.css --minify
```

编译完成后，把新的 `tailwind.min.css` 一起重新部署：

```bash
docker compose up -d --build nginx
# 或直接重启（nginx 是目录挂载，重启即可）
docker compose restart nginx
```

### 9.2 离线环境改用 CDN 模式

如果服务器完全离线、且不想在本机预编译，可改用 CDN 模式。把各 HTML 中 Tailwind 的引用替换为下面 3 行（以 `frontend/index.html` 为例，其余页面同样处理）：

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { theme: { extend: { colors: { brand: '#2563eb' } } } };
</script>
<link rel="stylesheet" href="/assets/css/app.css">
```

> **⚠️ 二选一，禁止混用**：预编译模式与 CDN 模式只能选一种。同时引入会导致样式重复、体积翻倍，且 CDN 的 JIT 与本地产物可能冲突。
>
> 另外：CDN 模式依赖外网，且首次加载会有样式闪动（FOUC），仅建议在临时演示或内网无构建环境时使用。生产环境推荐预编译模式。

---

## 十、常见问题 FAQ

### Q1 页面显示"内容加载中 / 加载失败"，或数据出不来怎么排查？

按顺序排查：

1. 访问 `http://服务器IP/api/public/health`，能返回 `{"code":0,...,"status":"UP"}` 说明后端活着。
2. 若健康检查 502 / 504：看后端日志 `docker compose logs -f app`，多半是数据库连接失败或还在启动（首次启动约需 10-30 秒）。
3. 若健康检查正常但页面仍空白：打开浏览器 F12 → Network，看 `/api/public/site/content` 的返回；再切到 Console 看是否有 JS 报错。
4. 确认是通过 **http://** 访问的，而不是双击文件（`file://` 协议下 `/api` 必然 404，详见 5.4）。

### Q2 图片不显示怎么办？

- 外链图片：确认服务器能访问该外链（服务器在国内，部分境外图床可能不通），建议在后台改为**上传本地图片**。
- 上传的图片：确认命名卷挂载正常（`docker compose exec app ls /app/uploads`），且 nginx 能读到（`docker compose exec nginx ls /var/www/uploads`）。
- 图片会先请求外链，失败后自动降级到 `placeholder.svg`；若连占位图都不显示，说明 `frontend/assets/img/` 未正确挂载。

### Q3 后台一进去就跳回登录页 / 一直 401？

- 这是**未登录或会话过期**的正常行为：后台页面加载时会先请求 `GET /api/admin/auth/profile`，返回 401 就跳转登录页。
- Session 有效期 8 小时，超时重新登录即可。
- **容器重启后需要重新登录**（Session 在内存中）。
- 若刚登录就跳回：检查浏览器是否禁用了 Cookie，或是否通过不同域名/IP 混着访问（换域名会产生新 Cookie）。

### Q4 后台改了内容，前台刷新没变化？

- 先 `Ctrl + F5` 强制刷新（HTML 已设为不缓存，通常是浏览器本地缓存或 CDN 缓存）。
- 确认后台点了「保存」并提示成功。
- 直接查接口验证数据是否落库：`http://服务器IP/api/public/site/content`。
- 若数据已更新但页面没变，检查是否改错了分组（例如改了 `hero` 却去看 `banner`）。

### Q5 上传图片失败？

常见原因：

- **超过 5MB**：nginx 限制 `client_max_body_size 6m`，后端限制 5MB，压缩后再传。
- **格式不支持**：仅支持 jpg / jpeg / png / webp / gif / svg。
- **卷权限不足**：进入容器检查 `docker compose exec app ls -ld /app/uploads`，应可写；若不可写，执行 `docker compose exec app chmod 755 /app/uploads`。
- 看后端日志定位具体原因：`docker compose logs -f app`。

### Q6 想换端口（80 被占用）怎么办？

修改 `docker-compose.yml` 中 nginx 的端口映射，例如改成 8081：

```yaml
  nginx:
    ports:
      - "8081:80"      # 主机 8081 → 容器 80
```

然后 `docker compose up -d nginx`，访问 `http://服务器IP:8081/`。

> 同理，若主机 8080 被占用，把 `app` 的 `ports` 整段注释掉即可（对外只经 nginx 反代，更安全）。

### Q7 备案号、电话、邮箱、地址这些占位内容在哪改？

后台 → **首页内容** → 展开「**全站信息（global）**」分组，里面有：

- `company_name` 公司全称
- `phone` 电话
- `email` 邮箱
- `wechat_id` 微信号
- `address` 联系地址
- `icp` 备案号（默认"备案号：待填写"）
- `copyright` 版权信息

种子数据统一使用「待补充 / 待填写」占位，**上线前请全部替换为真实信息**。

---

## 十一、安全建议

上线前请逐项确认：

1. **修改 `.env` 中所有密码**：`MYSQL_ROOT_PASSWORD`、`MYSQL_PASSWORD`、`ADMIN_PASSWORD` 全部替换成强密码（12 位以上，含大小写 + 数字 + 符号）。
2. **不要把 `.env` 提交到仓库**：`.env` 已在 `.gitignore` 中；仓库里只保留 `.env.example`（无真实密钥）。
3. **定期更换后台口令**：建议每 3 个月更换一次 `ADMIN_PASSWORD`，并重启 app 容器生效；如支持，可在后台「修改密码」中直接改。
4. **服务器安全组只开必要端口**：生产环境只放行 **80 / 443**，以及 SSH（建议改非 22 端口 + 密钥登录）。**不要对外开放 3306 与 8080**（本项目的 compose 已按此配置：MySQL 不映射主机，app 的 8080 仅用于调试）。
5. **启用 HTTPS**：正式对外建议使用 Let's Encrypt 免费证书，在 nginx 层终结 TLS，并把 80 重定向到 443。
6. **及时备份**：定期备份命名卷 `sdtech-mysql-data`（数据库）与 `sdtech-uploads`（上传图片）。
7. **谨慎上传 SVG**：SVG 可内嵌脚本，只上传可信来源的 SVG 文件。

---

## 附：接口一览

- 公开接口 **16 个**：健康检查、全站 KV、FAQ、流程、优势、业务列表/详情/细分项、案例列表/精选/分类/详情、报价列表/按业务、店铺链接、提交留言。
- 后台接口 **43 个**：鉴权（4）、站点内容（2）、上传（3）、业务与细分项与交付物（13）、案例（8）、报价（4）、店铺（4）、留言（5）。

完整的接口路径、请求体与返回结构见 `docs/DESIGN.md` 第 6 章。
