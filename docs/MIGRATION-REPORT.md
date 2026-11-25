# DOCIA 网站模块化迁移报告（P0）

本报告记录 Phase 0（现状审计）、Phase 1（内容迁移与构建替换）、Phase 2（模板、文档、CI 与发布路径）
的实际实施结果，并对照 `DOCIA_Website_Modularization_Requirements.md` 的验收标准说明已完成项、
未完成项和与目标架构的差异。

- 迁移前基线提交：`a99269d5f6d955816ff64298aa765f0fd0260547`
- 迁移分支：`modularization-p0`
- 生产站点：`https://docia.org`（本次**未执行生产发布**，原因见 §6）
- 回归证据：仓库外部的回归证据目录（基线截图、after 截图、像素 diff、交互探针）

## 1. Phase 0：现状审计

### 1.1 仓库与构建关系

| 项目 | 迁移前 |
| --- | --- |
| 版本控制 | 仅 `main`，无 `package.json`、无 CI、无构建步骤 |
| 页面源码 | `dist/` 同时是源码、内容源和部署产物；`index.html` 直接加载 `dist/app.js` |
| 内容入口 | `dist/site.config.js`（169 行、约 12.5 KB），手工编辑 |
| 部署 | 构建后把 `dist/` rsync 到 Nginx 静态目录；GitHub push 不会自动更新站点 |
| 校验 | 无；字段错误只能在浏览器里发现 |

迁移前 `dist/` 有 22 个文件（其中 2 个是图片目录说明），站点实际公开文件 20 个。
迁移后 `dist/` 仍为 20 个公开文件，全部由构建生成。

### 1.2 前端数据消费点（兼容层依据）

- `app.js`：`site.palette/navigation/pages/hero/research/publications/people/alumni/gallery/news/honors/contact/experiment`；
  首页固定 `publications.slice(0,2)`、`gallery.slice(0,3)`；人物/校友姓名按字符串渲染。
- `search.js`：从同一 `site` 对象建立客户端索引；论文深链按 `paper.id`，人物/校友/相册/新闻/荣誉
  深链按数组下标（`targetId(kind,index)`），因此**数组顺序必须稳定**。
- `i18n.js`：界面词在 `ui{en,zh}`；内容字段用 `pick({en,zh})`；`localStorage["docia-lang"]`、`?lang=zh`。
- 交互实验：`experiment.js` / `model.js` / `terrain.js` 读取 `site.experiment`，算法与动画未改。
- SEO：`index.html` 静态 head 内的 canonical/hreflang/OG/Twitter/JSON-LD/noscript 含站点、成员、地址信息，
  是第二份内容，迁移时改为构建生成。

### 1.3 内容盘点与 ID 映射

| 类型 | 迁移前 | 迁移后记录 | ID 处理 |
| --- | --- | --- | --- |
| 站点信息 | `site.brand/name/university/url/contact` | `content/site.yaml` | 无变化 |
| 首页显示 | 硬编码 `slice(0,2)` / `slice(0,3)` | `content/home.yaml` | 显式 enabled/count |
| 成员 | 1 位（Jie Lu） | `content/people/jie-lu.yaml` | 新稳定 ID `jie-lu` |
| 校友 | 1 位（Xuyang Wu） | `content/people/xuyang-wu.yaml` | 新稳定 ID `xuyang-wu` |
| 论文 | 3 条（stochastic/constraints/proximal） | `content/publications/publications.bib` + 3 个 metadata | 引用键保持不变 |
| 研究方向 | 3 条 | `content/research/*.md` | 原 ID 保持不变 |
| 新闻 | 4 条（无 ID、只有年份） | `content/news/2023-01-01-*.md` 等 | 新 ID，见 §5 例外 |
| 荣誉 | 0 条 | 仅 `content/honors/README.md` | 无数据 |
| 相册 | 0 条 | 仅 `content/gallery/README.md` | 无数据 |
| 招生/加入我们 | 无独立数据 | `content/join-us/index.md`（`draft: true`） | 无未经确认的信息 |
| 项目 | 无 | `content/projects/README.md`（预留，P2） | 不解析、不生成页面 |

迁移后统计：成员 2（1 在职 + 1 校友）· 论文 3 · 研究方向 3 · 新闻 4 · 荣誉 0 · 相册照片 0。

### 1.4 部署审计

- `https://docia.org` 返回 Nginx 静态页；线上 `index.html` 与 `site.config.js` 与 `a99269d` 的 `dist/`
  逐字节一致，说明提交到 `main` 的 `dist/` 就是线上内容。
- 曾在一台独立测试服务器上核实过一份较旧的站点副本，但**无法确认它是 docia.org 的生产源**；
  因此本次不把它当作生产发布目标，也不声称已完成自动部署。
