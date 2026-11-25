// 统一的构建/校验问题收集与输出。
const LEVEL_ORDER = { error: 0, warn: 1, info: 2 };

export class Report {
  constructor() {
    this.issues = [];
  }

  add(level, message, { file = '', line = 0, record = '', field = '', fix = '' } = {}) {
    this.issues.push({ level, message, file, line, record, field, fix });
  }

  error(message, details = {}) {
    this.add('error', message, details);
  }

  warn(message, details = {}) {
    this.add('warn', message, details);
  }

  info(message, details = {}) {
    this.add('info', message, details);
  }

  get errors() {
    return this.issues.filter(issue => issue.level === 'error');
  }

  get warnings() {
    return this.issues.filter(issue => issue.level === 'warn');
  }

  get hasErrors() {
    return this.issues.some(issue => issue.level === 'error');
  }

  format({ includeInfo = false, color = process.stdout.isTTY } = {}) {
    const levels = includeInfo ? ['error', 'warn', 'info'] : ['error', 'warn'];
    const selected = this.issues
      .filter(issue => levels.includes(issue.level))
      .sort((a, b) =>
        LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] ||
        a.file.localeCompare(b.file) ||
        a.line - b.line ||
        a.message.localeCompare(b.message));
    if (!selected.length) return '';

    const labels = { error: '错误', warn: '警告', info: '提示' };
    const paint = {
      error: text => color ? `\x1b[31m${text}\x1b[0m` : text,
      warn: text => color ? `\x1b[33m${text}\x1b[0m` : text,
      info: text => color ? `\x1b[36m${text}\x1b[0m` : text
    };
    const counts = {
      error: this.errors.length,
      warn: this.warnings.length,
      info: this.issues.length - this.errors.length - this.warnings.length
    };
    const summary = levels
      .filter(level => counts[level] > 0)
      .map(level => `${labels[level]} ${counts[level]}`)
      .join(' · ');

    const lines = [selected.length ? `${summary}` : ''];
    for (const issue of selected) {
      const where = issue.file
        ? issue.file + (issue.line ? `:${issue.line}` : '') + (issue.record ? ` (${issue.record})` : '')
        : '';
      lines.push(`${paint[issue.level]('[' + labels[issue.level] + ']')} ${where}${where && issue.field ? ' · ' + issue.field : issue.field ? '[' + issue.field + ']' : ''}`);
      lines.push(`  ${issue.message}`);
      if (issue.fix) lines.push(`  修复：${issue.fix}`);
    }
    return lines.join('\n');
  }
}

export function describeSchemaErrors(errors = []) {
  return errors.map(error => {
    const path = error.instancePath ? error.instancePath.replace(/^\//, '').replace(/\//g, '.') : '(根)';
    const extra = error.params && Object.keys(error.params).length
      ? `（${Object.entries(error.params).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')}）`
      : '';
    return `${path}: ${error.message}${extra}`;
  });
}
