# PaulClean Admin Frontend - Deployment Guide

Руководство по развертыванию админ-панели PaulClean.

## 🚀 Автоматический деплой

### GitHub Actions

Автоматический деплой настроен через GitHub Actions и срабатывает при пуше в ветку `main`.

**Workflow файл:** `.github/workflows/deploy.yml`

**Триггеры:**
- Push в ветку `main`
- Ручной запуск через GitHub Actions UI

**Процесс деплоя:**
1. Установка Node.js 18
2. Установка зависимостей (`npm ci`)
3. Запуск линтера (`npm run lint`)
4. Сборка приложения (`npm run build`)
5. Создание архива для деплоя
6. SSH подключение к серверу
7. Создание резервной копии
8. Остановка nginx
9. Очистка старой версии
10. Загрузка и извлечение новой версии
11. Установка прав доступа
12. Запуск nginx
13. Проверка доступности сайта

### Настройка GitHub Secrets

Для работы автоматического деплоя необходимо настроить следующие секреты в GitHub:

1. **SERVER_SSH_KEY** - Приватный SSH ключ для доступа к серверу
2. **SERVER_HOST** - IP адрес сервера (`165.22.43.35`)
3. **SERVER_USER** - Пользователь для SSH (`root`)

**Как добавить секреты:**
1. Перейдите в Settings репозитория
2. Выберите Secrets and variables → Actions
3. Нажмите "New repository secret"
4. Добавьте каждый секрет с соответствующим именем

## 🛠 Ручной деплой

### Предварительные требования

1. **Node.js 18+** установлен локально
2. **SSH ключ** настроен для доступа к серверу
3. **Права доступа** к серверу `165.22.43.35`

### Использование скрипта деплоя

```bash
# Деплой в staging (по умолчанию)
./scripts/deploy.sh

# Деплой в production
./scripts/deploy.sh production
```

### Пошаговый процесс

1. **Подготовка:**
   ```bash
   # Убедитесь, что находитесь в корне проекта
   cd paulclean-admin-front
   
   # Проверьте SSH подключение
   ssh root@165.22.43.35 "echo 'SSH connection successful'"
   ```

2. **Запуск деплоя:**
   ```bash
   # Сделайте скрипт исполняемым (если еще не сделано)
   chmod +x scripts/deploy.sh
   
   # Запустите деплой
   ./scripts/deploy.sh
   ```

3. **Проверка результата:**
   - Скрипт автоматически проверит доступность сайта
   - Откройте https://admin.paulcleanwa.com в браузере

## 📁 Структура сервера

```
/var/www/admin.paulcleanwa.com/     # Основная директория приложения
├── index.html                      # Главная страница
├── assets/                         # Статические ресурсы
│   ├── css/
│   └── js/
└── ...

/opt/backups/                       # Резервные копии
├── admin_frontend_20240115_143022/ # Автоматические бэкапы
└── ...
```

## 🔧 Конфигурация сервера

### Nginx конфигурация

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name admin.paulcleanwa.com;
    
    root /var/www/admin.paulcleanwa.com;
    index index.html;
    
    # SSL конфигурация (если используется)
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Основная конфигурация
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кэширование статических ресурсов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Права доступа

```bash
# Владелец и группа
chown -R www-data:www-data /var/www/admin.paulcleanwa.com

# Права доступа
chmod -R 755 /var/www/admin.paulcleanwa.com
```

## 🚨 Устранение неполадок

### Проблемы с деплоем

1. **SSH подключение не работает:**
   ```bash
   # Проверьте SSH ключ
   ssh-add -l
   
   # Проверьте подключение
   ssh -v root@165.22.43.35
   ```

2. **Ошибки сборки:**
   ```bash
   # Очистите кэш и переустановите зависимости
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Ошибки линтера:**
   ```bash
   # Запустите линтер с автоисправлением
   npm run lint:fix
   ```

4. **Проблемы с nginx:**
   ```bash
   # Проверьте статус nginx
   systemctl status nginx
   
   # Проверьте конфигурацию
   nginx -t
   
   # Перезапустите nginx
   systemctl restart nginx
   ```

### Восстановление из резервной копии

```bash
# Найдите нужную резервную копию
ls -la /opt/backups/admin_frontend_*

# Восстановите из резервной копии
cp -r /opt/backups/admin_frontend_YYYYMMDD_HHMMSS/* /var/www/admin.paulcleanwa.com/

# Установите права доступа
chown -R www-data:www-data /var/www/admin.paulcleanwa.com
chmod -R 755 /var/www/admin.paulcleanwa.com

# Перезапустите nginx
systemctl restart nginx
```

## 📊 Мониторинг

### Проверка статуса

```bash
# Статус nginx
systemctl status nginx

# Проверка доступности сайта
curl -I https://admin.paulcleanwa.com

# Логи nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Метрики

- **Время ответа:** < 200ms
- **Доступность:** 99.9%
- **Размер приложения:** ~2-5MB (сжато)

## 🔄 Обновления

### Обновление зависимостей

```bash
# Обновите зависимости
npm update

# Проверьте уязвимости
npm audit

# Исправьте уязвимости
npm audit fix
```

### Обновление конфигурации

1. Внесите изменения в код
2. Протестируйте локально: `npm run dev`
3. Запустите линтер: `npm run lint`
4. Соберите проект: `npm run build`
5. Задеплойте изменения

## 📝 Логи

### GitHub Actions логи

- Перейдите в Actions вкладку репозитория
- Выберите нужный workflow run
- Просмотрите детальные логи каждого шага

### Серверные логи

```bash
# Логи деплоя (если есть)
tail -f /var/log/deploy.log

# Логи nginx
tail -f /var/log/nginx/error.log
```

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи GitHub Actions
2. Проверьте статус сервера
3. Проверьте доступность сайта
4. Обратитесь к команде разработки

---

**Последнее обновление:** $(date +%Y-%m-%d)
