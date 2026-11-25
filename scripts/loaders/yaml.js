import { parseDocument } from 'yaml';

export function loadYaml(text, file, report) {
  let doc;
  try {
    doc = parseDocument(text, {
      prettyErrors: false,
      uniqueKeys: true,
      maxAliasCount: 100
    });
  } catch (error) {
    report.error(`YAML 读取失败：${error.message}`, { file });
    return null;
  }
  if (doc.errors.length) {
    for (const error of doc.errors) {
      const line = error.linePos?.[0]?.line || 0;
      report.error(`YAML 语法错误：${error.message}`, { file, line });
    }
    return null;
  }
  try {
    return doc.toJS({ maxAliasCount: 100 });
  } catch (error) {
    report.error(`YAML 转换为数据失败：${error.message}`, { file });
    return null;
  }
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
