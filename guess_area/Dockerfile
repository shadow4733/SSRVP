# Stage 1: Build React приложение
FROM node:18-alpine AS builder

WORKDIR /app

# Скопировать зависимости
COPY package*.json ./

# Установить зависимости
RUN npm ci

# Скопировать исходный код
COPY . .

# Собрать приложение
RUN npm run build

# Stage 2: Запустить с помощью nginx
FROM nginx:alpine

# Скопировать конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite складывает production-сборку в /app/dist
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
