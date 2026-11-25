# DOCIA 网站开发者指南

本文档描述 P0 模块化后的实现。目标是：**内容可维护、构建可重复、前端行为不变**。
前端页面、路由、CSS 和交互实验算法没有重写；数据来源从手写 `dist/site.config.js`
换成了 `content/` + 构建脚本。

## 1. 架构

```text
content/ + config/presentation.yaml
        │
        ├─ scripts/lib/content.js        读取、规范化、校验、建立索引
        │    ├─ scripts/loaders/yaml.js
        │    ├─ scripts/loaders/markdown.js
        │    └─ scripts/loaders/bibtex.js
        │
        ├─ scripts/adapters/legacy-config.js   生成旧前端兼容数据
        │
        └─ scripts/lib/builder.js              生成完整 dist/
             ├─ index.html（SEO/JSON-LD/noscript）
             ├─ site.config.js（AUTO-GENERATED）
             ├─ site.webmanifest / robots.txt / sitemap.xml
             └─ src/ 前端资源 + 被引用的 content 图片
```

- **唯一内容权威**：`content/`（图片在 `assets/`）。
- **唯一前端源码**：`src/`。`dist/` 是生成物，不手改。
- **兼容层**：`src/app.js`、`src/search.js`、`src/i18n.js` 仍按旧的 `site` 对象渲染；
  适配器负责把新模型映射成旧结构，避免一次性重写页面。
- **表现层配置**：配色、导航、页面标题、首屏、SEO 文案、交互实验默认参数在
  `config/presentation.yaml`。它们不是日常内容，因此不放在 `content/site.yaml`。

## 2. 数据流

`loadContent({ report, today })` 返回：

```js
{
  site, presentation, home,
  people, publications, research, news, honors, gallery, recruitment,
  indexes: {
    publicationsByMember,
    publicationsByResearch,
    honorsByMember
  },
  public: { people, publications, research, news, honors, gallery }
}
```

- `people`/`publications` 等是“全部记录”，包含草稿；`public` 是过滤后的公开记录。
- 公开过滤在索引和适配器之前完成：草稿、未来日期新闻不会进入 `public`，也不会进入
  首页、搜索、`site.config.js` 或媒体复制。
- 论文来自所有 `content/publications/**/*.bib`；metadata 是 `content/publications/metadata/*.yaml`。
- 关联只在 metadata 中声明，反向索引用 Map 建立；研究方向和成员页不重复存论文列表。
- `research.paper` 是适配兼容字段：取该方向关联论文中排序后的第一篇。

### 稳定 ID 与排序

- 成员/研究方向/新闻/荣誉/相册 ID = 文件名（新闻含日期前缀）。
- 论文 ID = BibTeX 引用键，保持原大小写。
- 通用排序：显式 `order` 小的在前；缺省 `order` 排在显式之后；同序按 ID 稳定排序。
- 论文：年份降序 → metadata `order` → 引用键。
- 新闻/荣誉/相册：日期降序 → `order` → ID。
- 成员按 `order` → ID；公开页面再按 `role` 分组（faculty → PI，其余 → Students）。

## 3. 内容格式

字段的机器可读定义在 `schemas/*.schema.json`，面向人的说明在
`docs/USER-GUIDE.md` 和 `templates/`。

- 短文本：`{ en, zh }`；`en` 必填，`zh` 缺失时警告并回退英文。
- 长正文：Markdown 中 `## English` / `## 中文` 两个标题节点；中文缺失回退英文并警告。
- 日期：带引号的 `"YYYY-MM-DD"`；年份是整数。
- 外部链接：`http://` 或 `https://`；不写空链接字段。
- 图片路径：相对 `assets/<type>/`，构建时校验存在性及目录约定。
- 未知字段会报错并给出拼写建议（避免字段名写错被静默忽略）。
- 新闻文件名日期必须等于 front matter `date`。
- `graduation_year` 不得早于 `start_year`。
- 公开记录不能引用草稿记录。

## 4. BibTeX

实现：`scripts/loaders/bibtex.js`，依赖 `@retorquere/bibtex-parser@14.0.8`。

- 在 Node 中必须 `initSync` + 显式 wasm 路径；该包的 `init()` 走 `fetch`，在 Node 会失败。
  解析代码用：

  ```js
  initSync({ module: await readFile(fileURLToPath(import.meta.resolve(
    '@retorquere/bibtex-parser/bibtex_parser_bg.wasm'
  ))) });
  ```

- `fieldMode` 对 `title/journal/booktitle/...` 使用 `literal`：保留题目大小写，同时把
  LaTeX 重音转成 Unicode。`verbatim` 会保留 `{}` 和 LaTeX，不适合直接展示。
- 支持 `@article`、`@inproceedings`、`@misc`、`@techreport`、`@string`、`#` 拼接、多行字段、
  保护大小写、BibTeX 姓名。作者归一化为 Oxford 风格字符串。
- 重复引用键报错；同一 DOI 不同引用键给出警告；不认识的 entry 类型警告但不静默丢弃。
- `unsupported: 'throw'` 让无法处理的 TeX 结构显式失败，而不是悄悄丢失。
- **P0 不提供前端“复制 BibTeX”按钮**（P1）；因此暂不需要展开宏的独立复制逻辑。

## 5. 校验与错误级别

