# Интеграция фронтенда и бэкенда

## Что было исправлено:

### 1. Формат данных
- ✅ Бэкенд теперь преобразует `id` → `_id` для совместимости с фронтендом
- ✅ Бэкенд преобразует `fromUser/toUser` → `from/to` в сообщениях
- ✅ Все контроллеры используют утилиту `responseFormatter` для единообразного формата

### 2. URL бэкенда
- ✅ Исправлен порт в `axiosConfig.ts` с 5432 (порт PostgreSQL) на 5000 (порт сервера)

### 3. Socket.io
- ✅ Socket.io теперь отправляет данные в формате, ожидаемом фронтендом (`_id`, `from/to`)

## Структура данных

### Пользователь (User)
```typescript
{
  _id: string,        // Преобразовано из id (number)
  name: string,
  email: string,
  bio?: string,
  avatar?: string,
  createdAt: string,  // ISO строка
  updatedAt: string   // ISO строка
}
```

### Сообщение (Message)
```typescript
{
  _id: string,        // Преобразовано из id (number)
  from: User,         // Преобразовано из fromUser
  to: User,           // Преобразовано из toUser
  content: string,
  timestamp: Date
}
```

## Проверка работы

### 1. Запуск бэкенда
```bash
cd social-network-backend
npm install
# Создайте .env файл из .env.example
npm run dev
```

### 2. Запуск фронтенда
```bash
# В корне проекта
npm install
npm start
```

### 3. Тестирование API

#### Регистрация
```bash
POST http://localhost:5000/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Логин
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Получение профиля
```bash
GET http://localhost:5000/api/users/profile
Headers: Authorization: Bearer <token>
```

#### Получение сообщений
```bash
GET http://localhost:5000/api/messages
Headers: Authorization: Bearer <token>
```

#### Отправка сообщения
```bash
POST http://localhost:5000/api/messages
Headers: Authorization: Bearer <token>
{
  "to": "2",  // ID получателя (строка или число)
  "content": "Привет!"
}
```

## Важные замечания

1. **ID пользователей**: Бэкенд использует числовые ID (PostgreSQL), но преобразует их в строки для фронтенда
2. **Токены JWT**: Токен должен передаваться в заголовке `Authorization: Bearer <token>`
3. **Формат дат**: Все даты преобразуются в ISO строки для фронтенда
4. **Socket.io**: Если используется Socket.io, формат данных уже совместим с фронтендом

## Возможные проблемы

### Проблема: "Пользователь не найден"
- Проверьте, что ID передается как строка или число
- Убедитесь, что пользователь существует в базе данных

### Проблема: "Не удалось загрузить сообщения"
- Проверьте, что токен валиден и передается в заголовках
- Убедитесь, что бэкенд запущен на порту 5000

### Проблема: CORS ошибки
- Проверьте настройки CORS в бэкенде (должен разрешать запросы с localhost:3000)

