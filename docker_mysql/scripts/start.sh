#!/bin/bash
# aws credentials
[[ ! -d ~/.aws ]] && mkdir -p ~/.aws
echo "[default]
aws_access_key_id = ${BACKUP_AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${BACKUP_AWS_SECRET_ACCESS_KEY}
region=ap-southeast-1
output=json
" > ~/.aws/credentials && echo "written aws cli crendentials"

# cron
# ref: https://gist.github.com/athlan/b6f09977e2f5cf20840ef61ca3cda932
# ref: https://stackoverflow.com/questions/27771781/how-can-i-access-docker-set-environment-variables-from-a-cron-job/48651061
# sh ~/scripts/register_cron.sh
# cron env
# printenv | sed 's/^\(.*\)$/export \1/g' > /root/project_env.sh
# printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SYMFONY" > /root/project_env.sh
# chmod +x /root/project_env.sh

# backup script
npm i --prefix=/root/scripts

# supervisor
# supervisord -c /etc/supervisord.conf # mysql 8
supervisord -c /etc/supervisord.conf
# supervisorctl stop mysql
# [[ $DB_USE_EXTERNAL -eq "1" ]] && supervisorctl stop mysql

# sleep infinity