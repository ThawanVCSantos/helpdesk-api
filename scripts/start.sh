#!/bin/sh
set -e

echo "==> Executando migrations do banco..."
bun run db:deploy

echo "==> Executando seed inicial..."
bun run db:seed

echo "==> Iniciando Help Desk API..."
exec bun run start
