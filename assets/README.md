# 内容图片目录（assets/）

图片只放在这里，**不要**放进 `src/` 或 `dist/`。

| 目录 | 用途 | 命名建议 |
| --- | --- | --- |
| `assets/people/` | 成员照片 | `<成员-id>.webp`，4:5，建议小于 300KB |
| `assets/research/` | 研究方向配图 | 小写英文/短横线，WebP/JPEG |
| `assets/news/` | 新闻配图 | `assets/news/<新闻-id>/<文件名>` |
| `assets/honors/` | 荣誉配图 | `assets/honors/<荣誉-id>/<文件名>` |
| `assets/gallery/` | 相册照片 | `assets/gallery/<相册-id>/<文件名>`，4:3，建议小于 400KB |
| `assets/documents/` | 可公开下载的文档 | 只在确实需要时使用 |

构建只复制内容记录中实际引用到的图片；未被引用的文件不会进入 `dist/`。
服务器文件名区分大小写，请统一使用小写英文、数字和短横线。
