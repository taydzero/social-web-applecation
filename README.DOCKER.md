# Docker Setup для Social Network

## Быстрый старт

### Production режим

1. Создайте файл `.env` в корне проекта (если его нет):
```env
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=web_social_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

2. Запустите все сервисы:
```bash
docker-compose up -d
```

3. Приложение будет доступно:
   - Фронтенд: http://localhost:3000
   - Бэкенд API: http://localhost:5000
   - PostgreSQL: localhost:5432

### Development режим

1. Запустите в режиме разработки:
```bash
docker-compose -f docker-compose.dev.yml up
```

2. Изменения в коде будут автоматически применяться (hot reload)

## Управление контейнерами

### Остановка
```bash
docker-compose down
```

### Остановка с удалением volumes (удалит данные БД)
```bash
docker-compose down -v
```

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Пересборка образов
```bash
docker-compose build --no-cache
```

## Структура сервисов

- **postgres**: PostgreSQL база данных
- **backend**: Node.js/Express бэкенд сервер
- **frontend**: React фронтенд (Nginx в production, dev server в development)

## Переменные окружения

Создайте `.env` файл в корне проекта:

```env
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=web_social_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

## Проблемы и решения

### Порт уже занят
Если порт 3000, 5000 или 5432 занят, измените порты в `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Вместо 3000:3000
```

### Ошибка подключения к БД
Убедитесь, что PostgreSQL контейнер запущен:
```bash
docker-compose ps
```

### Очистка всего
```bash
docker-compose down -v
docker system prune -a
```

