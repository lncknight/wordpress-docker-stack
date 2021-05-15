# start
```
yarn up
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

# trouble shoot
```
chmod -R 775 /var/www/html
chown -R www-data /var/www/
# trigger a submit on Permalinks spage
```

# manual import resource
## wordpress releases download
https://wordpress.org/download/releases/
```
cat wp-includes/version.php | grep -i wp_version
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

