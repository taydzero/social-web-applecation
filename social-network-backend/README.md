# Social Network Backend

Backend сервер для социальной сети, построенный на Node.js, Express, TypeScript и TypeORM.

## Требования

- Node.js (версия 16 или выше)
- PostgreSQL (версия 12 или выше)
- npm или yarn

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` в корне проекта на основе `.env.example`:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=web_social_db

# JWT Secret Key (измените на случайную строку в продакшене)
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Server Port
PORT=5000

# Prisma Database URL (если используете Prisma)
DATABASE_URL=postgresql://admin:admin@localhost:5432/web_social_db
```

3. Убедитесь, что PostgreSQL запущен и создана база данных `web_social_db`:
```sql
CREATE DATABASE web_social_db;
```

4. Создайте папку для загрузки файлов (если её нет):
```bash
mkdir -p uploads/avatars
```

## Запуск

### Режим разработки
```bash
npm run dev
```

Сервер запустится на порту 5000 (или на порту, указанном в переменной окружения PORT).

### Сборка для продакшена
```bash
npm run build
npm start
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему

### Пользователи
- `GET /api/users/profile` - Получить профиль текущего пользователя (требует аутентификации)
- `GET /api/users/:id` - Получить профиль пользователя по ID (требует аутентификации)
- `POST /api/users/profile` - Обновить профиль пользователя с аватаром (требует аутентификации)

### Сообщения
- `GET /api/messages` - Получить все сообщения текущего пользователя (требует аутентификации)
- `GET /api/messages/:id` - Получить сообщения с конкретным пользователем (требует аутентификации)
- `POST /api/messages` - Отправить новое сообщение (требует аутентификации)
- `GET /api/messages/conversations` - Получить список всех пользователей, с которыми была переписка (требует аутентификации)

## Socket.io

Сервер также поддерживает WebSocket соединения через Socket.io для real-time сообщений:
- Подключение: `http://localhost:5000`
- Аутентификация через токен в `socket.handshake.auth.token`
- События:
  - `sendMessage` - Отправка сообщения
  - `receiveMessage` - Получение сообщения
  - `messageSent` - Подтверждение отправки сообщения

## Структура проекта

```
src/
├── config/          # Конфигурация базы данных
├── controllers/     # Контроллеры для обработки запросов
├── entities/        # TypeORM сущности
├── middlewares/     # Express middleware
├── routes/          # Маршруты API
├── types/           # TypeScript типы
├── utils/           # Утилиты
└── index.ts         # Точка входа приложения
```

## Технологии

- **Express** - Web framework
- **TypeScript** - Язык программирования
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - База данных
- **Socket.io** - WebSocket для real-time коммуникации
- **JWT** - Аутентификация
- **bcrypt** - Хеширование паролей
- **Multer** - Загрузка файлов

## Примечания

- В режиме разработки `synchronize: true` автоматически синхронизирует схему базы данных. В продакшене используйте миграции.
- Убедитесь, что JWT_SECRET изменен на безопасное значение в продакшене.
- CORS настроен для работы с фронтендом на `http://localhost:3000`. Измените настройки при необходимости.

