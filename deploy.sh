#!/bin/bash
# Деплой Термбург на сервер 89.23.96.172
# Использование: bash deploy.sh

set -e

SERVER="root@89.23.96.172"
REMOTE_DIR="/var/www/termburg.ceosivaev.ru"

echo "=== Сборка фронтенда ==="
cd frontend
npm run build

echo "=== Загрузка на сервер ==="
rsync -avz --delete build/ $SERVER:$REMOTE_DIR/

echo "=== Готово! ==="
echo "Сайт доступен: https://termburg.ceosivaev.ru"
