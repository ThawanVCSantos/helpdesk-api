import 'dotenv/config';

export function getDatabaseUrl() {
  const password = process.env.DATABASE_PASSWORD;
  if (!password) return '';

  const url = new URL(`postgresql://${process.env.DATABASE_HOST ?? 'localhost'}`);
  url.username = process.env.DATABASE_USER ?? 'helpdesk';
  url.password = password;
  url.port = process.env.DATABASE_PORT ?? '5432';
  url.pathname = `/${process.env.DATABASE_NAME ?? 'helpdesk'}`;

  return url.toString();
}
