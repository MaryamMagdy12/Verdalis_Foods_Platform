#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

composer install --no-dev --optimize-autoloader --no-interaction

php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan migrate --force

php artisan storage:link 2>/dev/null || true

echo "Build complete."
