# start
```
yarn start
```

# nginx config on front server
```
    server {
        listen 80;
        server_name YOUR_SITE;
    
        if ($http_x_forwarded_proto != "https"){
           return 301 https://$host$request_uri;
        }
        
        location / {
            proxy_pass http://localhost:32795;
            proxy_set_header        Host            $host;
            proxy_set_header        X-Real-IP       $remote_addr;
            proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    
    }
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
# dirty for for wordpress recognise https from reverse proxy
# ref: https://developer.wordpress.org/reference/functions/is_ssl/
$_SERVER['HTTPS'] = $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ? 'on' : 'off';

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
