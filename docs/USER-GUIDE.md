# DOCIA 网站维护手册（非技术版）

本手册面向不需要写程序、但需要更新网站内容的同学。

你只需要：

1. 在 GitHub 网页上编辑 `content/` 里的文件；
2. 上传图片到 `assets/` 下对应目录；
3. 提交 Pull Request（PR），等待自动检查和负责人审核；
4. 合并后由负责人发布。

不需要编辑 `.js`、`.css`、`dist/`，也不需要登录服务器。

---

## 0. 先认识几个词

- **YAML（`.yaml`）**：像填写表格一样的内容文件，靠缩进表示层级。只能用空格，不能用 Tab。
- **Markdown（`.md`）**：带简单格式的正文文件。新闻和研究方向正文用它。
- **BibTeX（`.bib`）**：论文题录的标准格式。
- **ID**：文件名去掉扩展名。例如 `content/people/jie-lu.yaml` 的 ID 是 `jie-lu`。ID 是站内链接和关联的依据，**发布后不要改名**。
- **Pull Request（PR）**：在 GitHub 上请求把修改合并进主分支。检查通过、负责人同意后才会合并。
- **草稿**：`draft: true` 的记录不会出现在网站、搜索或首页中。

## 1. 在 GitHub 网页上修改内容（最常用）

1. 打开仓库页面，进入要修改的文件。
2. 点击右上角铅笔图标 **Edit**。
3. 修改内容。
4. 页面底部选择 **Create a new branch for this commit and start a pull request**，给分支起一个短名字，例如 `add-news-2026-graduation`。
5. 点击 **Propose changes**，再点击 **Create pull request**。
6. 等页面下方检查通过；负责人在 **Files changed** 里审核后点击 **Merge pull request**。
7. 不要直接改 `main` 分支；也不要在网页上编辑 `dist/`。

> 如果只改错别字，也可以让负责人直接改；但正式内容更新建议都走 PR，方便检查。

## 2. 修改已有成员

编辑 `content/people/<成员-id>.yaml`。

- 改姓名：`name.en` 必填；确认过中文名后填写 `name.zh`。
- 改身份：`role` 只能是
  `faculty`（教师）、`postdoc`（博士后）、`phd`（博士生）、`master`（硕士生）、
  `undergraduate`（本科生）、`staff`（行政/职员）、`visitor`（访问学者）。
- 改排序：`order` 越小越靠前。
- 改照片：见第 8 节。
- 改研究兴趣：`interests` 是列表；每位成员每一项都要有英文，中文可选。

修改保存后走 PR。成员页、搜索和论文关联都会在重新构建后自动更新。

## 3. 新增一位成员

1. 复制 `templates/person.yaml`。
2. 在 GitHub 网页进入 `content/people/`，点击 **Add file → Create new file**。
3. 文件名写成 `<成员-id>.yaml`，例如 `wei-zhang.yaml`；ID 只能用小写英文、数字和短横线。
4. 粘贴模板，替换占位内容：
   - `name.en` 必填；
   - `role`、`status: current`、`start_year`；
   - 可选：`title`、`affiliation`、`interests`、`email`、`website` 等。
5. 如需照片：上传到 `assets/people/`，文件名建议与成员 ID 一致，例如 `wei-zhang.webp`，或在 YAML 写 `photo: wei-zhang.webp`。
6. 提交 PR。

新成员不需要改任何程序代码；构建会自动把它放进 People 页。

## 4. 成员毕业（转到 Alumni）

**不要新建文件，也不要移动文件。** 直接修改原来的 `content/people/<成员-id>.yaml`：

```yaml
status: alumni
graduation_year: 2026
position:
  en: <毕业后第一份工作>
  zh: <毕业后第一份工作中文>
destination:
  en: <学校或公司>
  zh: <学校或公司中文>
# 可选
location:
  en: <城市，国家>
  zh: <城市，国家中文>
```

保存后，构建会自动把该成员从 People 移到 Alumni，并保留论文/荣誉关联。
如果 `start_year` 和 `graduation_year` 同时存在，毕业年份不能早于入学年份。

## 5. 添加一篇论文

论文分两步：题录和站内信息。

### 5.1 题录写进 BibTeX

编辑 `content/publications/publications.bib`（或新建 `content/publications/其他名字.bib`），
参照 `templates/publication.bib` 追加一条。例如：

