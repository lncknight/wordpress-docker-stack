#!/bin/bash
echo 'watching NGINX config'
while inotifywait -e close_write /etc/nginx/conf.d/*.conf /etc/nginx/conf.d/**/*.conf
do 
  nginx -s reload
  echo 'change detected, NGINX reloaded' > /dev/stdout
done