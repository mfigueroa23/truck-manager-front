FROM nginx:1.29.8
COPY ./dist/truck-manager/browser /usr/share/nginx/html
