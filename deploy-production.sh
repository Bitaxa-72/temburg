#!/bin/bash
# ============================================================================
# Termburg — Production Deploy на Beget (termburg.ru)
# ============================================================================
#
# Что делает:
# 1. Собирает фронтенд (vite build + prerender статических HTML по маршрутам)
# 2. Создаёт snapshot текущей версии на сервере (на случай отката)
# 3. Загружает новый build/ через rsync с --delete (полная синхронизация)
# 4. НЕ трогает: wp-admin/, wp-content/, wp-includes/, wp-config.php, wp-index.php
# 5. После заливки — sanity-check: curl главной + одной prerender'енной страницы
#
# Зачем --delete:
# Без него на сервере накапливаются старые JS-чанки (AboutPage-AAA.js,
# AboutPage-BBB.js, AboutPage-CCC.js — каждая сборка добавляет новый файл
# с новым hash в имени). Клиент видит 11+ версий одного и того же файла.
# rsync --delete синхронизирует папку assets/ полностью.
#
# Использование:
#   bash deploy-production.sh                    # обычный деплой
#   bash deploy-production.sh --skip-build       # без сборки (если build/ уже свежий)
#   bash deploy-production.sh --rollback         # откатиться на предыдущий snapshot
# ============================================================================

set -euo pipefail

# Конфигурация Beget — значения читаются из переменных окружения или из deploy.env (см. deploy.env.example)
# Никогда не коммитьте реальные логины/хосты. Скопируйте deploy.env.example в deploy.env и заполните.
if [ -f "$(dirname "$0")/deploy.env" ]; then
  # shellcheck disable=SC1091
  source "$(dirname "$0")/deploy.env"
fi

SSH_KEY="${SSH_KEY:-$HOME/.ssh/beget_termburg}"
SSH_USER="${SSH_USER:?SSH_USER not set — заполните deploy.env}"
SSH_HOST="${SSH_HOST:?SSH_HOST not set — заполните deploy.env}"
REMOTE_DIR="${REMOTE_DIR:?REMOTE_DIR not set — заполните deploy.env}"
LOCAL_BUILD="${LOCAL_BUILD:-frontend/build}"

# Защищённые от удаления пути на сервере (WordPress)
PROTECTED=(
  "wp-admin"
  "wp-content"
  "wp-includes"
  "wp-config.php"
  "wp-index.php"
  "wp-login.php"
  "wp-cron.php"
  "wp-blog-header.php"
  "wp-comments-post.php"
  "wp-links-opml.php"
  "wp-load.php"
  "wp-mail.php"
  "wp-settings.php"
  "wp-signup.php"
  "wp-trackback.php"
  "xmlrpc.php"
  "readme.html"
  "license.txt"
)

# rsync exclude flags для защищённых путей
EXCLUDES=()
for p in "${PROTECTED[@]}"; do
  EXCLUDES+=("--exclude=$p")
done

# ----------------------------------------------------------------------------
# Парсинг аргументов
# ----------------------------------------------------------------------------
SKIP_BUILD=false
ROLLBACK=false
for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
    --rollback)   ROLLBACK=true ;;
    *) echo "Неизвестный аргумент: $arg"; exit 1 ;;
  esac
done

