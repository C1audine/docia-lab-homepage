# 课题组合影

把合影放在这个目录，然后在 `dist/site.config.js` 的 `gallery` 数组中按展示顺序填写：

```js
{
  id: "2026-spring-retreat",
  photo: "2026-spring-retreat.webp",
  date: "April 2026",
  title: "Spring retreat",
  caption: "A weekend of hiking and planning the year ahead.",
  credit: "Photo: Wei Zhang"
}
```

路径由配置中的 `media.gallery` 拼接，也可以写完整的 `https://` 地址。

- 首页展示数组中的前三张，`/#/gallery` 展示全部。
- 数组为空时，页面显示「Photos coming soon」占位提示。
- 推荐横版照片，比例约 4:3，单张不超过 400 KB。
