# WP Plugins — аудит и обновление

Этот этап **требует SSH-доступа на Beget** и не может быть выполнен из IDE-сессии.
Ниже — точная инструкция для исполнителя.

## Доступы

```
SSH:    ssh -i ~/.ssh/beget_termburg <beget-user>@<beget-user>.beget.tech
Panel:  https://cp.beget.com  (логин / пароль — в парольном менеджере команды)
WP:     скрытый URL логина — в парольном менеджере (НЕ /wp-login.php — он заблокирован)
```

## Шаги (через WP-CLI на Beget)

WP-CLI на shared-хостинге Beget доступен через `php /path/to/wp-cli.phar` или
по прямому пути. Если не установлен — скачать:

```bash
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar ~/bin/wp
```

### 1. Полный бэкап перед любыми изменениями

```bash
cd ~/termburg.ru/public_html

# БД
wp db export ~/backups/termburg-db-$(date +%Y%m%d-%H%M).sql

# Файлы (только wp-content)
tar -czf ~/backups/termburg-wp-content-$(date +%Y%m%d-%H%M).tar.gz wp-content
```

### 2. Список всех плагинов с состоянием и обновлениями

```bash
wp plugin list --fields=name,status,update,version,update_version
```

Сохранить вывод в `~/audit-plugins-before.txt`.

### 3. Список деактивированных (кандидаты на удаление)

```bash
wp plugin list --status=inactive --fields=name,version
```

**Решение:** Удалять, если плагин:
- неактивен ≥ 3 месяцев,
- не используется ни одной активной темой/функционалом сайта,
- не содержит данных в БД, нужных другим частям сайта.

```bash
# Перед удалением — посмотреть в БД остатки опций
wp db query "SELECT option_name FROM wp_options WHERE option_name LIKE '%plugin_slug%'"

# Удаление (--deactivate если был активен)
wp plugin uninstall plugin-slug
```

### 4. Обновление активных плагинов

**Только на staging (termburg.ceosivaev.ru) сначала.**

```bash
# На staging:
cd /var/www/termburg.ceosivaev.ru
wp plugin update --all
wp cache flush
# Прогнать smoke-test: главная, /about, /pricing, /schedule, формы, оплата
```

Если staging работает корректно — повторить на проде:

```bash
# На проде (Beget):
cd ~/termburg.ru/public_html
wp plugin update --all --dry-run     # сначала dry-run
wp plugin update --all
wp cache flush
```

### 5. Проверка после обновления

```bash
# Общая проверка целостности
wp core verify-checksums
wp plugin verify-checksums --all

# Проверка ошибок PHP
tail -100 ~/termburg.ru/logs/error_log

# Smoke-test через curl
curl -I https://termburg.ru/
curl -I https://termburg.ru/about
curl -I https://termburg.ru/wp-json/termburg/v1/pricing
```

### 6. Откат при проблеме

```bash
# Восстановить БД
wp db import ~/backups/termburg-db-XXX.sql

# Восстановить файлы wp-content
cd ~/termburg.ru/public_html
rm -rf wp-content
tar -xzf ~/backups/termburg-wp-content-XXX.tar.gz
```

## Чек-лист исполнителя

- [ ] Сделан бэкап БД
- [ ] Сделан бэкап wp-content
- [ ] Сохранён `audit-plugins-before.txt`
- [ ] На staging обновлены все плагины
- [ ] На staging прогнан smoke-test (главная, /about, /pricing, формы, оплата)
- [ ] Если всё ОК — обновлены плагины на проде
- [ ] На проде прогнан smoke-test
- [ ] Сохранён `audit-plugins-after.txt`
- [ ] Деактивированные плагины удалены (или зафиксировано почему оставлены)
- [ ] Результат задокументирован в `wiki/projects/termburg/PLUGINS_AUDIT_RESULT.md`
