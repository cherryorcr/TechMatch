FROM node:22-alpine AS build

WORKDIR /app
COPY fronted/package*.json ./
RUN npm ci
COPY fronted ./
RUN npm run build

FROM nginx:1.27-alpine
COPY fronted/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
