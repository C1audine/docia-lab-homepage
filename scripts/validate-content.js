#!/usr/bin/env node
import process from 'node:process';
import { loadContent } from './lib/content.js';
import { Report } from './lib/report.js';

export async function validateContent({ quiet = false } = {}) {
  const report = new Report();
  const model = await loadContent({ report });
  if (!quiet) {
    if (model.site) {
      const counts = model.public;
      console.log(`内容统计：成员 ${counts.people.length} · 论文 ${counts.publications.length} · 研究方向 ${counts.research.length} · 新闻 ${counts.news.length} · 荣誉 ${counts.honors.length} · 相册照片 ${counts.gallery.reduce((sum, album) => sum + (album.photos?.length || 0), 0)}`);
    }
    const output = report.format();
    if (output) console.log(output);
  }
  return { report, model };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { report } = await validateContent();
  process.exit(report.hasErrors ? 1 : 0);
}
