# start
```
yarn start
```

# shortcuts
use `yarn`

# IMPORTANT
## stop db
run below command, if it is using external db, e.g. RDS etc
```
yarn stop_db
```
## make sure wp-config.php is updated

# wp-config
modify wp-config.php to be like this
```
define('DB_NAME', getenv('DB_NAME'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASSWORD', getenv('DB_PASSWD'));
define('DB_HOST', getenv('DB_HOST'));
```

# TODO
- block access
  *.md
  *.sh
- BACKUP path from env  
- backup not working because cannot get root's env from crontab user
- docker_mysql folder
- .env
- nginx service
- wp data backup error, env not retrieved

# TODO 2
- support exclude folders from backup script BACKUP_WP_EXCLUDE_FOLDERS
  DONE
- DB_USE_EXTERNAL
    not working