```bibtex
@article{example-key-2026,
  author  = {Family, Given and Family, Given},
  title   = {An Example Paper Title},
  journal = {Journal Name},
  year    = {2026},
  volume  = {1},
  number  = {1},
  pages   = {1--10},
  doi     = {10.0000/example},
  url     = {https://example.org/paper}
}
```

要求：

- 花括号里的引用键（如 `example-key-2026`）就是论文 ID，**全站唯一，大小写保持原样**。
- 必须有 `title`、`author`、`year`。
- 期刊论文用 `journal`；会议论文用 `booktitle`；技术报告用 `institution`。
- 支持 `@article`、`@inproceedings`、`@misc`、`@techreport`，也支持 `@string` 和 `#` 拼接。
- 题目大小写会保留；LaTeX 重音（如 `M\"uller`）会自动转换。
- 不要把题目/作者再抄到别的地方。

### 5.2 站内信息写进 metadata

1. 复制 `templates/publication-metadata.yaml`。
2. 在 `content/publications/metadata/` 新建 `<引用键>.yaml`，**文件名必须和引用键完全一致**。
3. 填写：
   - `selected: true` 表示在首页“代表性论文”展示；
   - `order` 同一年内的排序；
   - `members`：参与成员 ID 列表（只写本站成员，不写外部合作者）；
   - `research`：关联研究方向 ID 列表；
   - 可选 `status`、`links.pdf/code/project`。

> 如果某位外部作者不是本站成员，不要为了显示而新建成员记录；正文/引用里保留其姓名即可。

### 5.3 在页面上筛选论文

Publications 页面顶部有四个下拉框，选项全部由已有数据自动生成，日常维护不需要改前端：

- **Year**：来自 BibTeX 的 `year`；
- **Author**：分“Lab members”和“Co-authors”两组，分别对应本站成员和外部合作者（按 BibTeX 作者匹配）；
- **Research area**：来自论文 metadata 的 `research`；
- **Type**：期刊论文（`journal`）或会议论文（`booktitle`）。

多个条件同时生效（AND），右侧显示“Showing X of Y”；点击 **Reset filters** 清空。
筛选状态不写进 URL，刷新页面回到全部论文，中英文切换会保留当前筛选。
从搜索或深链接打开某一篇论文时，页面会自动清除筛选并把该论文滚动到可见位置。
新增论文或成员后重新构建，下拉选项会自动更新；若某研究方向不出现，检查对应
metadata 的 `research` 是否写了该方向 ID。

## 6. 添加新闻

1. 复制 `templates/news.md`。
2. 在 `content/news/` 新建 `YYYY-MM-DD-<英文短名>.md`，例如 `2026-05-01-graduation.md`。
3. 文件里的 `date` 必须和文件名日期**完全一致**。
4. 填写 `title.en`（必填）、`title.zh`、可选 `summary`。
5. 正文用：

```markdown
## English

English text.

## 中文

中文正文。
```

6. 如果新闻对应一篇论文，填 `related_publications: [引用键]`，页面会自动带出论文链接；不要手写重复链接。
7. 图片（可选）放到 `assets/news/<新闻-id>/`，`image` 写 `<新闻-id>/<文件名>`。
8. 草稿写 `draft: true`；未来日期在 P0 不会自动定时发布，会给出警告并暂不展示。

新闻按日期倒序排列；同一天用 `order` 控制顺序。首页目前不自动展示新闻（该能力属于 P1）。

## 7. 添加研究方向、荣誉、相册

### 研究方向

复制 `templates/research.md` 到 `content/research/<方向-id>.md`：

- `title.en`、`summary.en`、正文英文必填；
- `icon` 可选 `network`、`agents`、`contour`；
- 关联论文不写在这里：在论文 metadata 的 `research` 里写方向 ID，页面会自动反向显示。

### 荣誉

复制 `templates/honor.yaml` 到 `content/honors/<荣誉-id>.yaml`：

- `date`、`title.en` 必填；
- 获奖成员用 `recipients: [成员-id]`；校外人员/团队用 `recipient_text`；
- 图片放到 `assets/honors/<荣誉-id>/`，`image` 写 `<荣誉-id>/<文件名>`。
- 当前 Honors 页没有数据；添加记录后重新构建即可显示。

### 相册

复制 `templates/gallery.yaml` 到 `content/gallery/<相册-id>.yaml`：

