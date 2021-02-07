#/bin/bash

# below security tests, expect all shouldn't to serve the actual content
curl -I localhost/.git/config
curl -I localhost/.gitignore
curl -I localhost/.vscode/settings.json
curl -I localhost/.htaccess
curl -I localhost/.env
curl -I localhost/docker-compose