- 现有 `tools/deploy-server.sh` 保留，作为原有一键初始化/部署脚本。

## 2. Phase 1：内容层与构建替换

### 2.1 新目录（按实际代码调整）

```text
content/
  site.yaml  home.yaml
  people/     jie-lu.yaml, xuyang-wu.yaml
  publications/ publications.bib, metadata/<citation-key>.yaml
  research/   <id>.md
  news/       YYYY-MM-DD-<slug>.md
  honors/     <id>.yaml（当前为空）
  gallery/    <album-id>.yaml（当前为空）
  join-us/    index.md（草稿）
  projects/   仅 README，P2 预留
config/presentation.yaml   配色、导航、页面标题、首屏、媒体目录、实验参数、SEO 文案
assets/                   内容图片目录（当前无图片，保留 .gitkeep）
templates/                可复制模板（不会被构建读取）
schemas/                  JSON Schema
scripts/                  build / validate / loaders / adapter / lib
src/                      前端源码与静态视觉资源
dist/                     构建产物（仍提交，供现有静态部署）
```

与需求文档示例的差异：视觉静态资源（logo、OG、地形图、`descent.js`）保留在 `src/assets/`，
内容图片才放根目录 `assets/`；`config/presentation.yaml` 单独承载导航/首屏/实验等固定界面配置，
避免把这些写进 `content/site.yaml`。这是对现有前端结构的适配，不改变“内容与代码分离”的原则。

### 2.2 数据流

```text
content/ + config/presentation.yaml
  → scripts/loaders/{yaml,markdown,bibtex}.js
  → scripts/lib/content.js（默认值、引用校验、草稿/未来日期过滤、排序、反向索引）
  → {site, presentation, home, people, publications, research, news, honors,
     gallery, recruitment, indexes, public}
  → scripts/adapters/legacy-config.js
  → dist/site.config.js（旧前端兼容数据）
  → src/* + 内容图片 + 生成的 SEO 文件
  → dist/
```

构建在临时目录完成后再替换 `dist/`；校验或生成失败时退出码非 0，且保留上一次成功产物。

### 2.3 字段与兼容处理

- 论文：`.bib` 是题目/作者/年份/期刊/DOI 的唯一来源；`metadata/<key>.yaml` 只写 `selected/order/members/
  research/links/status`。
- 成员：`status` 决定 People 或 Alumni；`graduation_year`、`position`、`destination`、`location` 在同一文件内。
- 新闻：`display_date` 可覆盖页面显示日期；未写时使用 `date`。旧数据只有年份，迁移用 `YYYY-01-01`
  作为排序锚点，同时用 `display_date` 保留原来的“2023 / 2023 年”显示，避免编造具体日/月。
- 人物显示名：`name` 在内部是 `{en,zh}`；适配器输出双语对象，`app.js` 只在渲染前 `pick()`，
  中文页面因此显示“吴旭阳”，英文继续显示“Xuyang Wu”。
- 联系方式：`site.yaml` 保存结构化地址，适配器组合旧的 `street` / `city` 显示字符串和 JSON-LD 地址。
- SEO：`index.html` 的 head/noscript 由构建生成；meta/link 标签与迁移前 34/34 完全一致，JSON-LD
  解析后结构一致，noscript 正文逐字节一致。

## 3. Phase 2：模板、文档、CI 与发布路径

已完成：

- `templates/`：成员、校友、论文、论文 metadata、研究方向、新闻、荣誉、相册、加入我们，共 9 类，
  含中文字段说明和占位符；模板不会被当作内容解析。
- `docs/USER-GUIDE.md`：面向非技术维护人员的中文手册，覆盖 GitHub 网页编辑、分支/PR、增改成员、
  毕业迁移、导入 BibTeX、新闻、图片、校验、发布前检查、常见错误。
- `docs/DEVELOPER-GUIDE.md`：架构、数据模型、加载器/适配器、排序、校验等级、构建原子替换、
  兼容层改动、扩展方式与 P0 限制。
- `docs/DEPLOYMENT.md`：现有 Nginx/静态目录事实、手动发布、可选 GitHub Actions 手动部署、
  回滚、安全注意事项与已知限制。
- `.github/workflows/validate-content.yml`：PR/push 执行 `npm ci`、校验、测试、完整构建，上传 artifact；
  **不在 PR 中部署生产**。
- `.github/workflows/deploy.yml`：仅 `workflow_dispatch` 手动触发，需输入 `deploy`，使用仓库 Secrets；
  没有默认自动部署，也没有把生产凭据写入仓库。
- `npm run dev`：本地静态预览 + 监听内容/源码变化自动重建；构建失败保留旧 `dist/`。
- 测试：`test/content.test.js`、`test/bibtex.test.js`、`test/markdown.test.js`，共 15 项，全部通过。

