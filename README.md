# docker hub images
https://hub.docker.com/repository/docker/lncknight/wordpress

# upgrade blocker
- mysql8 - data directory not comptibale from 5.7 directly, it requires mysqldump
- php8 - many plugins not supported

# start
```
yarn up
```
# using external database
- ensure empty database initialise correctly

# newly setup
## use fresh database in docker

```sh
# comment out './mysql_data/data:/var/lib/mysql' amount
# comment out 'command: sh /root/scripts/start.sh' startup script

# start mysql from scratch
# copy mysql data to host
docker cp $MYSQL_CONTAINER_NAME:/var/lib/mysql mysql_data/data

# undo comment outs
# restart container
```
# use latest wordpress
```sh
cd wp
wget https://wordpress.org/latest.zip
unzip latest.zip
rm -rf latest.zip
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

## make sure wp-config.php is updated

# wp-config
modify wp-config.php to be like this
```
# dirty for for wordpress recognise https from reverse proxy
# ref: https://developer.wordpress.org/reference/functions/is_ssl/
$_SERVER['HTTPS'] = $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ? 'on' : 'off';

// Fix incorrect IP when using Cloudflare
if ( array_key_exists( 'HTTP_CF_CONNECTING_IP', $_SERVER ) ) { 
	$_SERVER['REMOTE_ADDR'] = $_SERVER['HTTP_CF_CONNECTING_IP']; 
}

// disable FTP
define('FS_METHOD','direct');

// database
define('DB_NAME', getenv('DB_NAME'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASSWORD', getenv('DB_PASSWD'));
define('DB_HOST', getenv('DB_HOST'));

define( 'DB_CHARSET', 'utf8mb4' ); // recommended
define( 'DB_COLLATE', '' );

```

# modx - config.inc.php
```
define('MODX_SERVER', getenv('DB_HOST'));
define('MODX_USER', getenv('DB_USER'));
define('MODX_PASSWORD', getenv('DB_PASSWD'));
define('MODX_DBASE', getenv('DB_NAME'));
define('MODX_SUBDIR', '');
```

# troubleshoot
## best practise permission
- ref: https://stackoverflow.com/questions/18352682/correct-file-permissions-for-wordpress

```
cd /var/www/html

chown www-data:www-data  -R * # Let Apache be owner
find . -type d -exec chmod 755 {} \;  # Change directory permissions rwxr-xr-x
find . -type f -exec chmod 644 {} \;  # Change file permissions rw-r--r--

chmod 440 wp-config.php 

# trigger a submit on Permalinks spage
```

# manual import resource
## wordpress releases download
https://wordpress.org/download/releases/
```
cat wp-includes/version.php | grep -i wp_version
```

# backup & restore

## backup
```sh

# IMPORTANT execute in project root, e.g. /data/wordpress.com/www/
cd PROEJCT_ROOT
FOLDER=wordpress
# FOLDER=data
SUFFIX=`date +"%Y%m%d_%H%M%S"`

mkdir -p restore/wp

yarn down

rsync -raph --stats --delete wp/$FOLDER/ restore/wp/$FOLDER-$SUFFIX
# db run 3 times
rsync -raph --stats --delete mysql_data/ restore/mysql_data-$SUFFIX

yarn up

```
## restore
```sh
# make sure target folder can be overwritten
cd PROEJCT_ROOT

yarn down

SUFFIX=20220930_110903
FOLDER=wordpress

rsync -raph --stats --delete restore/wp/$FOLDER-$SUFFIX/ wp/$FOLDER
rsync -raph --stats --delete restore/mysql_data-$SUFFIX/ mysql_data

yarn up
```


# TODO 2
- support exclude folders from backup script BACKUP_WP_EXCLUDE_FOLDERS
  DONE
- DB_USE_EXTERNAL
    not working
- support ARM & Graviton2 instance
    - ARM database: mariadb has more ARM supports
    - Wordpress starting 5.7 support PHP 8 (wp official container supported)
    - and NGINX for sure

# version
1.20220401.5 - use github CI
1.20230504.1 - backup change


