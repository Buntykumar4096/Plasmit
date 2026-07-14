FROM nginx:1.27-alpine
COPY index.html /usr/share/nginx/html/index.html
COPY swagger-initializer.js /usr/share/nginx/html/swagger-initializer.js
COPY openapi.yaml /usr/share/nginx/html/openapi.yaml
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
