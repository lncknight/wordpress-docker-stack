FROM nginx:1.19.0-alpine-perl

RUN apk update

# timezone
RUN apk add tzdata \
     && cp -r -f /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime

RUN apk --no-cache add apache2-utils bash

RUN apk add inotify-tools supervisor

# CMD "chmod +x /root/start.sh && /root/start.sh"
CMD ["bash", "/root/start.sh"]