# ----------------------------------------------------------------------------
# Rollback
# ----------------------------------------------------------------------------
if [ "$ROLLBACK" = true ]; then
  echo "🔄 Rollback на предыдущую версию..."
  ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "
    set -e
    cd '$REMOTE_DIR/..'
    if [ ! -d snapshots/previous ]; then
      echo '❌ Snapshot не найден. Откат невозможен.'
      exit 1
    fi
    rsync -a --delete ${EXCLUDES[*]/#/} snapshots/previous/ '$REMOTE_DIR/'
    echo '✅ Откат выполнен.'
  "
  exit 0
fi

# ----------------------------------------------------------------------------
# Сборка
# ----------------------------------------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
  echo "📦 [1/5] Сборка фронтенда (vite build + prerender)..."
  cd frontend
  npm run build
  cd ..

  if [ ! -d "$LOCAL_BUILD" ]; then
    echo "❌ Папка $LOCAL_BUILD не создана. Прерываю."
    exit 1
  fi

  # Sanity-check: убедимся что в build/assets ровно один файл AboutPage-*.js
  ABOUT_COUNT=$(find "$LOCAL_BUILD/assets" -name "AboutPage-*.js" 2>/dev/null | wc -l)
  if [ "$ABOUT_COUNT" -gt 1 ]; then
    echo "⚠️  В локальной сборке $ABOUT_COUNT файлов AboutPage-*.js — ожидался 1."
    echo "    Это значит что Vite по какой-то причине разбил AboutPage на несколько чанков."
    echo "    Не критично, но после деплоя проверь что на сервере не больше."
  fi

  # Sanity-check: prerender создал /about/index.html и т.д.
  if [ ! -f "$LOCAL_BUILD/about/index.html" ]; then
    echo "❌ Prerender не сработал — нет $LOCAL_BUILD/about/index.html"
    echo "    Проверь scripts/prerender-meta.mjs"
    exit 1
  fi
  echo "✅ Сборка готова, prerender создал статические HTML"
fi

# ----------------------------------------------------------------------------
# Snapshot текущей версии (для rollback)
# ----------------------------------------------------------------------------
echo "📸 [2/5] Snapshot текущей версии..."
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "
  set -e
  mkdir -p '$REMOTE_DIR/../snapshots'
  if [ -d '$REMOTE_DIR/../snapshots/current' ]; then
    rm -rf '$REMOTE_DIR/../snapshots/previous'
    mv '$REMOTE_DIR/../snapshots/current' '$REMOTE_DIR/../snapshots/previous'
  fi
  mkdir -p '$REMOTE_DIR/../snapshots/current'
  rsync -a --delete '$REMOTE_DIR/' '$REMOTE_DIR/../snapshots/current/'
"
echo "✅ Snapshot создан"

# ----------------------------------------------------------------------------
# Загрузка новой версии
# ----------------------------------------------------------------------------
echo "📤 [3/5] Загрузка на сервер ($SSH_HOST)..."
rsync -avz --delete \
  "${EXCLUDES[@]}" \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_BUILD/" \
  "$SSH_USER@$SSH_HOST:$REMOTE_DIR/"

echo "✅ Файлы загружены"

# ----------------------------------------------------------------------------
# Sanity-check на сервере: один AboutPage-*.js
# ----------------------------------------------------------------------------
echo "🔍 [4/5] Проверка на сервере..."
REMOTE_ABOUT_COUNT=$(ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "find '$REMOTE_DIR/assets' -name 'AboutPage-*.js' 2>/dev/null | wc -l")
echo "    Файлов AboutPage-*.js на сервере: $REMOTE_ABOUT_COUNT"
if [ "$REMOTE_ABOUT_COUNT" -gt 2 ]; then
  echo "⚠️  Слишком много версий AboutPage — возможно --delete не сработал"
fi

# Проверка что .htaccess загружен
HTACCESS_OK=$(ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "test -f '$REMOTE_DIR/.htaccess' && echo yes || echo no")
echo "    .htaccess на месте: $HTACCESS_OK"

# Проверка что prerender'енные страницы загружены
ABOUT_HTML=$(ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "test -f '$REMOTE_DIR/about/index.html' && echo yes || echo no")
echo "    /about/index.html: $ABOUT_HTML"

# ----------------------------------------------------------------------------
# Smoke-test через curl
# ----------------------------------------------------------------------------
echo "🌐 [5/5] Smoke-test через curl..."
HOME_TITLE=$(curl -s https://termburg.ru/ | grep -oP '(?<=<title>)[^<]+' | head -1)
ABOUT_TITLE=$(curl -s https://termburg.ru/about | grep -oP '(?<=<title>)[^<]+' | head -1)
echo "    Главная title: $HOME_TITLE"
echo "    /about title:  $ABOUT_TITLE"

if [ "$HOME_TITLE" = "$ABOUT_TITLE" ]; then
  echo "❌ ОШИБКА: title главной и /about совпадают!"
  echo "    Это значит prerender или .htaccess не работают на проде."
  echo "    Проверь что .htaccess корректный и mod_rewrite включён."
  exit 1
fi

echo ""
echo "🎉 Деплой завершён успешно!"
echo "🌐 https://termburg.ru"
echo ""
echo "Откат: bash deploy-production.sh --rollback"
