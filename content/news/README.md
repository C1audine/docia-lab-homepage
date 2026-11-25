# 新闻（content/news/）

每条新闻一个 Markdown 文件，文件名格式 `YYYY-MM-DD-<英文短名>.md`，
其中日期必须与 front matter 的 `date` 完全一致。

- 正文按 `## English` / `## 中文` 两个二级标题分段；英文段必填。
- 新闻按日期从新到旧显示；同一天按 `order`（越小越靠前），再按文件名稳定排序。
- 关联论文写 `related_publications: [引用键]`，页面链接会自动使用论文的 URL。
- `display_date` 是可选的显示文本覆盖（例如只显示年份 `"2023"`），
  不写时使用 `date` 的日期。
- 图片放在 `assets/news/<新闻-id>/`。
- 草稿（`draft: true`）不会出现在页面上，也不会被搜索引擎收录。
