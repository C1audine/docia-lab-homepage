# DOCIA Lab 网站

上海科技大学 DOCIA Lab（决策、优化与控制实验室）的静态网站：<https://docia.org>。

站点无后端、无数据库，可直接静态托管；支持中英双语、站内搜索、研究方向交互实验与论文年度统计。
内容已与程序分离：**日常维护只改 `content/`，构建命令负责校验并生成 `dist/`。**

> 日常改内容 → [docs/USER-GUIDE.md](docs/USER-GUIDE.md)
> 改代码/构建 → [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)
> 部署与回滚 → [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
> 迁移记录 → [docs/MIGRATION-REPORT.md](docs/MIGRATION-REPORT.md)

## 版本变化（相对上一版 GitHub main）

本分支（`modularization-p0`，在 P0 提交 `d0162d3` 基础上完成部署脚本与文档修订）相对上一版 GitHub `main`（`a99269d`）的主要变化：

| 方面 | 上一版 main（a99269d） | 本版本 P0 提交（d0162d3） |
| --- | --- | --- |
| 仓库规模 | 25 个跟踪文件：README、`dist/`、`tools/` | P0 提交 `d0162d3` 时 118 个跟踪文件；相对 main 103 个文件变化（95 新增 / 2 删除 / 6 修改），+9032/−775 行。本次推送另含部署脚本与配置示例（2 个新增文件）及文档修订，跟踪文件为 120 |
| 新增目录 | — | `content/` `config/` `assets/` `src/` `scripts/` `schemas/` `templates/` `docs/` `test/` `.github/workflows/` |
| 内容维护 | 手改 `dist/site.config.js` | 只改 `content/`（YAML / Markdown / BibTeX）与 `config/presentation.yaml`；论文题录改用 BibTeX |
| 校验 | 无 | JSON Schema + 引用/日期/图片/ID 校验，`npm run validate:content` |
| 构建 | 无构建步骤，`dist/` 即手写源文件 | `npm run build` 校验后在临时目录构建并原子替换 `dist/`；失败保留上一次可用版本 |
| 兼容层 | 无 | `dist/site.config.js` 自动生成（顶部 `AUTO-GENERATED`），旧前端只做最小改动 |
| 测试与 CI | 无 | 15 个 `node --test` 测试；`validate-content.yml` 跑校验/测试/构建；`deploy.yml` 手动部署 |
| 部署 | 单个一键部署脚本 | 可移植 `tools/deploy-server.sh`（相对路径 / `DRY_RUN` / `--help`）+ 开发机 `tools/deploy-remote.sh` + `deploy.env` |
| 文档 | 仅 README | README + 4 份中文文档 + 9 类内容模板；敏感主机信息已移除 |

补充：

- `dist/` 从“可直接编辑的源文件”变为构建产物（20 个文件，仍提交供静态服务器直接提供），不要手改。
- 前端页面、路由、CSS、搜索与交互实验算法没有重写；数据入口仍是旧的 `site` 对象，由兼容层生成。
- 公开记录数量未变：2 位成员、3 篇论文、3 个研究方向、4 条新闻。

## 目录结构

```text
content/            可编辑内容（YAML / Markdown / BibTeX）
config/             外观与固定界面配置（配色、导航、页面标题、首屏、实验参数、SEO 文案）
assets/             内容图片（成员、研究方向、新闻、荣誉、相册、项目、文档）
src/                前端源码与静态视觉资源（HTML 模板、JS、CSS、图标与分享图）
scripts/            校验、加载器、构建、开发服务器与旧前端兼容适配器
schemas/            内容字段校验规则（JSON Schema）
templates/          可复制的内容模板（不会被网站读取）
docs/               中文维护手册、开发者指南、部署说明、迁移报告
test/               Node 内置测试（内容、BibTeX、Markdown、兼容数据）
.github/workflows/  内容校验 CI 与手动部署工作流
tools/              服务器/远程部署脚本与地形图生成脚本
dist/               构建产物（已提交，用于现有静态部署；不要手改）
```

`dist/` 是生成目录。它仍然被提交进仓库，是因为当前静态服务器直接提供这些文件；
但**内容的唯一权威来源是 `content/`**，`dist/site.config.js` 顶部会标明自动生成。

## 本地开发

需要 Node.js 20 或更新版本。

```bash
npm ci                 # 首次或依赖变化后
npm run validate:content
npm run build          # 生成完整 dist/
npm run dev            # 本地预览 http://127.0.0.1:8000
```

| 命令 | 作用 |
| --- | --- |
| `npm run validate:content` | 只校验内容；不写文件，有错误时退出码非 0 |
| `npm run build:content` | 校验并只生成 `dist/site.config.js` |
| `npm run build` | 校验并生成完整 `dist/`（失败不会覆盖上一次可用版本） |
| `npm run dev` | 构建并启动本地预览，监听内容/源码变化自动重建 |
| `npm test` | 运行内容、BibTeX、Markdown 与兼容数据测试 |

## 内容维护

日常更新只改 `content/`；外观和固定界面文案在 `config/presentation.yaml`。

| 类型 | 放什么 | 文件 |
| --- | --- | --- |
| YAML 记录 | 站点资料、首页区块、成员/校友、荣誉、相册、论文站内信息 | `content/site.yaml`、`content/home.yaml`、`content/people/<id>.yaml`、`content/honors/<id>.yaml`、`content/gallery/<id>.yaml`、`content/publications/metadata/<引用键>.yaml` |
| Markdown 正文 | 研究方向、新闻、招生页 | `content/research/<id>.md`、`content/news/YYYY-MM-DD-<slug>.md`、`content/join-us/index.md` |
| BibTeX 题录 | 论文题目、作者、年份、期刊、DOI | `content/publications/publications.bib` |
| 图片 | 成员、研究方向、新闻、荣誉、相册等实际被引用的图片 | `assets/<类型>/` |

从 `templates/` 复制对应模板到 `content/` 并改名即可（文件名即稳定 ID）；完整字段和
常见错误见 [docs/USER-GUIDE.md](docs/USER-GUIDE.md)。论文题录只写在 `.bib`，
`metadata/<引用键>.yaml` 只写站内信息（精选、关联成员/方向等，不重复题目/作者/年份）。

## 内容规则（摘要）

- 英文必填，中文可选；中文缺失时回退英文并给出构建警告。
- 短文字写成 `{ en: ..., zh: ... }`；长正文用 Markdown 的 `## English` / `## 中文` 分隔。
- 文件名（YAML/Markdown 去掉扩展名）是稳定 ID；论文 ID 是 BibTeX 引用键。发布后不要改名。
- 论文题目、作者、年份、期刊、DOI 只写在 `.bib`；`metadata/<key>.yaml` 只写站内信息。
- 草稿（`draft: true`）和未来日期的新闻不会进入构建结果。
- 图片放在 `assets/` 对应目录；构建只复制实际被引用的图片。
- 不编造成员、论文、荣誉、招生信息。没有确认的内容请留空或标记 `draft`。

## 构建与兼容层

1. 读取并校验 `content/` 与 `config/presentation.yaml`（字段、引用、日期、图片、ID）；
2. 建立论文 ↔ 成员/研究方向、荣誉 ↔ 成员的反向索引，并把新闻关联到对应论文；
3. 生成旧的兼容数据文件 `dist/site.config.js`，让现有页面、搜索、双语切换、交互实验继续工作；
4. 生成 `index.html` 的 SEO / JSON-LD / noscript 内容，以及 manifest、robots、sitemap；
5. 复制 `src/` 前端资源和内容实际引用的图片；
6. 在临时目录完成构建后再替换 `dist/`；校验或构建失败时保留上一次成功版本。

构建不写入时间、随机 ID 或本机路径：同样的内容与依赖应生成逐字节相同的 `dist/`。
页面路由、CSS、搜索和交互实验算法没有重写；`src/model.js` / `src/terrain.js` 的算法和
`src/style.css` 的整体风格与配色保持原实现，仅做细节精修（吸底页脚、顶栏滚动阴影、
交互实验面板自适应填充、悬停/焦点状态、移动端菜单与语言切换对齐等）。

## 部署

站点是 `https://docia.org` 的静态 Nginx 站点，只需要静态文件服务器。
**推送 GitHub 不会自动更新生产站点；每次上线都要手动构建并发布。**

### 方式一：在服务器上部署

在服务器上的仓库根目录执行（Linux，需 sudo）：

```bash
sudo ./tools/deploy-server.sh                         # 默认 WEBROOT=/var/www/docia
sudo WEBROOT=/srv/www/docia ./tools/deploy-server.sh  # 绝对路径
sudo WEBROOT=site ./tools/deploy-server.sh            # 相对“部署根”（仓库或暂存目录的上一级）
sudo WEBROOT=~/docia-site ./tools/deploy-server.sh    # sudo 用户的 home
DRY_RUN=1 WEBROOT=webroot ./tools/deploy-server.sh    # 只预演，不写系统
./tools/deploy-server.sh --help                       # 全部参数与变量
```

脚本会按需安装 Nginx/rsync、写站点配置、把 `dist/` 同步到 WEBROOT，并在 `nginx -t`
通过后 reload；重复执行是幂等的。另有 `DIST_DIR`、`DOMAIN`、`SITE_NAME`、`HTTP_PORT`、
`INSTALL_DEPS`、`FORCE`、`NGINX_CONF_DIR`、`NGINX_LAYOUT` 等变量。部署前先 `npm run build`；
生产静态目录和主机必须由负责人确认。回滚与故障排查见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

### 方式二：从开发机远程部署（推荐）

```bash
cp tools/deploy.env.example tools/deploy.env   # 填主机/用户/目录；该文件已被 gitignore
./tools/deploy-remote.sh --dry-run             # 只打印计划，不联网
./tools/deploy-remote.sh --build               # 构建后发布到默认远端 ~/docia-site
./tools/deploy-remote.sh --host <服务器IP> --user <用户名> --bootstrap   # 新服务器首次
```

- 配置优先级：命令行 > 环境变量（`DEPLOY_HOST` 等）> `tools/deploy.env` > 默认值。
- `--path` 默认远端 `~/docia-site`，在远端解析 `$HOME`；`--bootstrap` 会把 `dist/` 和
  服务器脚本暂存到远端 `~/.docia-deploy`，再用 sudo 初始化 Nginx，之后无需重复。
- 常用参数：`--host --user --port --path --domain --http-port --build/--no-build`
  `--bootstrap/--no-bootstrap --dry-run --verbose --help`；也可用 `npm run deploy:remote`。
- `rsync -a --delete` 会删除远端站点目录中的多余文件，首次使用先跑 `--dry-run`。

### 方式三：GitHub Actions 手动部署

`.github/workflows/deploy.yml` 仅支持手动触发（`workflow_dispatch`，输入 `deploy` 确认），
不会在 push 或 PR 时自动部署。使用前在仓库 Secrets 配置 `DEPLOY_HOST`、`DEPLOY_USER`、
`DEPLOY_PATH`、`SSH_PRIVATE_KEY`，可选 `DEPLOY_PORT`（默认 22）。未配置 Secrets 时
工作流会失败，不影响 PR 检查。`tools/deploy.env` 只供远程脚本使用，与 Actions Secrets
相互独立；二者都不要提交。

> 现有 `docia.org` 生产站点仍是 Nginx 静态站，发布检查、回滚与安全建议以
> [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 为准。

## 迁移状态

P0（内容层拆分、BibTeX、校验、兼容构建、模板、文档、CI）已落地。P1 中的论文列表筛选
（年份、作者、研究方向、类型，选项由内容自动生成）已完成。P1/P2 其余项（BibTeX 引用复制、
跨页关联展示、前端组件拆分、首页自动复用新闻、CMS、项目页、更多 SEO）尚未实施。
对照验收标准的结果与已知差异见 [docs/MIGRATION-REPORT.md](docs/MIGRATION-REPORT.md)。

## 文档索引

| 文档 | 适合谁 | 内容 |
| --- | --- | --- |
| [docs/USER-GUIDE.md](docs/USER-GUIDE.md) | 日常维护人员 | GitHub 网页改内容、成员/论文/新闻/图片、常见错误 |
| [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md) | 开发者 | 架构、数据流、校验、构建、兼容层、扩展指引 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 发布负责人 | 生产环境、两种部署方式、回滚、Actions Secrets |
| [docs/MIGRATION-REPORT.md](docs/MIGRATION-REPORT.md) | 迁移评审 | P0 验收对照、验证记录、遗留差异 |
| [content/README.md](content/README.md)、[templates/](templates/) | 内容维护 | 内容目录速查、三条通用规则与可复制模板 |

## 许可

网站内容与图片版权归 DOCIA Lab 所有；代码部分沿用原仓库约定。
