# 论文内容（content/publications/）

论文分两层：

- `publications.bib`：**题录的唯一来源**（BibTeX）。题目、作者、年份、期刊/会议、
  DOI、URL、卷期页码都写在这里。
- `metadata/<引用键>.yaml`：只写站内关系，例如是否首页精选、关联哪些成员、
  关联哪个研究方向。**不要在这里重复题目、作者、年份、期刊或 DOI。**

## 添加一篇论文

1. 在 `publications.bib` 末尾粘贴 BibTeX 条目。引用键保持原样（例如
   `zhang2026consensus`），不要改成中文或空格。
2. 在 `metadata/` 新建 `zhang2026consensus.yaml`（文件名必须与引用键完全一致，
   包括大小写），从 `templates/publication-metadata.yaml` 复制。
3. 把 `selected` 设为 `true` 才会出现在首页精选论文；否则只出现在论文页。
4. `members` / `research` 里填成员 ID、研究方向 ID。填错会在构建时报错。
5. 运行 `npm run validate:content` 和 `npm run build`。

支持的 BibTeX 类型：`@article`、`@inproceedings`、`@misc`、`@techreport`。
支持 `@string`、`#` 拼接、多行字段、LaTeX 重音、花括号保护大小写。
不支持的结构会报错，不会静默丢弃。

## 排序

论文页按年份从新到旧；同一年按 `metadata` 里的 `order`（越小越靠前），
没有 `order` 的排在显式排序之后，再按引用键稳定排序。
当前线上顺序通过 `order: 1/2/3` 保持不变。
