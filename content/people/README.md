# 成员与校友（content/people/）

每位成员一个 YAML 文件，文件名是稳定 ID（如 `jie-lu.yaml`）。

- 在读成员：`status: current`
- 毕业/离开后：**继续使用同一个文件**，把 `status` 改成 `alumni`，补上
  `graduation_year`、`position`、`destination`、`location` 等字段。
  网站会自动把记录归入 Alumni 页，原有论文/荣誉关联和 URL 保持不变。
- 照片放在 `assets/people/`，在 `photo:` 写文件名（如 `jie-lu.webp`）。
  不写照片时显示姓名首字母头像。

角色枚举：`faculty`、`postdoc`、`phd`、`master`、`undergraduate`、`staff`、`visitor`。

完整字段见 `templates/person.yaml` 与 `docs/USER-GUIDE.md`。
