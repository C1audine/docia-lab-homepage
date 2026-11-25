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
  await buildSite(model, { dataOnly: true });
  console.log('✓ 已生成 dist/site.config.js（兼容旧前端的数据文件）');
  console.log('  如需完整站点，请运行 npm run build。');
} catch (error) {
  console.error(`✗ 生成失败：${error.message}`);
  console.error('  dist/site.config.js 未被覆盖。');
  process.exit(1);
}