`npm run validate:content` 只读，不写文件；有 Error 时退出码 1 并打印中文报告：
`文件 · 记录 · 字段 · 修复建议`。

- **Error（阻止构建）**：YAML/JSON 语法、必填缺失、类型错误、重复 ID/引用键、枚举非法、
  引用不存在、公开记录引用草稿、显式图片不存在、毕业年份早于入学、新闻日期非法或与
  文件名不一致、未知字段。
- **Warning（不阻止）**：中文缺失回退英文、同 DOI 不同引用键、未来日期新闻暂不展示、
  相册照片缺少 alt、成员照片有多个候选、P1 字段/项目目录被忽略。
- **Normal**：无照片显示默认头像、可选空字段隐藏。

## 6. 构建与确定性

`npm run build` 流程：

1. 加载并校验内容；有 Error 直接退出，**不触碰现有 `dist/`**；
2. 在 `.build-tmp/dist` 构建：复制 `src/` 前端资源、复制被引用的图片、生成 HTML/配置/SEO 文件；
3. 原子替换 `dist/`（旧目录先备份，失败时恢复）；
4. 输出统计。

确定性约定：

- 不写入构建时间、随机 ID 或本机路径；
- JSON/YAML/HTML 输出使用固定顺序和固定缩进；
- 同样的内容、依赖和模板应生成逐字节相同的 `dist/`。
- `dist/site.config.js` 带 `AUTO-GENERATED — DO NOT EDIT` 头，指向 `content/`。
- `sitemap.xml` 不写 `lastmod`，避免使用构建时间或伪造内容日期。

## 7. 与旧前端的兼容层

`scripts/adapters/legacy-config.js` 输出旧 `site` 对象，键与原 `dist/site.config.js` 一致，
新增 `site.home` 控制首页区块。当前迁移后的差异只有：

- `publications[].selected`：新增字段，首页据此筛选精选论文；
- `people[].name` / `alumni[].name`：从字符串变为 `{en, zh}`，由 `app.js` 的 `pick()` 读取。

`src/app.js` 的改动保持最小：

- 姓名在 `initials()` / `escapeHtml()` 之前先 `pick()`；
- 首页根据 `site.home` 的开关/条数渲染：research、selected_publications、interactive_experiment、moments；
- 精选论文在存在 `selected` 字段时只取 `selected: true`；没有该字段时保持旧行为（全部）。

`src/search.js` 仍按数组索引生成深链接（`#/people/person-0` 等）。因此排序必须稳定；
新增/删除记录会改变后续索引，这是 P0 保留的既有行为（P1 再改为 ID 深链接）。

## 8. 生成文件

- `dist/index.html`：`src/index.html` 模板 + 内容生成的 `<head>` SEO/分享卡片/JSON-LD、
  noscript 静态摘要、品牌名/学校名。
- `dist/site.config.js`：兼容数据，唯一的旧前端数据入口。
- `dist/site.webmanifest`：名称、语言、主题色、图标。
- `dist/robots.txt`：sitemap 地址。
- `dist/sitemap.xml`：中英文入口 + hreflang。
- 其余 JS/CSS/字体/图片：从 `src/` 和 `assets/` 复制。

## 9. 命令

```bash
npm ci
npm run validate:content
npm run build:content   # 只生成 dist/site.config.js
npm run build           # 完整 dist/
npm run dev             # 构建 + 本地预览 + 监听重建
npm test
```

`npm run dev` 使用 Node 内置 `http`，不引入额外服务；默认 `127.0.0.1:8000`。

### 重新生成首页地形图

实验区的地形/下降轨迹由原有 Python 工具生成，输出到 **`src/assets/`**（源文件），
再由构建复制到 `dist/assets/`：

```bash
python3 -m venv .venv
.venv/bin/pip install numpy pillow contourpy
.venv/bin/python tools/render-landscape.py
npm run build
```

生成文件是 `src/assets/landscape.webp` 和 `src/assets/descent.js`。不要直接改 `dist/assets/` 下的副本。

## 10. 扩展指引

- 新内容类型：先加 `schemas/<type>.schema.json`，再在 `content.js` 中加载/校验/排序，
  然后在适配器中决定是否映射到旧前端；不要直接在页面里解析文件。
- 新图片目录：在 `content.js` 校验路径，在 `collectMedia()` 加入复制规则。
- 新首页区块：在 `home.yaml` 增加开关/条数，`app.js` 读取 `site.home`，并同步文档。
- 新增字段：更新 schema、模板、用户手册；如果是展示字段，再改适配器。
- **不要**把内容写回 `src/i18n.js`；UI 文案才属于 i18n。
- **不要**在 `dist/` 手改；下一次构建会覆盖。

## 11. 已知限制（P0 未做）

- 前端仍是单页 hash 路由，未拆成 `src/pages/components/layouts` 组件树（P1）。
- 搜索深链接仍使用数组索引，不是稳定内容 ID（P1）。
- 首页不自动展示新闻、不自动选择精选论文（P1）。
- 论文列表无筛选/引用复制（P1）。
- 荣誉/相册页当前无真实数据；页面代码保留，添加记录后即可显示。
- 项目页、CMS、Issue 表单、更多 SEO 属于 P2，未实施。
- 生产部署仍需手动同步 `dist/`；部署入口、环境要求与回滚步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。
