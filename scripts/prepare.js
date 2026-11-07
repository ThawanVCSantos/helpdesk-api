import { spawnSync } from 'node:child_process';

if (process.env.LEFTHOOK !== '0') {
  const result = spawnSync('lefthook', ['install'], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
