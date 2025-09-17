# SSH Setup для GitHub Actions

## Проблема
GitHub Actions не может подключиться к серверу из-за неправильно настроенного SSH ключа.

## Решение

### 1. Генерация SSH ключа (если еще нет)

```bash
# На локальной машине
ssh-keygen -t rsa -b 4096 -C "github-actions@paulclean.com" -f ~/.ssh/paulclean_github_actions
```

### 2. Добавление публичного ключа на сервер

```bash
# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/paulclean_github_actions.pub root@165.22.43.35

# Или вручную:
cat ~/.ssh/paulclean_github_actions.pub | ssh root@165.22.43.35 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"
```

### 3. Настройка GitHub Secrets

Перейдите в настройки репозитория: `Settings` → `Secrets and variables` → `Actions`

Добавьте следующие секреты:

#### SERVER_SSH_KEY
```bash
# Скопируйте содержимое приватного ключа
cat ~/.ssh/paulclean_github_actions
```

**Важно:** Включите весь ключ, включая:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[содержимое ключа]
-----END OPENSSH PRIVATE KEY-----
```

#### SERVER_HOST
```
165.22.43.35
```

#### SERVER_USER
```
root
```

### 4. Проверка подключения

```bash
# Тест локального подключения
ssh -i ~/.ssh/paulclean_github_actions root@165.22.43.35 "echo 'SSH connection successful'"
```

### 5. Альтернативное решение (если ключ не работает)

Если проблемы продолжаются, можно использовать существующий ключ:

1. Найдите существующий SSH ключ, который работает с сервером
2. Скопируйте его содержимое в `SERVER_SSH_KEY`
3. Убедитесь, что ключ имеет права доступа к серверу

### 6. Отладка

Если проблемы продолжаются, проверьте:

1. **Права доступа на сервере:**
   ```bash
   ssh root@165.22.43.35 "ls -la ~/.ssh/"
   # authorized_keys должен иметь права 600
   # .ssh директория должна иметь права 700
   ```

2. **SSH сервис на сервере:**
   ```bash
   ssh root@165.22.43.35 "systemctl status ssh"
   ```

3. **Логи SSH:**
   ```bash
   ssh root@165.22.43.35 "tail -f /var/log/auth.log"
   ```

### 7. Формат ключа

Убедитесь, что ключ в GitHub Secrets имеет правильный формат:
- Начинается с `-----BEGIN OPENSSH PRIVATE KEY-----`
- Заканчивается `-----END OPENSSH PRIVATE KEY-----`
- Содержит переносы строк
- Не содержит лишних пробелов или символов

## После настройки

После правильной настройки SSH ключа, GitHub Actions должен успешно:
1. Подключиться к серверу
2. Загрузить архив
3. Выполнить деплой
4. Проверить доступность сайта
