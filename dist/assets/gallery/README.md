# 课题组合影

把合影放在这个目录，然后在 `dist/site.config.js` 的 `gallery` 数组中按展示顺序填写：

```js
{
  id: "2026-spring-retreat",
  photo: "2026-spring-retreat.webp",
  date: { en: "April 2026", zh: "2026 年 4 月" },
  title: { en: "Spring retreat", zh: "春季团建" },
  caption: { en: "A weekend of hiking and planning the year ahead.", zh: "登山与年度规划的一个周末。" },
  credit: "Wei Zhang"
}
```

路径由配置中的 `media.gallery` 拼接，也可以写完整的 `https://` 地址。

- 首页展示数组中的前三张，`/#/gallery` 展示全部。
- 数组为空时，页面显示「照片即将上线 / Photos coming soon」占位提示。
- `credit` 只写人名，页面会自动加上「Photo:」前缀；人名不需要翻译。
- 除人名、文件名外，`date` / `title` / `caption` 都可写成 `{ en, zh }`，见主 README 第 7 节。
- 推荐横版照片，比例约 4:3，单张不超过 400 KB。
