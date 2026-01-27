# Dockerfile для бэкенда
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы
COPY . .

# Собираем TypeScript
RUN npm run build

# Создаем папку для загрузок
RUN mkdir -p uploads/avatars

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["npm", "start"]

