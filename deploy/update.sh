#!/usr/bin/env bash
# Оновлення сайту на сервері: git pull → збірка → публікація статики в nginx.
# Запуск: ./deploy/update.sh (з будь-якої папки)
set -euo pipefail
cd "$(dirname "$0")/.."

WEB_ROOT="${WEB_ROOT:-/var/www/business-kit}"

# Node 22 через nvm (версія з .nvmrc), не чіпаючи системний Node інших проєктів
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use --silent >/dev/null
node -v | grep -qE '^v(2[2-9])\.' || { echo "Потрібен Node 22+: nvm install 22"; exit 1; }

[ -f .env ] || { echo "Немає .env: cp .env.example .env і вкажіть VITE_TELEGRAM_URL"; exit 1; }
grep -q 'your_username' .env && { echo "У .env досі your_username: вкажіть свій Telegram"; exit 1; }
[ -w "$WEB_ROOT" ] || { echo "Немає прав на $WEB_ROOT (див. README, розділ «Деплой»)"; exit 1; }

git pull --ff-only
npm ci --no-audit --no-fund
npm run build

# Атомарно для відвідувача: rsync оновлює лише змінені файли, старі видаляє
rsync -a --delete dist/ "$WEB_ROOT/"

# Чистота сервера: залежності потрібні лише на час збірки
rm -rf node_modules dist
npm cache clean --force >/dev/null 2>&1 || true

echo "Готово $(date '+%F %T'): $(find "$WEB_ROOT" -type f | wc -l) файлів у $WEB_ROOT"
