import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv from 'ajv';
import { describeSchemaErrors } from './report.js';
import { PATHS, readText } from './util.js';

let ajv = null;

export async function loadSchemas() {
  if (ajv) return ajv;
  ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
  const files = (await readdir(PATHS.schemas))
    .filter(name => name.endsWith('.schema.json'))
    .sort();
  for (const name of files) {
    const schema = JSON.parse(await readText(join(PATHS.schemas, name)));
    ajv.addSchema(schema, name);
  }
  return ajv;
}

export async function validateData(schemaId, data) {
  const instance = await loadSchemas();
  const validate = instance.getSchema(schemaId);
  if (!validate) throw new Error(`未注册 schema: ${schemaId}`);
  const valid = validate(data);
  return { valid, errors: valid ? [] : describeSchemaErrors(validate.errors) };
}