- `date`、`title.en`、至少一张 `photos`；
- 照片放到 `assets/gallery/<相册-id>/`，`file` 写 `<相册-id>/<文件名>`；
- 每张照片建议填写 `alt.en` / `alt.zh`；不填会用相册标题代替并给出警告；
- `cover` 必须是 `photos` 中的一张，不写则用第一张。
- 当前 Moments 页没有数据；添加相册后重新构建即可显示。

## 8. 图片：位置、命名与大小

| 用途 | 放哪里 | 在内容里怎么写 |
| --- | --- | --- |
| 成员照片 | `assets/people/` | `photo: <文件名>`，或自动匹配 `<成员-id>.webp` |
| 研究方向 | `assets/research/` | `image: <文件名>` |
| 新闻 | `assets/news/<新闻-id>/` | `image: <新闻-id>/<文件名>` |
| 荣誉 | `assets/honors/<荣誉-id>/` | `image: <荣誉-id>/<文件名>` |
| 相册 | `assets/gallery/<相册-id>/` | `photos[].file: <相册-id>/<文件名>` |

建议：

- 成员照片 4:5，小于 300KB；相册照片 4:3，小于 400KB。
- 统一用 WebP 或 JPEG；文件名用小写英文、数字、短横线。
- 服务器区分大小写，`Photo.JPG` 和 `photo.jpg` 不是同一个文件。
- 构建只复制被内容引用的图片；未被引用的图片不会进入网站。

## 9. 修改网站名称、学校、联系方式

编辑 `content/site.yaml`：

```yaml
name: DOCIA Lab
full_name:
  en: Lab of Decision, Optimization, and Control for Intelligent Agents
  zh: 决策、优化与控制实验室
url: https://docia.org
default_language: en
university:
  en: ShanghaiTech University
  zh: 上海科技大学
contact:
  name: Jie Lu
  email: lujie@shanghaitech.edu.cn
  school: { en: ..., zh: ... }
  office: { en: ..., zh: ... }
  address:
    street: { en: ..., zh: ... }
    city: { en: ..., zh: ... }
    postal_code: "201210"
    country: CN
  profile: https://...
  center: https://...
```

`url` 会用于 canonical、分享卡片、JSON-LD、sitemap，改域名时务必同步修改。
配色、导航文字、页面标题、首屏、交互实验参数不在这里，见 `config/presentation.yaml`
（一般不需要改）。

## 10. 提交前自检

如果本地有 Node.js 20+：

```bash
npm ci
npm run validate:content
npm run build
npm run dev       # 浏览器打开 http://127.0.0.1:8000
```

重点检查：

- 中英文切换后，标题/正文/姓名是否正常；
- 图片是否显示、路径大小写是否正确；
- 新闻/论文/成员是否出现在预期页面；
- 搜索里能否找到新内容；
- 手机宽度下是否没有横向滚动。

如果没有本地环境，也可以直接提 PR，GitHub 会自动运行同样的校验；
检查失败时按日志提示修改，不会发布到生产站点。

## 11. 常见错误

| 提示 | 原因 | 怎么改 |
| --- | --- | --- |
| `缺少中文`（警告） | 只写了 `en` | 补 `zh`，或确认暂时回退英文 |
| `新闻 date 与文件名日期不一致` | 文件名和 `date` 不同 | 改成同一天 |
| `论文 metadata 找不到对应引用键` | metadata 文件名和 `.bib` 引用键不一致 | 改成完全一致（含大小写） |
| `引用了不存在的成员/研究方向` | ID 拼错或记录被删 | 检查 `content/people/`、`content/research/` 的文件名 |
| `图片不存在` | 路径/大小写/目录不对 | 按第 8 节重新放图 |
| `未知字段` / `疑似拼写错误` | YAML 字段名写错 | 按模板和提示修正 |
| `公开记录不能引用草稿` | 正式内容关联了 `draft: true` 的记录 | 先把被引用记录改为正式，或去掉关联 |

## 12. 发布流程（负责人）

1. PR 的自动检查必须通过；
2. 负责人审核内容，确认没有编造信息、没有隐私/未确认招生信息；
3. 合并到 `main`；
4. 在本地拉取最新代码，运行 `npm ci && npm run validate:content && npm run build`；
5. 把生成的 `dist/` 同步到现有静态服务器，并验证线上页面；
6. 记录发布的 commit（发布记录见 `docs/DEPLOYMENT.md`）。

详见 [DEPLOYMENT.md](DEPLOYMENT.md)。
