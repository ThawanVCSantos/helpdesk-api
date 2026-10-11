import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiPath = path.resolve(__dirname, '../../../docs/openapi.yaml');
const file = fs.readFileSync(openapiPath, 'utf8');
const swaggerDocument = YAML.parse(file);

export function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
