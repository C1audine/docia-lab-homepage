import { loadContent } from './lib/content.js';
import { buildSite } from './lib/builder.js';
import { Report } from './lib/report.js';

const report = new Report();
const model = await loadContent({ report });
for (const warning of report.warnings) console.warn(`⚠ ${warning.message}`);

if (report.hasErrors) {
  console.error(report.format());
  process.exit(1);
}

try {
  const result = await buildSite(model);
  console.log(`✓ 已生成 dist/（${result.files} 个文件）`);
  console.log(`  成员 ${model.public.people.length} · 论文 ${model.public.publications.length} · 研究方向 ${model.public.research.length} · 新闻 ${model.public.news.length} · 荣誉 ${model.public.honors.length} · 相册照片 ${model.public.gallery.reduce((n, album) => n + (album.photos?.length || 0), 0)}`);
} catch (error) {
  console.error(`✗ 构建失败：${error.message}`);
  console.error('  dist/ 中上一次成功构建的内容未被覆盖。');
  process.exit(1);
}