## 4. 验收标准对照（AC-01..AC-18）

状态说明：**完成** = 已在本地实现并验证；**部分** = 代码/文档已具备，但依赖外部环境或属于 P1；
**未验证** = 需要生产/GitHub 权限，本次无法执行。

| AC | 要求 | 状态 | 证据/说明 |
| --- | --- | --- | --- |
| AC-01 | 不写 JS 新增成员 | 完成（本地模拟） | 新增 YAML 后构建出现在 People；测试文件已删除并重新构建 |
| AC-02 | 改一个成员记录，所有引用同步 | 完成 | 页面、搜索、JSON-LD、适配数据都从同一条记录读取 |
| AC-03 | 同一文件改 status 后进入 Alumni，ID/关联不变 | 完成（本地模拟） | `status: alumni` + `graduation_year` 后从 People 消失、出现在 Alumni；已恢复 |
| AC-04 | 普通 BibTeX 导入论文 | 完成（本地模拟） | 新增 `.bib` + metadata 后论文进入列表/首页精选；已恢复 |
| AC-05 | metadata 扩展成员/方向/链接 | 部分 | schema 与索引已实现；论文详情页的链接展示属 P1 前端 |
| AC-06 | 复杂 BibTeX（@string/#/多行/LaTeX/姓名） | 完成 | 使用成熟解析器；15 项测试覆盖 |
| AC-07 | 新闻按日期排序，首页/搜索同步 | 部分 | 新闻排序与搜索索引已实现；首页自动新闻属 P1，P0 首页不含新闻 |
| AC-08 | 荣誉、相册记录 | 部分 | schema/适配器/空状态可运行；仓库无真实数据，未做真实数据视觉验证 |
| AC-09 | 错误阻止构建并给出文件/字段/修复 | 完成 | 校验器输出中文错误；失败构建保留旧 `dist/` |
| AC-10 | 可选字段/中文缺失回退 | 完成 | Jie Lu `name.zh` 缺失产生警告并回退英文（真实数据，无编造） |
| AC-11 | 草稿/未来新闻不公开 | 完成 | join-us 草稿不发布；2099 测试新闻构建 0 退出、警告且排除 |
| AC-12 | 干净构建完整站点，无须手改配置 | 完成 | `npm run build` 20 个文件，全部来自内容/源码 |
| AC-13 | 非技术维护者按手册/GitHub 网页更新 | 部分 | 手册、模板、CI 已交付；实际 GitHub 网页 PR 需仓库权限，未在本环境演练 |
| AC-14 | 失败 PR 不部署生产 | 部分 | PR 工作流只校验/构建，无部署权限；未在 GitHub 上实际运行 |
| AC-15 | 合并后带版本部署 | 未验证 | `deploy.yml` 为手动触发；生产服务器归属/凭据未确认，本次未发布 |
| AC-16 | 可回滚 | 部分 | 文档给出恢复上一产物/git revert 两条路径；未对生产演练 |
| AC-17 | 内容单一权威，非双写 | 完成 | `dist/site.config.js` 带自动生成头；旧手写配置已删除 |
| AC-18 | 迁移完整，无未批准的内容丢失/改变 | 完成 | 适配输出与旧配置逐字段对比，仅 §5 列出的有意差异 |

## 5. 已知迁移例外与差异

1. **Jie Lu 中文名缺失**：旧站没有中文名，未编造；构建给出 `name.zh` 回退警告。确认后可补
   `content/people/jie-lu.yaml` 的 `name.zh`。
2. **Xuyang Wu 中文名**：采用旧站中文新闻中已有的“吴旭阳”，未新增资料。
3. **新闻日期**：旧数据只有年份（2023/2023/2021/2020）。为保持排序且不编造月日，使用
   `YYYY-01-01` 锚点 + `display_date` 显示原文；同一天用 `order` 稳定排序。未来有准确日期时应改为真实日期。
4. **论文合作者未映射为成员**：只有 Jie Lu 有成员记录；C. Qiu、S. Zhu、Z. Ou、X. Wu、H. Wang、Z. Qu
   未擅自建立成员资料。论文作者串保持原样；需要时由管理员补充成员记录和 metadata 关联。
5. **论文精选**：旧站首页固定取前两条；迁移后用 `selected: true` 明确表示（stochastic、constraints），
   proximal 保持未精选。首页显示条数由 `content/home.yaml` 控制。
6. **sitemap 不再写 `lastmod`**：避免每次构建产生非确定性字节；页面 URL 集合与旧站一致。
7. **人物姓名数据结构**：兼容数据中 `people[].name` / `alumni[].name` 从字符串变为双语对象，
   `app.js` 增加 `pick()` 渲染；这是有意的最小改动，页面文本不变（中文多了已确认的“吴旭阳”）。
