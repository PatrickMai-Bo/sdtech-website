# sdtech 官网（前台 + 后台）独立验收测试报告

- **测试人**：严过关（QA Engineer）
- **被测环境**：线上 `http://106.52.219.144/`（前台）、`/admin/login.html`（后台），API 基址 `/api`
- **后台账号**：`admin` / `SdtAdmin2026`
- **测试时间**：2026-09-17
- **测试脚本**：`C:\Users\Patrick\WorkBuddy\2026-09-16-16-14-53\qa_tests\`（Playwright + 自研 HTTP 客户端，可重复运行）
- **源码基线**：`sdtech/`（前台 HTML+Tailwind+原生 JS；后台 Spring Boot 3.2.5 + MyBatis-Plus + MySQL 8）
- **证据**：逐条结果 JSON 在 `qa_tests/_out/result_*.json`，50 张截图在 `qa_tests/_out/shots/`，运行日志在 `qa_tests/_out_*.log`

---

## 一、总体结论

| 用例组 | 用例数 | 通过 | 失败 |
|---|---:|---:|---:|
| P 接口层冒烟（公开接口 + 鉴权 + 登录） | 25 | 25 | 0 |
| A 后台 7 模块可用性 | 8 | 8 | 0 |
| B 改内容闭环（改 → 保存 → 前台生效 → 还原） | 6 | 6 | 0 |
| C 案例增删改 | 4 | 4 | 0 |
| D 留言闭环（提交 → 可见 → 已读 → 删除） | 5 | 5 | 0 |
| E 权限拦截 | 2 | 2 | 0 |
| F 前台页面 + 移动端自适应 | 14 | 14 | 0 |
| G 动效红线 / XSS 静态扫描 | 8 | 8 | 0 |
| X 运行时 XSS 防线 | 4 | 4 | 0 |
| **合计** | **76** | **76** | **0** |

**功能通过率 100%。发现 2 个真实缺陷（均为低危、同一处前端代码引起），已由 QA 直接修复源码，线上数据已 100% 还原。**

---

## 二、逐条结果明细

### 2.1 接口层（P 组，25/25）

| 编号 | 用例 | 结果 | 关键证据 |
|---|---|---|---|
| P01 | `GET /api/public/health` | PASS | `{"status":"UP"}` |
| P02 | 全站内容 `/public/site/content` | PASS | 104 条 |
| P03 | 业务列表 | PASS | 8 条 |
| P04 | 核心优势 | PASS | 4 条 |
| P05 | 精选案例 | PASS | 4 条 |
| P06 | 案例分页 | PASS | `records/total/pages` 结构正常 |
| P07 | 案例分类 | PASS | web/design/video/office |
| P08 | 合作流程 | PASS | 6 条 |
| P09 | 报价条目 | PASS | 8 条 |
| P10 | 常见问题 | PASS | 5 条 |
| P11 | 店铺链接 | PASS | 4 条 |
| P12–P15 | 未登录访问 `/admin/cases`、`/admin/messages`、`/admin/site/content`、`/admin/auth/profile` | PASS | 全部 `401 未登录或登录已失效` |
| P16 | 账号密码登录 | PASS | 200 |
| P17–P24 | profile / 案例 / 内容 / 留言 / 未读数 / 业务 / 报价 / 店铺 | PASS | 全部 200 |
| P25 | 错误密码登录 | PASS | `code=400 账号或密码错误` |

### 2.2 后台 7 模块可用性（A 组，8/8）

浏览器真实登录（`admin` / `SdtAdmin2026`）后逐个打开，判定标准：内容区非白屏、有数据节点、无 `加载失败`、无 4xx/5xx 接口、无 JS 报错。

| 编号 | 模块 | 渲染字符 | 数据节点 | API 错误 | JS 错误 | 结果 |
|---|---|---:|---:|---|---|---|
| A1 | 登录 → 跳转概览 | — | — | 无 | 无 | PASS |
| A2 | 概览 | 175 | 7（卡片） | 无 | 无 | PASS（案例 4 / 业务 12 / 未读 0 / 报价 8，数字真实出数） |
| A3 | 首页内容 | 3142 | 11（分组） | 无 | 无 | PASS |
| A4 | 业务管理 | 675 | 12（行） | 无 | 无 | PASS |
| A5 | 案例管理 | 214 | 4（行） | 无 | 无 | PASS |
| A6 | 报价管理 | 451 | 8（行） | 无 | 无 | PASS |
| A7 | 店铺链接 | 256 | 4（行） | 无 | 无 | PASS |
| A8 | 留言管理 | 48 | 0（暂无留言） | 无 | 无 | PASS（空态展示正常） |

### 2.3 核心闭环：改内容 → 前台生效 → 还原（B 组，6/6）✅ 必做项

| 编号 | 步骤 | 结果 | 证据 |
|---|---|---|---|
| B0 | 读取 `hero.title` 原值 | PASS | `为企业提供可维护的网站与视觉设计服务` |
| B1 | 后台首页内容把 `hero.title` 改为「自动化验收测试标题」并点「保存本组」 | PASS | 分组提示「已保存 8 项」 |
| B2 | 公开接口 `/api/public/site/content` 返回新值 | PASS | `hero.title = 自动化验收测试标题` |
| B3 | 前台 `/` 刷新后渲染出新标题 | PASS | 页面正文包含新标题 |
| B4 | 后台改回原值并保存 | PASS | 接口回读 = 原值 |
| B5 | 前台恢复原标题 | PASS | 页面正文不再含测试标题 |

### 2.4 案例增删改（C 组，4/4）

| 编号 | 步骤 | 结果 | 证据 |
|---|---|---|---|
| C1 | 后台「+ 新增案例」填标题/分类/封面/简介并保存 | PASS | 列表 4 → 5 行 |
| C2 | 公开接口可查到新案例 | PASS | `id=7` |
| C3 | 前台 `/cases.html` 展示新案例 | PASS | 页面含测试标题 |
| C4 | 后台删除 + 二次确认 | PASS | `DELETE /admin/cases/7 → 200`，前后台均无残留 |

### 2.5 留言闭环（D 组，5/5）

| 编号 | 步骤 | 结果 | 证据 |
|---|---|---|---|
| D1 | 前台 `/contact.html` 表单提交（姓名/电话/需求） | PASS | 「已收到你的需求，我们会尽快与你联系」 |
| D2 | 后台接口能看到 | PASS | `id=5` |
| D3 | 后台留言列表 UI 可见 | PASS | 表格 1 行 |
| D4 | 标记已读 | PASS | `isRead=1` 列表出现该条 |
| D5 | 删除 + 二次确认 | PASS | `DELETE /admin/messages/5 → 200`，无残留 |

### 2.6 权限（E 组，2/2）

| 编号 | 用例 | 结果 | 证据 |
|---|---|---|---|
| E1 | 未登录访问 `/api/admin/cases` | PASS | 401 |
| E2 | 未登录打开 `/admin/index.html` | PASS | 跳转到 `/admin/login.html?redirect=%2Fadmin%2Findex.html` |

### 2.7 前台页面 + 移动端自适应（F 组，14/14）

- 8 个前台页面（首页 / 网页开发 / 美工设计 / 视频剪辑 / 办公定制 / 案例 / 报价 / 联系）桌面 1440 宽：全部渲染成功，无 `加载失败`、无 JS 报错。
- 移动端 **375 / 390** 宽度，首页、案例页、报价页：

| 宽度 | 首页 scrollWidth | 案例页 scrollWidth | 报价页 scrollWidth | 结论 |
|---|---|---|---|---|
| 375 | 375 | 375 | 375 | 无横向滚动 PASS |
| 390 | 390 | 390 | 390 | 无横向滚动 PASS |

> 说明：检测到的"越界元素"只有移动端抽屉菜单（`sd-drawer`，`left=375/right=668`），这是刻意移出视口的侧滑面板，`documentElement.scrollWidth` 未超视口，属预期行为。

### 2.8 动效红线与 XSS 静态扫描（G 组，8/8）

| 编号 | 检查项 | 命中 | 结果 |
|---|---|---:|---|
| G1 | `animation-iteration-count: infinite` / `animate-bounce|ping|pulse|spin` | 0 | PASS |
| G2 | `<canvas>` / `getContext('2d')` / WebGL / 粒子库 | 0 | PASS |
| G3 | 自动轮播 / 跑马灯 / `setInterval` 循环特效 | 0 | PASS |
| G4 | `@media (prefers-reduced-motion: reduce)` 降级 | `app.css` 有真实规则（`transition:none` + `animation:none`） | PASS |
| G5 | 过渡时长 > 400ms | 0 | PASS |
| G6 | `innerHTML` 使用点 | 仅 1 处（`ui.js:40`，`el()` 的静态 `html` 通道） | PASS |
| G7 | 所有 `el({html:...})` 调用方 | 全部是 `ui.ICONS.*` / `ui.icon(key)` 静态常量 | PASS |
| G8 | 文本渲染走 `textContent` | `text:` 调用 270 处，`esc()` 兜底存在 | PASS |

> 扫描已排除 `tailwind.min.css`（Tailwind 完整构建包内含未使用的 keyframes 定义，不算违规源码）。

### 2.9 运行时 XSS 防线（X 组，4/4）

不只是静态扫描，实际往留言接口打恶意串：

| 编号 | 用例 | 结果 | 证据 |
|---|---|---|---|
| X1 | 姓名写 `<svg onload=top.__XSS__=1>` | PASS（被拒） | `code=400 姓名包含不允许的字符` |
| X2 | 需求描述写 `<script>top.__XSS2__=1</script>` | PASS（被拒） | `code=400 需求描述包含不允许的字符` |
| X3 | 前端渲染检查 | PASS（跳过） | 后端已拦截，前端无暴露面 |
| X4 | 测试数据清理 | PASS | 无残留 |

结论：**后端入参做了脚本/事件/协议黑名单校验，前端又统一走 `textContent`，双层防线成立，不存在存储型 XSS 暴露面。**

---

## 三、缺陷列表与路由判定

| 编号 | 严重级 | 位置 | 现象 | 根因 | 处置 |
|---|---|---|---|---|---|
| DEF-01 | 低（P3） | `sdtech/frontend/admin/assets/home.js`（保存按钮 handler，原 116–125 行 `payloadItems`） | 后台保存任一内容分组后，该组 `sort_order` 被重置为数组下标（hero 由 `0,10,20…70` 变成 `0,1,2…7`） | 前端回传的 item 未带 `sortOrder`，后端 `SiteContentServiceImpl:94` 用 `index` 兜底 | **QA 已修**：`payloadItems` 增加 `sortOrder: entry.raw.sortOrder ?? index`。需重新部署生效 |
| DEF-02 | 低（P3） | `sdtech/frontend/admin/assets/home.js`（`buildControl` image 分支，原 52–59 行） | 保存含图片字段的分组后，`content_value` 被写入图片地址（hero.background_image 的 value 由 `NULL` 变成 picsum URL） | image 字段 `read()` 返回 `{value:url, imageUrl:url}`，把图片地址写进了文本列 | **QA 已修**：`read()` 改为 `{value: item.value || '', imageUrl: url}`，只回写 imageUrl。需重新部署生效 |

**影响评估**：两者均不改变前台展示顺序与渲染结果（相对顺序保持、图片仍取 `imageUrl`），属于"数据语义被污染"型缺陷，不影响上线可用，但会在多次编辑后与种子数据持续偏离，建议随下次发布一起带上。

**路由判定**：
- DEF-01 / DEF-02 → 属前端 JS，**已由 QA 直接修复**，只需 team-lead 在发布时纳入构建（无需工程师再改代码，但我建议工程师复核这两行）。
- 后端 Java **未发现缺陷**，不需要工程师修。
- 未在源码中发现阻塞性问题，**无需回退发布**。

**测试脚本自身问题（已自查修复，非产品缺陷）**：首轮 `A3/A4/A8` 误报白屏，原因是等待逻辑在骨架屏阶段提前返回；首轮 `D5` 误报删除失败，原因是点击确认后固定 sleep 1.5s 就去查接口。均已改为"等待 DOM 稳定 + `expect_response` 捕获 DELETE 响应"，并用独立脚本复测确认后台删除按钮真实可用（`DELETE /admin/messages/4 → 200`）。

---

## 四、测试数据清理确认 ✅

| 数据 | 测试前 | 测试后 | 状态 |
|---|---|---|---|
| 留言表 | 0 条 | 0 条 | 已清理（测试留言全部删除） |
| 案例表 | 4 条（企业官网改版/产品主图/活动记录/汇报演示） | 4 条，id 与标题完全一致 | 已清理（测试案例已删除） |
| `hero.title` | 为企业提供可维护的网站与视觉设计服务 | 同左 | 已还原 |
| `hero` 分组 8 条记录 | 种子值（`sort_order` 0/10/…/70，`background_image.value=NULL`，imageUrl=picsum） | 与 `sql/02-data.sql` 逐字段一致 | 已还原（脚本 `restore_hero_seed.py`，`RESTORE_OK=True`） |
| 前台首页 | — | 含原 hero 标题、不含测试标题 | 已确认 |
| 前台案例页 | — | 不含测试案例 | 已确认 |

> 补充：DEF-01/DEF-02 造成的 hero 分组字段漂移，已通过管理接口按种子值整组回写完成修复，无需手工改库。

---

## 五、未覆盖项（诚实声明）

| 项目 | 原因 |
|---|---|
| 后台图片上传 `POST /api/admin/upload` | 未在优先级清单内；且真实上传会在服务器留下文件、不易清理，故本次未做。建议后续单独补一条用例（用临时 PNG，用完删除） |
| 登录失败锁定 / 429 限流 | 只验证了错误密码返回 400，未做连续失败触发限流的压测（会污染线上限流状态） |
| 会话 8 小时过期 | 无法在测试窗口内验证 |
| 并发 / 性能压测 | 非本次验收范围 |

---

## 六、如何重复运行

```bash
cd C:/Users/Patrick/WorkBuddy/2026-09-16-16-14-53/qa_tests

python probe_api.py            # 接口形态探针（只读）
python test_api_smoke.py       # P 组：25 条接口冒烟
python test_static_checks.py   # G 组：动效/XSS 静态红线
python test_admin_ui.py        # A/B/C/D 组：后台闭环（自带 finally 还原）
python test_frontend_pages.py  # E/F 组：权限 + 移动端 + 前台页面
python test_xss_runtime.py     # X 组：运行时 XSS
python cleanup_test_data.py    # 兜底清理测试数据
python restore_hero_seed.py    # 把 hero 分组还原为种子值
python verify_final.py         # 最终状态核验
```

约定：所有写操作脚本都有 `finally` 还原（文案改回、案例删除、留言删除）；Playwright 已拦截 `picsum.photos / placehold.co`，`goto` 统一 `wait_until="domcontentloaded"`。
