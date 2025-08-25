# PaulClean Admin Panel

Админ-панель для управления клининговой компанией PaulClean, разработанная на React + TypeScript.

## 🚀 Возможности

- **Аутентификация**: Безопасный вход в систему с JWT токенами
- **Dashboard**: Обзор статистики заказов, услуг и уборщиков
- **Управление услугами**: Создание, редактирование и удаление услуг
- **Управление уборщиками**: Добавление и настройка персонала
- **Управление заказами**: Просмотр, изменение статусов и назначение уборщиков
- **Блоки ценообразования**: Гибкая система настройки цен для услуг
- **Адаптивный дизайн**: Работает на всех устройствах

## 🛠 Технологии

- **Frontend**: React 18 + TypeScript
- **Стилизация**: Tailwind CSS
- **Роутинг**: React Router v6
- **Формы**: React Hook Form
- **HTTP клиент**: Axios
- **Уведомления**: React Hot Toast
- **Иконки**: Lucide React
- **Графики**: Recharts
- **Сборка**: Vite

## 📋 Требования

- Node.js 18+ 
- npm или yarn

## 🚀 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd paulclean-admin
```

### 2. Установка зависимостей

```bash
npm install
# или
yarn install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Запуск в режиме разработки

```bash
npm run dev
# или
yarn dev
```

Приложение будет доступно по адресу: http://localhost:3000

### 5. Сборка для продакшена

```bash
npm run build
# или
yarn build
```

## 📱 Структура проекта

```
src/
├── api/           # API клиент и методы
├── components/    # Переиспользуемые компоненты
├── contexts/      # React контексты (Auth)
├── pages/         # Страницы приложения
├── types/         # TypeScript типы
├── App.tsx        # Главный компонент
├── main.tsx       # Точка входа
└── index.css      # Глобальные стили
```

## 🔐 Аутентификация

Система использует JWT токены для аутентификации:

1. **Вход**: `POST /api/admin/login`
2. **Токен доступа**: Автоматически добавляется к каждому запросу
3. **Автоматический выход**: При истечении токена

## 📊 API Endpoints

### Аутентификация
- `POST /api/admin/login` - Вход в систему

### Услуги
- `GET /api/admin/services` - Список услуг
- `POST /api/admin/services` - Создание услуги
- `PUT /api/admin/services/{id}` - Обновление услуги
- `DELETE /api/admin/services/{id}` - Удаление услуги

### Блоки ценообразования
- `GET /api/admin/services/{id}/pricing-blocks` - Список блоков
- `POST /api/admin/services/{id}/pricing-blocks` - Создание блока
- `PUT /api/admin/pricing-blocks/{id}` - Обновление блока
- `DELETE /api/admin/pricing-blocks/{id}` - Удаление блока

### Уборщики
- `GET /api/admin/cleaners` - Список уборщиков
- `POST /api/admin/cleaners` - Создание уборщика
- `PUT /api/admin/cleaners/{id}` - Обновление уборщика
- `DELETE /api/admin/cleaners/{id}` - Удаление уборщика

### Заказы
- `GET /api/admin/orders` - Список заказов
- `GET /api/admin/orders/{id}` - Детали заказа
- `PUT /api/admin/orders/{id}/status` - Изменение статуса
- `PUT /api/admin/orders/{id}/cleaner` - Назначение уборщика

## 🎨 Кастомизация

### Цветовая схема
Основные цвета настраиваются в `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    // ...
  }
}
```

### Стили компонентов
Глобальные стили компонентов в `src/index.css`:

```css
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}
```

## 🔧 Разработка

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте маршрут в `src/App.tsx`
3. Добавьте ссылку в навигацию `src/components/Layout.tsx`

### Добавление нового API метода

1. Добавьте метод в `src/api/client.ts`
2. Добавьте соответствующие типы в `src/types/index.ts`

## 🚀 Деплой

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Загрузите папку dist в Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Лицензия

MIT License

## 🤝 Поддержка

По вопросам разработки и поддержки обращайтесь к команде разработки.
