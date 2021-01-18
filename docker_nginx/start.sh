#!/bin/bash

# nginx # nginx -g "daemon off;"
# echo 'starting NGINX'
# nginx

supervisord -c /etc/supervisord.conf

echo 'starting NGINX'
nginx -g "daemon off;"
# bash /root/watcher.sh