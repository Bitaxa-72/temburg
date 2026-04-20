# Настройка серверной части (89.23.96.172)

## 1. Скрипт парсинга новостей

```bash
# Создать директорию
sudo mkdir -p /opt/termburg-news
sudo cp fetch-news.js /opt/termburg-news/

# Создать директорию для API
sudo mkdir -p /var/www/termburg.ceosivaev.ru/api

# Проверить работу
node /opt/termburg-news/fetch-news.js
cat /var/www/termburg.ceosivaev.ru/api/news.json | head -20
```

## 2. Cron (каждые 2 часа)

```bash
crontab -e
# Добавить:
0 */2 * * * /usr/bin/node /opt/termburg-news/fetch-news.js >> /var/log/termburg-news.log 2>&1
```

## 3. Nginx — добавить location для API

В конфиг `/etc/nginx/sites-available/termburg.ceosivaev.ru`:

```nginx
server {
    # ... существующая конфигурация ...

    # API для новостей (JSON)
    location /api/ {
        alias /var/www/termburg.ceosivaev.ru/api/;
        default_type application/json;
        add_header Cache-Control "public, max-age=3600";
        add_header Access-Control-Allow-Origin *;
    }

    # SPA fallback (должен быть последним)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Деплой фронтенда

```bash
# Локально (на Windows):
cd D:/Claude\ Code/termburg/frontend
npm run build
scp -r build/* root@89.23.96.172:/var/www/termburg.ceosivaev.ru/
```
