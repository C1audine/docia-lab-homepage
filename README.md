# DOCIA Lab 网站

上海科技大学 DOCIA Lab（决策、优化与控制实验室）的静态网站。

网站仍然是无后端、无数据库、可直接静态托管的站点；但内容已经与程序分离：
**日常维护只改 `content/`，构建命令负责校验并生成 `dist/`。**

> 想直接改网站内容？请从 [docs/USER-GUIDE.md](docs/USER-GUIDE.md) 开始。
> 想了解代码与构建流程？请读 [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)。
> 部署与回滚见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 目录结构

```text
content/            可编辑内容（YAML / Markdown / BibTeX）
config/             外观与固定界面配置（配色、导航、页面标题、首屏、实验参数、SEO 文案）
assets/             内容图片（成员、研究方向、新闻、荣誉、相册）
src/                前端源码与静态视觉资源（页面模板、JS、CSS、图标、地形图）
scripts/            构建、校验、加载器与兼容适配器
schemas/            内容字段校验规则
templates/          可复制的内容模板（不会被网站读取）
docs/               中文维护手册、开发者指南、部署说明、迁移记录
tools/              原有部署脚本与地形图生成脚本
dist/               构建产物（已提交，用于现有静态部署；不要手改）
```

`dist/` 是生成目录。它仍然被提交进仓库，是因为当前静态服务器直接提供这些文件；
但**内容的唯一权威来源是 `content/`**，`dist/site.config.js` 顶部会标明自动生成。

## 本地使用

需要 Node.js 20 或更新版本。

```bash
npm ci                 # 首次或依赖变化后
npm run validate:content
npm run build          # 生成完整 dist/
npm run dev            # 本地预览 http://127.0.0.1:8000
```

常用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run validate:content` | 只校验内容；不写文件，有错误时退出码非 0 |
| `npm run build:content` | 校验并只生成 `dist/site.config.js` |
| `npm run build` | 校验并生成完整 `dist/`（失败不会覆盖上一次可用版本） |
| `npm run dev` | 构建并启动本地预览，监听内容/源码变化自动重建 |
| `npm test` | 运行内容、BibTeX、Markdown 与兼容数据测试 |

## 内容在哪

| 想更新的内容 | 编辑 |
| --- | --- |
| 网站名称、页脚全名、学校、联系方式 | `content/site.yaml` |
| 首页显示区块与条数 | `content/home.yaml` |
| 成员 / 校友 | `content/people/<id>.yaml` |
| 论文题录 | `content/publications/*.bib` |
| 论文精选、成员/方向关联 | `content/publications/metadata/<引用键>.yaml` |
| 研究方向 | `content/research/<id>.md` |
| 新闻 | `content/news/YYYY-MM-DD-<slug>.md` |
| 荣誉 | `content/honors/<id>.yaml` |
| 相册 | `content/gallery/<id>.yaml` |
| 招生 / 加入我们 | `content/join-us/index.md`（当前为草稿） |
| 配色、导航、页面标题、首屏、实验参数、SEO 文案 | `config/presentation.yaml` |

模板见 `templates/`。完整字段和常见错误见 [docs/USER-GUIDE.md](docs/USER-GUIDE.md)。

## 内容规则（摘要）

- 英文必填，中文可选；中文缺失时回退英文并给出构建警告。
- 短文字写成 `{ en: ..., zh: ... }`；长正文用 Markdown 的 `## English` / `## 中文` 分隔。
- 文件名（YAML/Markdown 去掉扩展名）是稳定 ID；论文 ID 是 BibTeX 引用键。发布后不要改名。
- 论文题目、作者、年份、期刊、DOI 只写在 `.bib`；`metadata/<key>.yaml` 只写站内信息。
- 草稿（`draft: true`）和未来日期的新闻不会进入构建结果。
- 图片放在 `assets/` 对应目录；构建只复制实际被引用的图片。
- 不编造成员、论文、荣誉、招生信息。没有确认的内容请留空或标记 `draft`。

## 构建做了什么

1. 读取并校验 `content/` 与 `config/presentation.yaml`（字段、引用、日期、图片、ID）；
2. 建立论文 ↔ 成员 ↔ 研究方向、新闻 → 论文、荣誉 ↔ 成员的反向索引；
3. 生成旧的兼容数据文件 `dist/site.config.js`，让现有页面、搜索、双语切换、交互实验继续工作；
4. 生成 `index.html` 的 SEO / JSON-LD / noscript 内容，以及 manifest、robots、sitemap；
5. 复制 `src/` 前端资源和内容实际引用的图片；
6. 在临时目录完成构建后再替换 `dist/`；校验或构建失败时保留上一次成功版本。

页面路由、CSS、搜索和交互实验的算法没有重写。`src/model.js` / `src/terrain.js` 中的
算法和 `src/style.css` 的视觉样式保持原实现。

## 部署

当前站点是 `https://docia.org` 的静态 Nginx 站点。构建后把 `dist/` 发布到
现有静态目录即可；仓库中的 `tools/deploy-server.sh` 保留为原有的一键部署/初始化脚本。

**推送 GitHub 不会自动更新生产站点。** 当前发布需要手动把 `dist/` 同步到服务器；
如果以后配置了 Actions Secrets，可使用 `.github/workflows/deploy.yml` 手动触发部署。
详细步骤、生产环境现状、回滚方式见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 迁移状态

P0（内容层拆分、BibTeX、校验、兼容构建、模板、文档、CI）已落地。P1/P2
（论文筛选与引用复制、关联展示、前端组件拆分、首页自动复用新闻、CMS、项目页、
更多 SEO）尚未实施。对照验收标准的结果与已知差异见
[docs/MIGRATION-REPORT.md](docs/MIGRATION-REPORT.md)。

## 许可

网站内容与图片版权归 DOCIA Lab 所有；代码部分沿用原仓库约定。