8. **P1/P2 未实施**：论文筛选/引用复制、跨页关联展示、前端组件拆分、首页自动复用新闻、CMS、
   项目页、更多 SEO 均未做；`projects/` 仅预留，`join-us` 仅草稿。
9. **发布路径**：GitHub push 仍不会自动更新 Nginx；当前仍需手动发布 `dist/`。`deploy.yml` 只是
   可选的手动工作流，不能称为“已实现自动部署”。

## 6. 验证记录

在最终工作树上执行：

```text
npm run validate:content
  → 成员 2 · 论文 3 · 研究方向 3 · 新闻 4 · 荣誉 0 · 相册照片 0
  → 1 条警告（Jie Lu name.zh 回退），无错误

npm run build
  → ✓ 已生成 dist/（20 个文件）

npm test
  → 15 项通过

连续两次构建
  → 字节级一致

故意写入无效成员文件后构建
  → 退出码 1，dist/ 哈希保持不变

新增成员 / 改 status 为 alumni / 新增论文 / 未来新闻
  → 均按预期进入或排除，测试数据已删除并重新构建
```

兼容性对比（旧 `a99269d` 配置 vs 新生成配置）：

- 仅有 `publications[].selected`、`people[].name`/`alumni[].name` 的双语对象化，以及新增 `home`；
- 其余字段逐字节一致；
- 生成的 head meta/link 34/34 与旧站一致，JSON-LD 解析后一致，noscript 正文逐字节一致；
- CSS 与实验算法文件未改；`src/app.js` 仅做首页区块开关/精选过滤/姓名 `pick()` 的最小改动。

独立回归审计（报告位于仓库外部的回归证据目录，状态 **COMPLETE — PASS**）：

- 基线 11 张 + 额外 ZH/移动端/research 详情截图；审计员用独立 Chromium 对 21 个页面状态、
  9 条路由 + 3 个研究方向详情 + `#/simulation`、EN/ZH、搜索、交互实验、移动端、无 JS、
  console/网络、SEO、dist 卫生和内容等值做了复核；
- 多数页面像素差为 0；`alumni-zh` 的唯一可见内容变化是中文姓名“吴旭阳”（来自旧站中文新闻），
  属于已确认的本地化改进；`research-zh` 112 个像素超过阈值（0.22%）位于卡片 SVG 插图，
  max=29，无文字/布局/颜色变化，属于抗锯齿噪声；
- 审计员结论：**未发现 P0 回归；V/F/D 检查无失败**；`dist/` 20 个文件/652K，目录树 SHA256 记录为 `7de26d32…d1f165`；
- 已知基线就存在的问题：搜索弹窗用右上角关闭按钮关闭时，`body.search-open`/滚动锁未清理；
  Escape 路径正常。该问题在迁移前后一致，未在 P0 中顺手改，记录为后续待修项。

## 7. 尚未完成 / 与目标架构的差异

| 项 | 状态 | 说明 |
| --- | --- | --- |
| P1：论文筛选、引用复制、关联展示、前端组件拆分、首页新闻 | 未开始 | 按用户要求暂不实施，除非作为 P0 必需依赖 |
| P2：Issue 表单/CMS、项目页、更多 SEO | 未开始 | 仅保留目录与说明 |
| 真实 GitHub 网页 PR 演练 | 未执行 | 无仓库写权限/PR 环境；本地已用等价文件操作验证内容流程 |
| 生产发布与回滚演练 | 未执行 | 生产主机归属和凭据未确认；未向 docia.org 或独立测试服务器发布 |
| 荣誉/相册真实数据 | 无数据 | 旧站为空；未编造，schema/适配器已就绪 |
| 中文成员名、准确新闻日期、合作者成员记录 | 待内容确认 | 需管理员提供已确认信息后补充 |

## 8. 交付物清单

- 内容目录：`content/`（站点、首页、成员、论文、研究方向、新闻、荣誉、相册、招生、项目预留）
- 媒体目录：`assets/`（按类型分目录，构建只复制被引用的文件）
- 固定界面配置：`config/presentation.yaml`
- 模板：`templates/`（9 类）
- 解析/校验/构建：`scripts/loaders/`、`scripts/lib/content.js`、`scripts/validate-content.js`、
  `scripts/adapters/legacy-config.js`、`scripts/lib/builder.js`、`scripts/build.js`、`scripts/dev.js`
- 字段规则：`schemas/`
- 前端源码：`src/`（页面模板、JS、CSS、实验、静态视觉资源）
- 生成产物：`dist/`
- CI：`.github/workflows/validate-content.yml`、`deploy.yml`
- 文档：`README.md`、`docs/USER-GUIDE.md`、`docs/DEVELOPER-GUIDE.md`、`docs/DEPLOYMENT.md`、本报告
- 回归证据：仓库外部的回归证据目录
