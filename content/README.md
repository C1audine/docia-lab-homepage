# 网站内容目录（content/）

这里存放网站的可编辑内容。**只改这里的文件，不要改 `dist/` 或任何 `.js` 程序文件。**
`dist/` 是构建产物；手工修改会在下一次构建时被覆盖。

## 内容放在哪里

| 想更新的内容 | 编辑文件 |
| --- | --- |
| 网站名称、页脚全名、学校、联系信息 | `content/site.yaml` |
| 首页显示哪些区块、显示几条 | `content/home.yaml` |
| 成员 / 校友 | `content/people/<成员-id>.yaml` |
| 论文题录 | `content/publications/publications.bib` |
| 论文是否精选、关联成员/研究方向 | `content/publications/metadata/<引用键>.yaml` |
| 研究方向 | `content/research/<方向-id>.md` |
| 新闻 | `content/news/YYYY-MM-DD-<英文短名>.md` |
| 荣誉 | `content/honors/<荣誉-id>.yaml` |
| 合影 | `content/gallery/<相册-id>.yaml` |
| 招生 / 加入我们 | `content/join-us/index.md`（P1 页面，当前为草稿） |

配色、导航文字、页面标题、首屏文案、交互实验参数等“外观与固定界面”放在
`config/presentation.yaml`，不属于日常内容更新。

## 三条通用规则

1. **中英双语**：短文字写成 `{ en: "English", zh: "中文" }`。中文可以暂时不写，
   构建会回退到英文并给出警告。英文必填。
2. **文件名就是稳定 ID**：小写英文、数字、短横线，例如 `jie-lu.yaml`、
   `2026-05-01-graduation.md`。论文的 ID 是 BibTeX 引用键（大小写保持原样）。
   一旦发布，不要改文件名；改名会破坏站内链接和关联。
3. **不要重复数据**：论文题目/作者/年份只在 `.bib` 写一次；新闻正文只在新闻
   Markdown 里写一次；首页不复制新闻或论文正文。

## 本地检查（推荐每次提交前运行）

```bash
npm ci                 # 第一次使用，或依赖更新后
npm run validate:content
npm run build
```

`validate:content` 会列出所有错误与警告，不会写文件；有错误时构建会失败，
不会覆盖上一次可用的 `dist/`。

更多说明：

- 面向日常维护人员：[docs/USER-GUIDE.md](../docs/USER-GUIDE.md)
- 面向开发者：[docs/DEVELOPER-GUIDE.md](../docs/DEVELOPER-GUIDE.md)
- 可复制的记录模板：[templates/](../templates/)
