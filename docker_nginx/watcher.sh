#!/bin/bash
echo 'watching nginx config'
while inotifywait -e close_write /etc/nginx/conf.d/*.conf /etc/nginx/conf.d/**/*.conf
do 
  nginx -s reload
  echo 'reloaded' > /dev/stdout
done