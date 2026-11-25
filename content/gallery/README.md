# 合影（content/gallery/）

每本相册一个 YAML 文件，文件名是稳定 ID（如 `2026-spring-retreat.yaml`），
从 `templates/gallery.yaml` 复制。

- 日期使用 `"YYYY-MM-DD"`，按日期从新到旧显示。
- `photos` 至少一张；图片放在 `assets/gallery/<相册-id>/`。
- 每张图片建议写 `alt` 中英文说明；缺失时构建会给出警告并使用相册标题。
- 第一张照片默认作为封面。

当前线上相册为空，因此首页不显示 Moments 区块。添加相册并构建后会自动出现。
